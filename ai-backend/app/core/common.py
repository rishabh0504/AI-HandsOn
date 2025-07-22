import os
from langchain_ollama import ChatOllama
llm = ChatOllama(model="gemma3:4b", base_url=os.getenv("OLLAMA_HOST"))
