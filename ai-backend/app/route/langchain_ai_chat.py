from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.core.logger_config import logger
from langchain_ollama import ChatOllama
from datetime import datetime
import json
from pydantic import BaseModel

class ChatRequest(BaseModel):
    query:str


llm = ChatOllama(model="llama3.2")

langchain_ai_router = APIRouter(
    tags=["Langchain AI Router"], prefix="/langchain-ai"
)

@langchain_ai_router.post("/chat")
async def langchain_chat_conversation(payload : ChatRequest):
    logger.info(f"Initiating the langchain AI content :: {payload.query}")
    messages = [
        {"role": "user", "content": payload.query}
    ]

    def event_stream():
        full_content = ""
        try:
            for chunk in llm.stream(messages):
                if chunk.content:
                    full_content += chunk.content
                    data = {
                        "role": "assistant",
                        "content": full_content,
                        "created_at": datetime.now().isoformat(),
                        "files": [],
                        "done": False,
                        "model": "llama3.2",
                    }
                    yield f"data: {json.dumps(data)}\n\n"

            # Send final "done" message
            final_data = {
                "role": "assistant",
                "content": full_content,
                "created_at": datetime.now().isoformat(),
                "files": [],
                "done": True,
                "model": "llama3.2",
            }
            yield f"data: {json.dumps(final_data)}\n\n"

        except Exception as e:
            logger.error(f"LLM streaming failed: {e}")
            error_data = {"error": str(e), "done": True}
            yield f"data: {json.dumps(error_data)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
