from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.core.logger_config import logger
from app.core.util import stream_generator
from app.schema.chat import ChatRequest
from app.core.common import llm

langchain_ai_router = APIRouter(tags=["Langchain AI Router"], prefix="/langchain-ai")


@langchain_ai_router.post("/chat")
async def langchain_chat_conversation(payload: ChatRequest):
    logger.info(f"Initiating LangChain chat stream for: {payload.query}")
    messages = [{"role": "user", "content": payload.query}]
    return StreamingResponse(
        stream_generator(llm, messages), media_type="application/octet-stream"
    )
