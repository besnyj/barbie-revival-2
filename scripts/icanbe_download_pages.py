#!/usr/bin/env python3
"""Download each inventoried I Can Be page at its chosen timestamp into research/sections/icanbe-pages/."""
import json
import sys
import time
import urllib.request
from pathlib import Path

OUT_DIR = Path("research/sections/icanbe-pages")
OUT_DIR.mkdir(parents=True, exist_ok=True)

inventory = json.loads((OUT_DIR / "inventory.json").read_text())


def slug(path: str) -> str:
    p = path.strip("/").lower()
    p = p.replace("/", "-").replace(".html", "").replace(".aspx", "")
    return p + ".html"


def fetch(ts: str, url: str, retries: int = 4) -> bytes:
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                f"https://web.archive.org/web/{ts}id_/{url}",
                headers={"User-Agent": "Mozilla/5.0 (restoration research)"},
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                return resp.read()
        except Exception as exc:  # noqa: BLE001
            print(f"  attempt {attempt + 1} failed: {exc}", file=sys.stderr)
            time.sleep(4 * (attempt + 1))
    raise RuntimeError(f"giving up on {url}")


results = []
for i, item in enumerate(inventory):
    out = OUT_DIR / slug(item["path"])
    status = "skip"
    if not out.exists() or out.stat().st_size < 5000:
        try:
            data = fetch(item["timestamp"], item["url"])
            if len(data) < 5000:
                raise RuntimeError(f"suspiciously small ({len(data)} bytes)")
            out.write_bytes(data)
            status = "ok"
        except Exception as exc:  # noqa: BLE001
            status = f"FAILED: {exc}"
    results.append({**item, "file": str(out.relative_to(OUT_DIR)), "status": status})
    print(f"[{i + 1}/{len(inventory)}] {status} {item['path']} ({item['timestamp']})")

(OUT_DIR / "download-report.json").write_text(json.dumps(results, indent=1))
print("saved download-report.json")
