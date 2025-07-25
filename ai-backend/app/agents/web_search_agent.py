import os
from langchain_ollama import ChatOllama
from langchain.agents import initialize_agent, AgentType
from app.langchain_tools.web_search_tool import web_search_tool

# Initialize the Ollama LLM
llm = ChatOllama(
    model="gemma3:4b",  # adjust model name if needed
    base_url=os.getenv("OLLAMA_HOST", "http://192.168.1.20:11434")
)

# Initialize the agent with the LLM and your tool
agent_executor = initialize_agent(
    tools=[web_search_tool],
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)
