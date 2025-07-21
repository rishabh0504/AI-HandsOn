import os
from fastapi import APIRouter, Query, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from app.core.logger_config import logger
from app.core.common import llm
from app.core.util import construct_chat_prompt, stream_generator
from app.schema.chat import ChatRequest, ChatResponse
from app.service.doc_processor_service import get_matched_content_from_vector_store
from app.service.document_service import handle_file_upload
from app.service.minio_service import list_files_in_bucket

rag_langchain_ai_chat_router = APIRouter(
    tags=["Document Search & Q&A Web App (Beginner)"], prefix="/rag-langchain-ai"
)


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
        logger.error(
            f"❌ File upload failed for file '{file.filename}': {e}", exc_info=True
        )
        return {"status": 500, "message": "File upload failed"}


@rag_langchain_ai_chat_router.post("/chat")
def chat_with_document(request: ChatRequest):
    try:
        # Step 1: Perform vector similarity search
        retrieved_docs = get_matched_content_from_vector_store(request.query)

        # Step 2: Concatenate the content of retrieved documents
        context = "\n\n".join(doc.page_content for doc in retrieved_docs)

        if not context:
            return ChatResponse(
                message="No relevant content found in the document.", status="404"
            )

        # Step 3: Ask the LLM with the context + user query
        messages = construct_chat_prompt(context, request.query)
        return StreamingResponse(
            stream_generator(llm, messages), media_type="application/octet-stream"
        )

    except Exception as e:
        logger.error("Error during chat: %s", str(e))
        raise HTTPException(
            status_code=500, detail="Error while processing the chat request."
        )


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
def get_query_items(
    query: str = Query(
        ..., description="The natural language query to search in vector DB"
    )
):
    """
    Query the vector store using a natural language query and return matching results.
    """
    logger.info(f"📁 Reading the vector database for query: {query}")

    try:
        vector_db_response = get_matched_content_from_vector_store(query)

        return {"status": "success", "data": vector_db_response}

    except Exception as e:
        logger.exception("❌ Reading the vector database failed")
        raise HTTPException(
            status_code=500, detail="Reading the vector database failed"
        )
