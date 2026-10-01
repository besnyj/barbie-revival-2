"""Recover My Dreamhouse assets from Flashpoint's public Legacy mirror."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
HOST = "design-my-dreamhouse.barbie.com"
BASE = f"https://infinity.unstable.life/Flashpoint/Legacy/htdocs/{HOST}"
DEST = ROOT / "public/_original" / HOST
XML = DEST / "en-us/xml/assets.xml"
REPORT = ROOT / "research/flashpoint-my-dreamhouse-assets.json"
EXTS = (".png", ".jpg", ".swf", ".mp3")
EXTRAS = [
    "/en-us/Images/barbiePrintBg_tcm515-66821.png",
    "/en-us/Images/Dreamhouse_Title_Chelsea_tcm515-66661.png",
    "/en-us/Images/logo_main_tcm515-66667.png",
    "/en-us/Images/first_tcm515-66670.png",
]


def valid(data, ext):
    return {
        ".png": data.startswith(b"\x89PNG\r\n\x1a\n"),
        ".jpg": data.startswith(b"\xff\xd8\xff"),
        ".swf": data[:3] in (b"FWS", b"CWS", b"ZWS"),
        ".mp3": data.startswith(b"ID3") or (len(data) > 2 and data[0] == 0xff and data[1] & 0xe0 == 0xe0),
    }[ext]


def fetch(path):
    ext = Path(path).suffix.lower()
    target = DEST / path.lstrip("/")
    if target.exists() and valid(target.read_bytes()[:16], ext):
        return path, "existing", target.stat().st_size
    req = Request(BASE + path, headers={"User-Agent": "Mozilla/5.0 (restoration research)"})
    try:
        with urlopen(req, timeout=30) as response:
            data = response.read()
        if not valid(data, ext):
            return path, "invalid", len(data)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        return path, "recovered", len(data)
    except (HTTPError, URLError, TimeoutError) as error:
        return path, "error", str(error)


def main():
    tree = ET.parse(XML)
    paths = sorted({(e.text or "").strip() for e in tree.iter() if e.text and (e.text or "").strip().lower().endswith(EXTS)})
    paths = sorted(set(paths + EXTRAS))
    paths = [p for p in paths if p.startswith("/en-us/Images/") and ".." not in p]
    results = {}
    with ThreadPoolExecutor(max_workers=8) as pool:
        for future in as_completed([pool.submit(fetch, path) for path in paths]):
            path, status, detail = future.result()
            results[path] = {"status": status, "detail": detail, "source": BASE + path}
    REPORT.write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n")
    from collections import Counter
    print(Counter(v["status"] for v in results.values()))
    print(f"Total {len(results)}; report {REPORT}")


if __name__ == "__main__":
    main()
