# app/mcp/web_search_tool.py
from duckduckgo_search import DDGS

def perform_web_search(query: str, max_results: int = 5):
    with DDGS() as ddgs:
        results = ddgs.text(query, max_results=max_results)
        return {
            "query": query,
            "results": results,
            "total": len(results)
        }
