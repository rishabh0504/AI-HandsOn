# app/langchain_tools/web_search_tool.py

from langchain_core.tools import tool
from app.mcp.web_search_tool import perform_web_search

@tool
def web_search_tool(query: str) -> str:
    """Useful for answering questions about current events or information available on the web."""
    results = perform_web_search(query)
    formatted = "\n\n".join(
        f"{item['title']}\n{item['href']}\n{item['body']}" for item in results["results"]
    )
    return f"Web results for: {query}\n\n{formatted}"
