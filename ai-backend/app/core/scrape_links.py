import requests
from bs4 import BeautifulSoup

def scrape_url_content(url: str) -> dict:
    try:
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        title = soup.title.string if soup.title else "No title"
        description = ""
        desc_tag = soup.find("meta", attrs={"name": "description"})
        if desc_tag and desc_tag.get("content"):
            description = desc_tag["content"]
        else:
            p = soup.find("p")
            description = p.get_text() if p else "No description"
        return {"url": url, "title": title, "description": description}
    except Exception as e:
        return {"url": url, "title": "Failed to fetch", "description": str(e)}
