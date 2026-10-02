#!/usr/bin/env python3
"""Extract asset references from the inventoried I Can Be pages and check availability in the CDX.

Usage: python3 scripts/icanbe_assets_report.py <cdx-full.txt>
Writes research/sections/icanbe-pages/assets-report.json
"""
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

CDX_PATH = Path(sys.argv[1])
PAGES_DIR = Path("research/sections/icanbe-pages")
HOST = "http://icanbe.barbie.com"

# local icanbe.barbie.com URL references
REF_RE = re.compile(
    r"""(?:src|href)\s*=\s*["'](?P<url>/[^"'#?\s]+(?:\.(?:png|gif|jpg|jpeg|swf|css|js|pdf|json|xml|xmlx|eot|ttf|woff|svg|ico|html|mp3)))(?:\?[^"']*)?["']""",
    re.I,
)
SWF_PATH_RE = re.compile(r"""["']/Resources/Games_data/[^"']+["']""", re.I)
SWF_NAME_RE = re.compile(r"""embedSWF\(\s*["']([^"']+\.swf)""", re.I)
DATA_PLAYER_RE = re.compile(r"""data-video-player=["']([^"']+)""", re.I)


def main() -> None:
    cdx_ok = set()
    for line in CDX_PATH.read_text(errors="replace").splitlines():
        parts = line.split(" ", 3)
        if len(parts) < 4:
            continue
        ts, url, status, mime = parts
        if status.strip() == "200":
            host_path = url.split("icanbe.barbie.com", 1)[-1].split("?")[0]
            cdx_ok.add(host_path.lower())
            cdx_ok.add(host_path)

    report = {"pages": [], "assets": {}}
    page_assets = defaultdict(set)
    for page in sorted(PAGES_DIR.glob("*.html")):
        if page.name.startswith(("careers", "games", "videos", "dolls", "en_us", "en-us")):
            text = page.read_text(errors="replace")
            urls = set()
            for m in REF_RE.finditer(text):
                urls.add(m.group("url"))
            for m in SWF_PATH_RE.finditer(text):
                urls.add(m.group(0).strip("\"'"))
            for m in SWF_NAME_RE.finditer(text):
                urls.add(m.group(1))
            for m in DATA_PLAYER_RE.finditer(text):
                urls.add(m.group(1))
            entry = {"page": page.name, "refs": []}
            for u in sorted(urls):
                if not u.startswith("/"):
                    # relative to /en_US/... — resolve against /en_US/
                    u = "/en_US/" + u
                local_only = "icanbe.barbie.com" not in u
                key = u.lower()
                available = key in cdx_ok or u in cdx_ok
                entry["refs"].append({"url": u, "available": available})
                if local_only and u.endswith((".png", ".gif", ".jpg", ".jpeg", ".swf", ".css", ".js", ".pdf", ".xmlx", ".json")):
                    page_assets[u].add(page.name)
            report["pages"].append(entry)

    report["assets"] = {
        url: {"used_by": sorted(pages), "available": (url.lower() in cdx_ok)}
        for url, pages in sorted(page_assets.items())
    }
    (PAGES_DIR / "assets-report.json").write_text(json.dumps(report, indent=1))

    missing = [u for u, info in report["assets"].items() if not info["available"]]
    available = [u for u, info in report["assets"].items() if info["available"]]
    print(f"distinct referenced assets: {len(report['assets'])}")
    print(f"available in archive:       {len(available)}")
    print(f"MISSING from archive:       {len(missing)}")
    print()
    print("--- MISSING assets ---")
    for u in missing:
        print(f"  {u}   (used by: {', '.join(report['assets'][u]['used_by'])})")


if __name__ == "__main__":
    main()
