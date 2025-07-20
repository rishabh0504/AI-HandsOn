import os
import shutil
import tempfile
from fastapi import APIRouter, UploadFile, HTTPException
from langchain_ollama import ChatOllama, OllamaEmbeddings
from pydantic import BaseModel
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from app.core.logger_config import logger

# Setup global components
embeddings = OllamaEmbeddings(model="llama3.2")
llm = ChatOllama(model="llama3.2")

# Temporary in-memory FAISS store (you can persist to disk if needed)
vector_store = None

class ChatRequest(BaseModel):
    """Represents the request structure from a chat message."""
    query: str

class ChatResponse(BaseModel):
    """Represents the response structure returned from a chat message."""
    message: str
    status: str

rag_langchain_ai_chat_router = APIRouter(
    tags=["Document Search & Q&A Web App (Beginner)"], prefix="/rag-langchain-ai"
)

@rag_langchain_ai_chat_router.post("/upload-document", response_model=ChatResponse)
def upload_document(file: UploadFile) -> ChatResponse:
    """Upload a PDF document, embed it, and store it in FAISS vector store."""
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
        except Exception as e:
            pass
