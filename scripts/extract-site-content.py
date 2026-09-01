#!/usr/bin/env python3
"""Create a section-by-section writing inventory for accuprointernational.co.id.

The crawler starts with every WordPress sitemap URL, adds Indonesian, English,
and Chinese variants, then follows same-domain HTML links that are not assets or
WordPress infrastructure. Output is deliberately text-first: it records every
top-level HTML section, text outside sections (navigation/footer included), and
copy stored in useful HTML attributes such as image alt text and form placeholders.
"""

from __future__ import annotations

import concurrent.futures
import hashlib
import html
import json
import re
import shutil
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable


BASE_URL = "https://accuprointernational.co.id/"
HOST = "accuprointernational.co.id"
LANGUAGES = ("id", "en", "ch")
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "content-recap"
USER_AGENT = "Mozilla/5.0 (compatible; AccuproContentInventory/1.0; owner-authorized)"
MAX_URLS = 500
MAX_WORKERS = 8
TIMEOUT = 35

BLOCK_TAGS = {
    "address", "article", "aside", "blockquote", "br", "button", "caption",
    "dd", "details", "div", "dl", "dt", "fieldset", "figcaption", "figure",
    "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr",
    "label", "legend", "li", "main", "nav", "ol", "option", "p", "pre",
    "summary", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul",
}
IGNORED_TAGS = {"script", "style", "noscript", "template", "svg", "canvas"}
SKIP_PATH_PREFIXES = (
    "/wp-admin/", "/wp-content/", "/wp-includes/", "/wp-json/",
)
SKIP_PATH_PARTS = ("/feed/", "/comments/", "/trackback/")
ASSET_EXTENSIONS = {
    ".7z", ".avi", ".css", ".csv", ".doc", ".docx", ".eot", ".gif", ".gz",
    ".ico", ".jpeg", ".jpg", ".js", ".json", ".m4a", ".mov", ".mp3", ".mp4",
    ".mpeg", ".ogg", ".otf", ".pdf", ".png", ".rar", ".rss", ".svg", ".tar",
    ".tif", ".tiff", ".ttf", ".txt", ".wav", ".webm", ".webp", ".woff",
    ".woff2", ".xls", ".xlsx", ".xml", ".zip",
}


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(value or "")).strip()


def normalize_url(value: str, base: str = BASE_URL) -> str | None:
    if not value:
        return None
    value = value.strip()
    if value.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    absolute = urllib.parse.urljoin(base, value)
    parsed = urllib.parse.urlsplit(absolute)
    if parsed.scheme not in {"http", "https"} or parsed.hostname != HOST:
        return None
    path = urllib.parse.unquote(parsed.path or "/")
    path = re.sub(r"/{2,}", "/", path)
    if any(path.startswith(prefix) for prefix in SKIP_PATH_PREFIXES):
        return None
    if any(part in path for part in SKIP_PATH_PARTS):
        return None
    if Path(path.rstrip("/")).suffix.lower() in ASSET_EXTENSIONS:
        return None
    if path != "/" and not path.endswith("/"):
        path += "/"
    return urllib.parse.urlunsplit(("https", HOST, path, "", ""))


def language_for_url(url: str) -> str:
    path = urllib.parse.urlsplit(url).path
    if path == "/en" or path.startswith("/en/"):
        return "en"
    if path == "/ch" or path.startswith("/ch/"):
        return "ch"
    return "id"


def language_variant(url: str, language: str) -> str:
    parsed = urllib.parse.urlsplit(url)
    path = parsed.path
    if re.match(r"^/(en|ch)(/|$)", path):
        path = re.sub(r"^/(en|ch)(?=/|$)", "", path) or "/"
    if language != "id":
        path = f"/{language}{path}"
    return normalize_url(urllib.parse.urlunsplit(("https", HOST, path, "", ""))) or url


@dataclass
class FetchResult:
    requested_url: str
    final_url: str
    status: int
    content_type: str
    body: bytes
    error: str | None = None


