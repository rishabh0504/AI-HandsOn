import os
from fastapi import APIRouter, Query, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from langchain_ollama import ChatOllama
from pydantic import BaseModel
from app.core.logger_config import logger
import json
from datetime import datetime

from app.service.doc_processor_service import get_matched_content_from_vector_store
from app.service.document_service import handle_file_upload
from app.service.minio_service import list_files_in_bucket
from langchain_core.messages import SystemMessage, HumanMessage

llm = ChatOllama(model="gemma3:4b")
class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    message: str
    status: str

rag_langchain_ai_chat_router = APIRouter(
    tags=["Document Search & Q&A Web App (Beginner)"], prefix="/rag-langchain-ai"
)

def construct_chat_prompt(context: str, user_query: str) -> list:
    system_prompt = (
        "You are an expert assistant helping users with accurate and specific answers based on the provided documents. "
        "Always be direct and relevant to the user's question. If the answer is not available in the context, "
        "politely respond that the information is not currently available."
    )

    if context.strip():
        user_prompt = f"""
Please answer the following question using the context provided below. Be concise, specific, and directly relevant.

Context:
{context}

Question:
{user_query}

Answer:
"""
    else:
        user_prompt = f"""
The following question was asked:

Question:
{user_query}

There is no relevant information available in the provided documents. Politely inform the user that we do not currently have the requested information.
"""

    return [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt.strip())
    ]


@rag_langchain_ai_chat_router.post("/upload-document")
async def upload_document(file: UploadFile):
    if not file:
        logger.error("❌ File not provided in the request payload.")
        return {"status": 400, "message": "File not provided"}

    logger.info(f"🗂️ Attempting file upload to bucket")
    try:
        await handle_file_upload(file=file)
        return {"status": 201, "message": f"File name is {file.filename}."}
    except Exception as e:
        logger.error(f"❌ File upload failed for file '{file.filename}': {e}", exc_info=True)
        return {"status": 500, "message": "File upload failed"}

@rag_langchain_ai_chat_router.post("/chat")
def chat_with_document(request: ChatRequest):
   
    try:
        # Step 1: Perform vector similarity search
        retrieved_docs = get_matched_content_from_vector_store(request.query)

        # Step 2: Concatenate the content of retrieved documents
        context = "\n\n".join(doc.page_content for doc in retrieved_docs)

        if not context:
            return ChatResponse(message="No relevant content found in the document.", status="404")

        # Step 3: Ask the LLM with the context + user query
       
        messages = construct_chat_prompt(context,request.query)
        def stream_generator(messages):
            try:
                for chunk in llm.stream(messages):
                    if chunk.content:
                        data = {
                            "role": "assistant",
                            "response": chunk.content,
                            "created_at": datetime.now().isoformat(),
                            "done": False,
                            "model": "gemma3:4b",
                        }
                        yield json.dumps(data).encode("utf-8")

                final_data = {
                    "role": "assistant",
                    "response": "",
                    "created_at": datetime.now().isoformat(),
                    "done": True,
                    "model": "gemma3:4b",
                }
                yield json.dumps(final_data).encode("utf-8")
            except Exception as e:
                logger.error(f"Streaming error: {e}")
                error_data = {"error": str(e), "done": True}
                yield json.dumps(error_data).encode("utf-8")


        return StreamingResponse(stream_generator(messages), media_type="application/octet-stream")

    except Exception as e:
        logger.error("Error during chat: %s", str(e))
        raise HTTPException(status_code=500, detail="Error while processing the chat request.")
    

@rag_langchain_ai_chat_router.get("/list-files", summary="List files in MinIO bucket")
def get_files():
    bucket_name = os.getenv("MINIO_DOCUMENT_BUCKET")

    if not bucket_name:
        logger.error("MINIO_DOCUMENT_BUCKET env variable is not set")
        raise HTTPException(status_code=500, detail="Bucket configuration missing")

    logger.info(f"📁 Listing files from bucket: {bucket_name}")
    try:
        files = list_files_in_bucket(bucket_name=bucket_name)
        return {"status": 200, "data": files}
    except Exception as e:
        logger.exception("❌ File listing failed")
        raise HTTPException(status_code=500, detail="File listing failed")
    
@rag_langchain_ai_chat_router.post("/query", summary="Query into the vector database")
def get_query_items(query: str = Query(..., description="The natural language query to search in vector DB")):
    """
    Query the vector store using a natural language query and return matching results.
    """
    logger.info(f"📁 Reading the vector database for query: {query}")

    try:
        vector_db_response = get_matched_content_from_vector_store(query)

        return {
            "status": "success",
            "data": vector_db_response
        }

    except Exception as e:
        logger.exception("❌ Reading the vector database failed")
        raise HTTPException(status_code=500, detail="Reading the vector database failed")
