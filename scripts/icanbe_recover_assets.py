#!/usr/bin/env python3
"""Recover all I Can Be assets still missing locally, with per-file provenance.

Usage: python3 scripts/icanbe_recover_assets.py <cdx-full.txt>

For every asset referenced by the inventoried I Can Be pages (plus the shared
resources and the archived game files), pick the best available Wayback capture:
  1. exact en_US path, 200, closest to the 2013-06-28 baseline (prefer 2013);
  2. same filename under another locale (tcm id differs, trailing number matches);
  3. documented gap otherwise.
Downloads with binary-signature validation and writes:
  public/_original/icanbe.barbie.com/<path>   (recovered files)
  research/icanbe-assets-manifest.json        (provenance + gaps)
"""
import hashlib
import json
import re
import sys
import time
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
ICB_ROOT = PUBLIC / "_original" / "icanbe.barbie.com"
PAGES_DIR = ROOT / "research" / "sections" / "icanbe-pages"
BASELINE = datetime(2013, 6, 28)
CDX_PATH = Path(sys.argv[1])

# Shared resources referenced by inner pages / style.css but not yet local.
EXTRA_RESOURCES = [
    "/resources/css/jquery.jscrollpane.css",
    "/resources/js/mylibs/jquery.jscrollpane.min.js",
    "/resources/js/mylibs/jquery.mousewheel.js",
    "/resources/js/prevent_scroll.js",
    "/resources/img/background-survey.png",
    "/resources/img/background-title-videos.png",
    "/resources/img/background-videos.jpg",
    "/resources/img/btn-back-to-games.png",
    "/resources/img/non_flash_vidBg.png",
    "/resources/img/sprite-buttons-aggregator.png",
    "/resources/img/sprite-buttons-l.png",
    "/resources/img/sprite-buttons-xl.png",
    "/resources/img/arrows-scrollbar.gif",
    "/resources/swfs/video_player.swf",
]

# Games whose main SWF was never captured: their pages get an honest notice.
GAME_FOLDERS = {
    "amazingarchitect", "data_diva", "disco_ballroom", "fantastic_concert",
    "goodmorning_barbie", "halfpipe_pixie", "little_critter_clinic",
    "pompom_squad", "potty_race", "presto_pizza", "ready_set_checkup",
    "splashing_bash", "super_wedding_stylist", "global",
}
GAME_EXTS = {".swf", ".xml", ".xmlx", ".css", ".pdf"}

SIGNATURES = {
    ".swf": (b"FWS", b"CWS", b"ZWS"),
    ".jpg": (b"\xff\xd8\xff",),
    ".jpeg": (b"\xff\xd8\xff",),
    ".png": (b"\x89PNG\r\n\x1a\n",),
    ".gif": (b"GIF87a", b"GIF89a"),
}


def parse_ts(ts: str) -> datetime:
    return datetime.strptime(ts[:14], "%Y%m%d%H%M%S")


def load_cdx() -> dict:
    index = {}
    for line in CDX_PATH.read_text(errors="replace").splitlines():
        parts = line.split(" ", 3)
        if len(parts) < 4:
            continue
        ts, url, status, _mime = parts
        if status.strip() != "200":
            continue
        if "icanbe.barbie.com" not in url:
            continue
        path = re.sub(r"^https?://(?:www\.|origin\.|ndcbeta\.|origin\.ndcbeta\.)?icanbe\.barbie\.com(?::80)?", "", url)
        path = path.split("?")[0]
        index.setdefault(path.lower(), []).append((ts, url, path))
    return index


def closest(candidates, prefer_2013=True):
    def key(item):
        ts = parse_ts(item[0])
        year_penalty = 0 if ts.year == 2013 else abs(ts.year - 2013) * 1000
        return (year_penalty if prefer_2013 else 0, abs((ts - BASELINE).days))
    return min(candidates, key=key)


def find_source(cdx: dict, wanted: str):
    """Return (timestamp, source_url, substitution) or None."""
    candidates = cdx.get(wanted.lower())
    if candidates:
        ts, url, path = closest(candidates)
        return ts, url, None

    m = re.match(
        r"/(?P<loc>en_US|en_us)/Images/(?P<name>.+)_tcm(?P<tcm>\d+)-(?P<num>\d+)\.(?P<ext>png|jpg|jpeg|pdf)$",
        wanted, re.I,
    )
    if not m:
        return None
    pattern = re.compile(
        rf"/(?:en_us|en_gb|pt_br|es_es|es_lam|fr_fr|de_de|it_it|nl_nl|ru_ru|pl_pl|el_gr|cs_cz|da_dk|fi_fi|hu_hu|nn_no|pt_pt|ro_ro|sl_si|sv_se|tr_tr|hr_hr|zh_cn)/images/{re.escape(m.group('name').lower())}_tcm\d+-{m.group('num')}\.{m.group('ext').lower()}$",
        re.I,
    )
    hits = [item for key, items in cdx.items() if pattern.match(key) for item in items]
    if not hits:
        return None
    ts, url, path = closest(hits)
    return ts, url, path


