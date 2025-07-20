from fastapi import APIRouter, UploadFile
from langchain_ollama import ChatOllama
from pydantic import BaseModel


class ChatRequest(BaseModel):
    query: str


llm = ChatOllama(model="llama3.2")

rag_langchain_ai_chat_router = APIRouter(
    tags=["Document Search & Q&A Web App (Beginner)"], prefix="/rag-langchain-ai"
)


@rag_langchain_ai_chat_router.post("/upload-doument")
def upload_document(file: UploadFile):
    if not file:
        return {"message": "File not attached"}
    pass
