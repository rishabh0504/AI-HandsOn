import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pathlib import Path
from sentence_transformers import SentenceTransformer
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from app.core.logger_config import logger
import json
from datetime import datetime
from langchain.embeddings.base import Embeddings

MODEL_DIR = Path(__file__).resolve().parent.parent.parent / "models" / "all-MiniLM-L6-v2"

# ✅ Custom embedding wrapper
class CustomSentenceTransformerEmbeddings(Embeddings):
    def __init__(self, model_path):
        self.model = SentenceTransformer(model_path)

    def embed_documents(self, texts):
        return self.model.encode(texts, convert_to_numpy=True).tolist()

    def embed_query(self, text):
        return self.model.encode(text, convert_to_numpy=True).tolist()

# ✅ Load your local model
embeddings = CustomSentenceTransformerEmbeddings(str(MODEL_DIR))

# Optional: You can still keep Ollama for LLM generation
from langchain_ollama import ChatOllama
llm = ChatOllama(model="llama3.2")

vector_store = None

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    message: str
    status: str

rag_langchain_ai_chat_router = APIRouter(
    tags=["Document Search & Q&A Web App (Beginner)"], prefix="/rag-langchain-ai"
)

@rag_langchain_ai_chat_router.post("/upload-document", response_model=ChatResponse)
def upload_document(file: UploadFile) -> ChatResponse:
    if not file:
        raise HTTPException(status_code=400, detail="No file attached")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            temp_file_path = tmp_file.name

        logger.info(f"Uploaded file saved to: {temp_file_path}")

        loader = PyPDFLoader(temp_file_path)
        docs = loader.load()
        full_content = "".join(doc.page_content for doc in docs)

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            length_function=len,
        )
        texts = text_splitter.split_text(full_content)

        if not texts:
            raise HTTPException(status_code=400, detail="No text could be extracted.")

        global vector_store
        vector_store = FAISS.from_texts(texts, embeddings)
        logger.info("Embedded and stored %d chunks", len(texts))

        return ChatResponse(message="File uploaded successfully", status="200")

    except Exception as e:
        logger.error("Error while uploading document: %s", str(e))
        raise HTTPException(status_code=500, detail="Failed to upload and process file.")

    finally:
        try:
            os.remove(temp_file_path)
        except Exception:
            pass

@rag_langchain_ai_chat_router.post("/chat")
def chat_with_document(request: ChatRequest):
    if not vector_store:
        raise HTTPException(status_code=400, detail="No document uploaded yet.")

    try:
        # Step 1: Perform vector similarity search
        retrieved_docs = vector_store.similarity_search(request.query, k=3)

        # Step 2: Concatenate the content of retrieved documents
        context = "\n\n".join(doc.page_content for doc in retrieved_docs)

        if not context:
            return ChatResponse(message="No relevant content found in the document.", status="404")

        # Step 3: Ask the LLM with the context + user query
        prompt = f"""You are a helpful assistant. Use the following context to answer the question.

                Context:
                {context}

                Question:
                {request.query}

                Answer:
        """
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ]
        def stream_generator(messages):
            try:
                for chunk in llm.stream(messages):
                    if chunk.content:
                        data = {
                            "role": "assistant",
                            "response": chunk.content,
                            "created_at": datetime.now().isoformat(),
                            "done": False,
                            "model": "llama3.2",
                        }
                        yield json.dumps(data).encode("utf-8")

                final_data = {
                    "role": "assistant",
                    "response": "",
                    "created_at": datetime.now().isoformat(),
                    "done": True,
                    "model": "llama3.2",
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