def fetch(ts: str, url: str, retries: int = 4) -> bytes:
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                f"https://web.archive.org/web/{ts}id_/{url}",
                headers={"User-Agent": "Mozilla/5.0 (restoration research)"},
            )
            with urllib.request.urlopen(req, timeout=90) as resp:
                return resp.read()
        except Exception as exc:  # noqa: BLE001
            print(f"    attempt {attempt + 1} failed: {exc}", file=sys.stderr)
            time.sleep(4 * (attempt + 1))
    raise RuntimeError("download failed")


def main() -> None:
    cdx = load_cdx()

    wanted = set(EXTRA_RESOURCES)
    report = json.loads((PAGES_DIR / "assets-report.json").read_text())
    # every page-referenced local image/pdf (available in the CDX or not —
    # find_source falls back to cross-locale copies before declaring a gap)
    for url in report["assets"]:
        if not url.startswith("/") or url.startswith("//"):
            continue
        if not re.search(r"\.(png|gif|jpg|jpeg|pdf)$", url, re.I):
            continue
        wanted.add("/" + url.split("icanbe.barbie.com", 1)[-1].lstrip("/"))
    # archived game runtime files for the recoverable games
    for key, items in cdx.items():
        m = re.match(r"/resources/games_data/(?P<folder>[^/]+)/(?P<rest>.+)", key, re.I)
        if not m or m.group("folder").lower() not in GAME_FOLDERS:
            continue
        if Path(m.group("rest")).suffix.lower() not in GAME_EXTS:
            continue
        if Path(m.group("rest")).suffix.lower() == ".pdf" and "enus" not in key.lower():
            continue
        # store at the lowercase path the game SWFs request at runtime
        wanted.add("/" + items[0][2].lower().lstrip("/"))

    prev = {}
    prev_path = ROOT / "research" / "icanbe-assets-manifest.json"
    if prev_path.exists():
        prev = {e["path"]: e for e in json.loads(prev_path.read_text())}

    manifest = []
    ok = gap = 0
    for path in sorted(wanted):
        local = ICB_ROOT / path.lstrip("/")
        key = "/" + path.lstrip("/")
        old = prev.get(key)
        if old and old.get("ok"):
            entry = dict(old)
            if local.exists():
                entry["bytes"] = local.stat().st_size
                entry["sha256"] = hashlib.sha256(local.read_bytes()).hexdigest()
            manifest.append(entry)
            ok += 1
            continue
        if local.exists() and local.stat().st_size > 0:
            manifest.append({
                "path": key, "ok": True, "source_url": None, "timestamp": None,
                "substitution": None, "bytes": local.stat().st_size,
                "sha256": hashlib.sha256(local.read_bytes()).hexdigest(),
                "gap": "already present locally from this session's first recovery pass",
            })
            ok += 1
            continue
        source = find_source(cdx, path)
        entry = {
            "path": key,
            "ok": False,
            "source_url": None,
            "timestamp": None,
            "substitution": None,
            "bytes": 0,
            "sha256": None,
            "gap": None,
        }
        if source:
            ts, url, subst = source
            try:
                data = fetch(ts, url)
                ext = local.suffix.lower()
                if ext in SIGNATURES and not data.startswith(SIGNATURES[ext]):
                    raise RuntimeError("invalid binary signature")
                local.parent.mkdir(parents=True, exist_ok=True)
                local.write_bytes(data)
                entry.update(ok=True, source_url=url, timestamp=ts,
                             substitution=bool(subst), bytes=len(data),
                             sha256=hashlib.sha256(data).hexdigest())
                ok += 1
                note = f" (subst: {subst})" if subst else ""
                print(f"OK  {path}  <- {ts} {url}{note}")
            except Exception as exc:  # noqa: BLE001
                entry["gap"] = f"download failed: {exc}"
                gap += 1
                print(f"GAP {path}  ({exc})")
        else:
            entry["gap"] = "no 200 capture anywhere (any locale, any year)"
            gap += 1
            print(f"GAP {path}  (no capture)")
        manifest.append(entry)

    (ROOT / "research" / "icanbe-assets-manifest.json").write_text(
        json.dumps(manifest, indent=1) + "\n")
    print(f"\nrecovered: {ok}  gaps: {gap}  -> research/icanbe-assets-manifest.json")


if __name__ == "__main__":
    main()
