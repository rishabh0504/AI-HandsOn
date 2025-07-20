from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.core.logger_config import logger
from langchain_ollama import ChatOllama
from datetime import datetime
import json
from pydantic import BaseModel

class ChatRequest(BaseModel):
    query: str

llm = ChatOllama(model="llama3.2")

langchain_ai_router = APIRouter(tags=["Langchain AI Router"], prefix="/langchain-ai")

@langchain_ai_router.post("/chat")
async def langchain_chat_conversation(payload: ChatRequest):
    logger.info(f"Initiating LangChain chat stream for: {payload.query}")
    messages = [{"role": "user", "content": payload.query}]

    def stream_generator():
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

    return StreamingResponse(stream_generator(), media_type="application/octet-stream")
