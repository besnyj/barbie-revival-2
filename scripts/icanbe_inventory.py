#!/usr/bin/env python3
"""Build an inventory of the original Barbie I Can Be site (en_US) from a Wayback CDX dump.

For every en_US HTML page captured on icanbe.barbie.com, choose the capture nearest to the
project baseline (2013-06-28) within 2013, preferring captures at or before the baseline.
Writes research/sections/icanbe-pages/inventory.json and (optionally) downloads the pages.
"""
import json
import re
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

CDX = Path(sys.argv[1]) if len(sys.argv) > 1 else None
OUT_DIR = Path("research/sections/icanbe-pages")
BASELINE = datetime(2013, 6, 28)
HOST_RE = re.compile(r"^https?://(?:www\.|origin\.|ndcbeta\.|origin\.ndcbeta\.)?icanbe\.barbie\.com(?::80)?")
HTML_RE = re.compile(r"text/html", re.I)


def parse_ts(ts: str) -> datetime:
    return datetime.strptime(ts[:14], "%Y%m%d%H%M%S")


def main() -> None:
    lines = CDX.read_text(errors="replace").splitlines()
    pages = {}
    for line in lines:
        parts = line.split(" ", 3)
        if len(parts) < 4:
            continue
        ts, url, status, mime = parts
        if not HTML_RE.search(mime):
            continue
        if status.strip() != "200":
            continue
        m = HOST_RE.match(url)
        if not m:
            continue
        path = url[m.end():].split("?")[0]
        if not re.search(r"en_US", path, re.I):
            continue
        # Only HTML documents, not directories or stray assets
        if not (path.endswith(".html") or path.endswith("/") or path.endswith(".aspx")):
            continue
        if "/Images/" in path or "/resources/" in path or "/Resources/" in path:
            continue
        key = path.lower()
        when = parse_ts(ts)
        if when.year != 2013:
            continue
        cur = pages.get(key)
        if cur is None:
            pages[key] = (ts, url, path)
            continue
        cur_dt = parse_ts(cur[0])
        if abs((when - BASELINE).days) < abs((cur_dt - BASELINE).days):
            pages[key] = (ts, url, path)

    inventory = [
        {"path": path, "timestamp": ts, "url": url, "days_from_baseline": (parse_ts(ts) - BASELINE).days}
        for ts, url, path in sorted(pages.values())
    ]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "inventory.json").write_text(json.dumps(inventory, indent=1))
    print(f"{len(inventory)} pages inventoried -> {OUT_DIR/'inventory.json'}")
    for item in inventory:
        print(f"{item['timestamp']} ({item['days_from_baseline']:+d}d) {item['path']}")


if __name__ == "__main__":
    main()
