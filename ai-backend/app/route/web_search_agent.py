# app/route/web_search_agent.py

from fastapi import APIRouter
from pydantic import BaseModel
from app.agents.web_search_agent import agent_executor

agentic_web_router = APIRouter(prefix="/agentic-web", tags=["Agentic Web Search"])

class AgentRequest(BaseModel):
    query: str

@agentic_web_router.post("/")
def run_web_agent(request: AgentRequest):
    response = agent_executor.run(request.query)
    return {"response": response}
