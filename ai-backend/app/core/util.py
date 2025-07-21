from datetime import datetime
from app.core.logger_config import logger
import json
from langchain_core.messages import SystemMessage, HumanMessage


def stream_generator(llm, messages):
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
        HumanMessage(content=user_prompt.strip()),
    ]
