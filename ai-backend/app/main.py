from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.route import langchain_ai_chat, rag_langchain_ai_chat

app = FastAPI(
    debug=True,
    title="AI HandsOn",
    description="AI based application hands on implementation",
    version="1.0.0",
    root_path="/api",
)
origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(langchain_ai_chat.langchain_ai_router)
app.include_router(rag_langchain_ai_chat.rag_langchain_ai_chat_router)


@app.get("/")
def health_test():
    return {"message": "Server is running"}
