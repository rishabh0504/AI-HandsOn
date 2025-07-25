import logging
import os

from fastapi import APIRouter, Query
from langgraph.prebuilt import create_react_agent
from langchain_ollama import ChatOllama

from app.mcp.web_search_tool import perform_web_search
from app.core.scrape_links import scrape_url_content

# === Logger Configuration ===
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Console Handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] %(name)s: %(message)s")
console_handler.setFormatter(formatter)

# Add handler to logger if not already added (to avoid duplicates)
if not logger.handlers:
    logger.addHandler(console_handler)

# === Router Configuration ===
web_search_graph_router = APIRouter(prefix="/web-search-graph", tags=["Web Search Graph"])

# === LLM Setup ===
OLLAMA_HOST = os.getenv("OLLAMA_HOST")
llm = ChatOllama(model="llama3.1:8b", base_url=OLLAMA_HOST)

# === Tools ===
def search_tool(query: str) -> list[str]:
    """
    Perform a web search for the given query using the custom search function.
    Returns a list of up to 5 top URLs from the search results.
    """
    logger.info(f"Performing web search for query: '{query}'")
    try:
        results = perform_web_search(query)
        urls = []
        if isinstance(results, list):
            urls = [res.get("href") for res in results if "href" in res]
        else:
            urls = [item.get("href") for item in results.get("results", []) if "href" in item]
        top_urls = urls[:5]
        logger.info(f"Found top {len(top_urls)} URLs: {top_urls}")
        return top_urls
    except Exception as e:
        logger.error(f"Error in search_tool: {e}", exc_info=True)
        return []

def scrape_tool(urls: list[str]) -> list[dict]:
    """
    Given a list of URLs, scrape the main content from each page and return a list of content dictionaries.
    """
    logger.info(f"Scraping {len(urls)} URLs")
    try:
        contents = [scrape_url_content(url) for url in urls[:3]]  # scrape top 3 only
        logger.info("Scraping completed")
        return contents
    except Exception as e:
        logger.error(f"Error in scrape_tool: {e}", exc_info=True)
        return []

# === Agent Setup ===
agent = create_react_agent(
    model=llm,
    tools=[search_tool, scrape_tool],
    prompt="You are a helpful assistant that first searches the web then scrapes content from top results.",
    debug=True
)

# === Endpoint ===
@web_search_graph_router.get("/")
async def web_search_graph(query: str = Query(..., description="Search query")):
    logger.info(f"Received web search request for query: '{query}'")
    messages = [{"role": "user", "content": f"Search and scrape content for query: {query}"}]
    try:
        result = agent.invoke({"messages": messages})
        logger.info("Agent execution completed successfully")
        return {"result": result}
    except Exception as e:
        logger.error(f"Error while running agent: {e}", exc_info=True)
        return {"error": "Internal server error"}
