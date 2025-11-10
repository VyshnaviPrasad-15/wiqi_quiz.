import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from typing import Tuple


WIKI_DOMAINS = ("en.wikipedia.org", "wikipedia.org")


def scrape_wikipedia(url: str) -> Tuple[str, str]:
	"""Return (title, clean_text). Raises ValueError for non-wikipedia URLs or fetch errors."""
	parsed = urlparse(url)
	if not parsed.netloc.endswith("wikipedia.org"):
		raise ValueError("Only Wikipedia URLs are supported in this scraper.")

	resp = requests.get(url, headers={"User-Agent": "ai-quiz-generator/1.0"}, timeout=15)
	resp.raise_for_status()

	soup = BeautifulSoup(resp.text, "html.parser")

	# Title
	title_tag = soup.find(id="firstHeading")
	title = title_tag.get_text(strip=True) if title_tag else (soup.title.string if soup.title else "Untitled")

	# Main content area (mw-content-text)
	content_div = soup.find(id="mw-content-text")
	if not content_div:
		# fallback: try main content
		content_div = soup.find("div", class_="mw-parser-output")

	if not content_div:
		raise ValueError("Unable to locate main article content")

	# Remove tables, navboxes, superscripts (references), and edit links
	for selector in content_div.select("table, .infobox, .navbox, .vertical-navbox, .toc, sup, .reference, .mw-editsection"):
		selector.decompose()

	# Extract visible paragraphs
	paragraphs = [p.get_text(" ", strip=True) for p in content_div.find_all("p")]
	# Filter out short paragraphs
	paragraphs = [p for p in paragraphs if len(p) > 40]
	clean_text = "\n\n".join(paragraphs)

	return title, clean_text