def fetch(url: str, attempts: int = 3) -> FetchResult:
    last_error = "unknown error"
    parsed_url = urllib.parse.urlsplit(url)
    request_target = urllib.parse.urlunsplit((
        parsed_url.scheme,
        parsed_url.netloc.encode("idna").decode("ascii"),
        urllib.parse.quote(urllib.parse.unquote(parsed_url.path), safe="/%:@"),
        urllib.parse.quote_plus(parsed_url.query, safe="=&%"),
        "",
    ))
    for attempt in range(attempts):
        request = urllib.request.Request(
            request_target,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "id,en;q=0.9,zh;q=0.8",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
                return FetchResult(
                    requested_url=url,
                    final_url=response.geturl(),
                    status=response.status,
                    content_type=response.headers.get("Content-Type", ""),
                    body=response.read(),
                )
        except urllib.error.HTTPError as exc:
            body = exc.read()
            # HTTP errors are still valuable audit records; retry only server errors.
            if exc.code < 500 or attempt == attempts - 1:
                return FetchResult(
                    requested_url=url,
                    final_url=exc.geturl(),
                    status=exc.code,
                    content_type=exc.headers.get("Content-Type", ""),
                    body=body,
                    error=f"HTTP {exc.code}",
                )
            last_error = f"HTTP {exc.code}"
        except Exception as exc:  # network/TLS/timeouts
            last_error = f"{type(exc).__name__}: {exc}"
        if attempt < attempts - 1:
            time.sleep(0.5 * (attempt + 1))
    return FetchResult(url, url, 0, "", b"", last_error)


class WritingParser(HTMLParser):
    """Extract ordered top-level sections and copy-bearing attributes."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.in_body = False
        self.seen_body = False
        self.ignored_depth = 0
        self.section_depth = 0
        self.segments: list[dict] = []
        self.current = self._new_segment("outside-section", {})
        self.title_parts: list[str] = []
        self.in_title = False
        self.meta: dict[str, str] = {}
        self.links: set[str] = set()
        self.h1: list[str] = []
        self.heading_tag: str | None = None
        self.heading_parts: list[str] = []

    @staticmethod
    def _new_segment(kind: str, attrs: dict[str, str]) -> dict:
        return {
            "kind": kind,
            "id": attrs.get("id", ""),
            "class": attrs.get("class", ""),
            "aria_label": attrs.get("aria-label", ""),
            "nested_sections": 0,
            "parts": [],
            "attribute_copy": [],
        }

    def _active_for_text(self) -> bool:
        return self.ignored_depth == 0 and self.in_body

    def _boundary(self) -> None:
        if self._active_for_text():
            self.current["parts"].append("\n")

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        attrs = {key.lower(): value or "" for key, value in attrs_list}
        if tag == "body":
            self.in_body = True
            self.seen_body = True
        if tag == "title":
            self.in_title = True
        if tag == "meta":
            key = attrs.get("name") or attrs.get("property")
            content = normalize_space(attrs.get("content", ""))
            if key and content:
                self.meta[key.lower()] = content
        if tag == "link" and attrs.get("rel", "").lower() == "canonical":
            self.meta["canonical"] = attrs.get("href", "")
        href = attrs.get("href")
        if tag == "a" and href:
            self.links.add(href)
        if tag in IGNORED_TAGS:
            self.ignored_depth += 1
            return
        if self.ignored_depth:
            return
        if tag == "section" and self.in_body:
            if self.section_depth == 0:
                if self._segment_has_copy(self.current):
                    self.segments.append(self.current)
                self.current = self._new_segment("section", attrs)
            else:
                self.current["nested_sections"] += 1
            self.section_depth += 1
        if tag in BLOCK_TAGS:
            self._boundary()
        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self.heading_tag = tag
            self.heading_parts = []

        attribute_values: list[tuple[str, str]] = []
        if not self.in_body:
            return
        if tag == "img" and attrs.get("alt"):
            attribute_values.append(("image alt", attrs["alt"]))
        if tag in {"input", "textarea"} and attrs.get("placeholder"):
            attribute_values.append(("placeholder", attrs["placeholder"]))
        if tag == "input" and attrs.get("type", "").lower() in {"button", "submit", "reset"} and attrs.get("value"):
            attribute_values.append(("input value", attrs["value"]))
        if attrs.get("aria-label"):
            attribute_values.append(("aria-label", attrs["aria-label"]))
        if attrs.get("title") and tag not in {"html"}:
            attribute_values.append(("title attribute", attrs["title"]))
        for label, value in attribute_values:
            value = normalize_space(value)
            if value:
                self.current["attribute_copy"].append({"type": label, "text": value})

    def handle_startendtag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs_list)
        self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in IGNORED_TAGS:
            if self.ignored_depth:
                self.ignored_depth -= 1
            return
        if self.ignored_depth:
            return
        if tag in BLOCK_TAGS:
            self._boundary()
        if self.heading_tag == tag:
            heading = normalize_space(" ".join(self.heading_parts))
            if tag == "h1" and heading:
                self.h1.append(heading)
            self.heading_tag = None
            self.heading_parts = []
        if tag == "section" and self.in_body and self.section_depth:
            self.section_depth -= 1
            if self.section_depth == 0:
                if self._segment_has_copy(self.current):
                    self.segments.append(self.current)
                self.current = self._new_segment("outside-section", {})
        if tag == "title":
            self.in_title = False
        if tag == "body":
            self.in_body = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
        if not self._active_for_text():
            return
        value = normalize_space(data)
        if not value:
            return
        self.current["parts"].append(value)
        if self.heading_tag:
            self.heading_parts.append(value)

    @staticmethod
    def _segment_has_copy(segment: dict) -> bool:
        return bool(normalize_space(" ".join(segment["parts"]))) or bool(segment["attribute_copy"])

    @staticmethod
    def _finalize_segment(segment: dict) -> dict:
        joined = " ".join(segment.pop("parts"))
        raw_lines = joined.split("\n")
        lines = [normalize_space(line) for line in raw_lines]
        lines = [line for line in lines if line]
        segment["lines"] = lines
        segment["text"] = "\n".join(lines)
        segment["word_count"] = len(re.findall(r"\b\w+\b", segment["text"], re.UNICODE))
        segment["character_count"] = len(segment["text"])
        return segment

    def finish(self) -> dict:
        if self._segment_has_copy(self.current):
            self.segments.append(self.current)
        segments = [self._finalize_segment(segment) for segment in self.segments]
        return {
            "title": normalize_space(" ".join(self.title_parts)),
            "h1": self.h1,
            "meta": self.meta,
            "links": sorted(self.links),
            "segments": segments,
        }


def parse_html(body: bytes, source_url: str) -> dict:
    text = body.decode("utf-8", errors="replace")
    parser = WritingParser()
    try:
        parser.feed(text)
        parser.close()
    except Exception as exc:
        result = parser.finish()
        result["parse_error"] = f"{type(exc).__name__}: {exc}"
        return result
    result = parser.finish()
    internal_links = set()
    for href in result.pop("links"):
        normalized = normalize_url(href, source_url)
        if normalized:
            internal_links.add(normalized)
    result["internal_links"] = sorted(internal_links)
    return result


def sitemap_urls() -> tuple[list[str], list[str]]:
    root = fetch(urllib.parse.urljoin(BASE_URL, "sitemap.xml"))
    if root.status != 200:
        raise RuntimeError(f"Unable to read sitemap.xml: {root.status} {root.error or ''}")
    document = ET.fromstring(root.body)
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap_locations = [node.text.strip() for node in document.findall("sm:sitemap/sm:loc", namespace) if node.text]
    urls: set[str] = set()
    for location in sitemap_locations:
        response = fetch(location)
        if response.status != 200:
            continue
        child = ET.fromstring(response.body)
        for node in child.findall("sm:url/sm:loc", namespace):
            if node.text:
                normalized = normalize_url(node.text.strip())
                if normalized:
                    urls.add(normalized)
    return sorted(urls), sitemap_locations


def scrape_page(url: str) -> dict:
    response = fetch(url)
    is_html = (
        "text/html" in response.content_type.lower()
        or "application/xhtml+xml" in response.content_type.lower()
    )
    parsed = parse_html(response.body, response.final_url or url) if response.body and is_html else {
        "title": "", "h1": [], "meta": {}, "segments": [], "internal_links": []
    }
    all_text = "\n".join(segment["text"] for segment in parsed["segments"] if segment["text"])
    attribute_text = "\n".join(
        item["text"]
        for segment in parsed["segments"]
        for item in segment["attribute_copy"]
    )
    combined = "\n".join(part for part in (all_text, attribute_text) if part)
    return {
        "url": url,
        "language": language_for_url(url),
        "status": response.status,
        "final_url": response.final_url,
        "content_type": response.content_type,
        "is_html": is_html,
        "error": response.error,
        "title": parsed["title"],
        "h1": parsed["h1"],
        "meta": parsed["meta"],
        "segments": parsed["segments"],
        "internal_links": parsed["internal_links"],
        "parse_error": parsed.get("parse_error"),
        "word_count": len(re.findall(r"\b\w+\b", combined, re.UNICODE)),
        "character_count": len(combined),
        "text_sha256": hashlib.sha256(combined.encode("utf-8")).hexdigest(),
    }


def crawl(seed_urls: Iterable[str]) -> tuple[dict[str, dict], dict[str, set[str]]]:
    pending = set(seed_urls)
    completed: dict[str, dict] = {}
    discovered_from: dict[str, set[str]] = {url: {"sitemap/language variant"} for url in pending}

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        while pending and len(completed) < MAX_URLS:
            batch = sorted(pending)[: MAX_URLS - len(completed)]
            pending.difference_update(batch)
            futures = {executor.submit(scrape_page, url): url for url in batch}
            for future in concurrent.futures.as_completed(futures):
                url = futures[future]
                try:
                    record = future.result()
                except Exception as exc:
                    record = {
                        "url": url, "language": language_for_url(url), "status": 0,
                        "final_url": url, "content_type": "", "error": f"{type(exc).__name__}: {exc}",
                        "is_html": False,
                        "title": "", "h1": [], "meta": {}, "segments": [], "internal_links": [],
                        "parse_error": None, "word_count": 0, "character_count": 0,
                        "text_sha256": hashlib.sha256(b"").hexdigest(),
                    }
                completed[url] = record
                for linked_url in record["internal_links"]:
                    discovered_from.setdefault(linked_url, set()).add(url)
                    if linked_url not in completed and len(completed) + len(pending) < MAX_URLS:
                        pending.add(linked_url)
            pending.difference_update(completed)
            print(f"Crawled {len(completed)} page(s); {len(pending)} queued", file=sys.stderr)
    return completed, discovered_from


def file_stem(url: str) -> str:
    parsed = urllib.parse.urlsplit(url)
    path = re.sub(r"^/(en|ch)(?=/|$)", "", parsed.path).strip("/") or "home"
    decoded = urllib.parse.unquote(path)
    folded = unicodedata.normalize("NFKD", decoded).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", folded).strip("-").lower() or "page"
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:8]
    return f"{slug}-{digest}.md"


def md_escape(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ")


def section_label(segment: dict, number: int) -> str:
    prefix = "Section" if segment["kind"] == "section" else "Di luar elemen section"
    if segment.get("aria_label"):
        return f"{prefix} {number} — {segment['aria_label']}"
    for line in segment["lines"]:
        if len(line) <= 120:
            return f"{prefix} {number} — {line}"
    return f"{prefix} {number}"


def write_page_markdown(record: dict, origins: set[str], relative_path: Path) -> None:
    page_heading = record["title"] or (record["h1"][0] if record["h1"] else record["url"])
    origin_list = sorted(origins)
    origin_summary = ", ".join(origin_list[:5])
    if len(origin_list) > 5:
        origin_summary += f", dan {len(origin_list) - 5} sumber lain (lengkap di content.json)"
    lines = [
        f"# {page_heading}",
        "",
        f"- URL sumber: {record['url']}",
        f"- URL final: {record['final_url']}",
        f"- Bahasa: {record['language']}",
        f"- HTTP status: {record['status']}",
        f"- Jumlah kata: {record['word_count']}",
        f"- Jumlah section/segmen: {len(record['segments'])}",
        f"- Ditemukan dari: {origin_summary}",
    ]
    if record.get("error"):
        lines.append(f"- Error: {record['error']}")
    if record.get("parse_error"):
        lines.append(f"- Parse error: {record['parse_error']}")
    if record["meta"]:
        lines.extend(["", "## Metadata", ""])
        for key, value in sorted(record["meta"].items()):
            lines.append(f"- {key}: {value}")
    if not record["segments"]:
        lines.extend(["", "## Konten", "", "Tidak ada teks yang dapat diekstrak dari respons halaman."])
    for number, segment in enumerate(record["segments"], 1):
        lines.extend(["", f"## {section_label(segment, number)}", ""])
        lines.append(
            f"Jenis: `{segment['kind']}` · nested section: {segment['nested_sections']}"
            + (f" · id: `{segment['id']}`" if segment["id"] else "")
        )
        if segment["class"]:
            lines.append(f"Class: `{segment['class']}`")
        if segment["lines"]:
            lines.append("")
            lines.extend(segment["lines"])
        if segment["attribute_copy"]:
            lines.extend(["", "### Copy dalam atribut HTML", ""])
            for item in segment["attribute_copy"]:
                lines.append(f"- **{item['type']}:** {item['text']}")
    lines.append("")
    relative_path.parent.mkdir(parents=True, exist_ok=True)
    relative_path.write_text("\n".join(lines), encoding="utf-8")


def write_outputs(records: dict[str, dict], discovered_from: dict[str, set[str]], sitemap_sources: list[str]) -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    if (OUTPUT_DIR / "pages").exists():
        shutil.rmtree(OUTPUT_DIR / "pages")
    non_html_records = {
        url: record for url, record in records.items()
        if record["status"] != 0 and not record.get("is_html", False)
    }
    records = {
        url: record for url, record in records.items()
        if record["status"] == 0 or record.get("is_html", False)
    }
    pages_dir = OUTPUT_DIR / "pages"
    page_files: dict[str, str] = {}
    for url, record in sorted(records.items()):
        relative = Path("pages") / record["language"] / file_stem(url)
        write_page_markdown(record, discovered_from.get(url, set()), OUTPUT_DIR / relative)
        page_files[url] = relative.as_posix()

    totals = {
        "pages": len(records),
        "successful": sum(1 for record in records.values() if 200 <= record["status"] < 400),
        "http_errors": sum(1 for record in records.values() if record["status"] >= 400),
        "network_errors": sum(1 for record in records.values() if record["status"] == 0),
        "empty_pages": sum(1 for record in records.values() if record["word_count"] == 0),
        "words": sum(record["word_count"] for record in records.values()),
        "characters": sum(record["character_count"] for record in records.values()),
        "by_language": {
            language: sum(1 for record in records.values() if record["language"] == language)
            for language in LANGUAGES
        },
    }
    generated_at = datetime.now(timezone.utc).isoformat()
    manifest = {
        "generated_at": generated_at,
        "base_url": BASE_URL,
        "method": "WordPress sitemap seeds + id/en/ch variants + recursive internal-link discovery",
        "sitemap_sources": sitemap_sources,
        "excluded_non_html": [
            {
                "url": record["url"],
                "final_url": record["final_url"],
                "status": record["status"],
                "content_type": record["content_type"],
            }
            for record in sorted(non_html_records.values(), key=lambda item: item["url"])
        ],
        "totals": totals,
        "pages": [
            {
                **record,
                "discovered_from": sorted(discovered_from.get(url, set())),
                "recap_file": page_files[url],
            }
            for url, record in sorted(records.items())
        ],
    }
    (OUTPUT_DIR / "content.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    index_lines = [
        "# Rekap Konten Lengkap — Accupro International",
        "",
        f"Dibuat: {generated_at}",
        "",
        "Rekap ini dimulai dari seluruh URL di sitemap WordPress, diperluas ke varian bahasa Indonesia, Inggris, dan Mandarin/Chinese (`/ch/`), lalu mengikuti tautan HTML internal. Teks navigasi, footer, CTA, form, alt image, placeholder, dan bagian di luar elemen `<section>` tetap dicatat agar tidak ada writing yang sengaja dikecualikan.",
        "",
        "## Ringkasan",
        "",
        f"- Total URL: {totals['pages']}",
        f"- Berhasil: {totals['successful']}",
        f"- HTTP error: {totals['http_errors']}",
        f"- Network error: {totals['network_errors']}",
        f"- Halaman tanpa teks: {totals['empty_pages']}",
        f"- URL non-HTML yang dikeluarkan dari hitungan halaman: {len(non_html_records)}",
        f"- Total kata (termasuk copy global yang berulang): {totals['words']}",
        f"- Bahasa: ID {totals['by_language']['id']} · EN {totals['by_language']['en']} · CH {totals['by_language']['ch']}",
        "",
        "## Daftar halaman",
        "",
        "| Bahasa | Status | Kata | Section | Judul / URL | Rekap |",
        "|---|---:|---:|---:|---|---|",
    ]
    for url, record in sorted(records.items(), key=lambda item: (item[1]["language"], item[0])):
        label = record["title"] or (record["h1"][0] if record["h1"] else url)
        index_lines.append(
            f"| {record['language'].upper()} | {record['status']} | {record['word_count']} | "
            f"{len(record['segments'])} | [{md_escape(label)}]({url}) | "
            f"[Buka]({page_files[url]}) |"
        )
    index_lines.extend(["", "## Error dan halaman kosong", ""])
    problem_records = [
        record for record in records.values()
        if record["status"] == 0 or record["status"] >= 400 or record["word_count"] == 0
    ]
    if problem_records:
        for record in sorted(problem_records, key=lambda item: item["url"]):
            index_lines.append(
                f"- `{record['status']}` {record['url']} — {record.get('error') or 'tidak ada teks'}"
            )
    else:
        index_lines.append("Tidak ada error atau halaman kosong.")
    index_lines.append("")
    (OUTPUT_DIR / "INDEX.md").write_text("\n".join(index_lines), encoding="utf-8")

    audit = {
        "generated_at": generated_at,
        "totals": totals,
        "problems": [
            {
                "url": record["url"],
                "status": record["status"],
                "error": record.get("error"),
                "word_count": record["word_count"],
                "recap_file": page_files[record["url"]],
            }
            for record in sorted(problem_records, key=lambda item: item["url"])
        ],
        "duplicate_text_groups": [],
        "excluded_non_html": manifest["excluded_non_html"],
    }
    hashes: dict[str, list[str]] = {}
    for record in records.values():
        if record["word_count"]:
            hashes.setdefault(record["text_sha256"], []).append(record["url"])
    audit["duplicate_text_groups"] = [
        urls for urls in hashes.values() if len(urls) > 1
    ]
    (OUTPUT_DIR / "AUDIT.json").write_text(
        json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return len(records)


def main() -> int:
    canonical_urls, sitemap_sources = sitemap_urls()
    seeds = {
        language_variant(url, language)
        for url in canonical_urls
        for language in LANGUAGES
    }
    print(
        f"Found {len(canonical_urls)} sitemap page(s); starting with {len(seeds)} language URL(s)",
        file=sys.stderr,
    )
    records, discovered_from = crawl(seeds)
    written_count = write_outputs(records, discovered_from, sitemap_sources)
    print(f"Wrote {written_count} HTML page recap(s) to {OUTPUT_DIR}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
