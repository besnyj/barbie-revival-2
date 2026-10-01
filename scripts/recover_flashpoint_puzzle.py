"""Recover Puzzle Party picture files from Flashpoint's public Legacy mirror."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import json
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://infinity.unstable.life/Flashpoint/Legacy/htdocs/assets.barbie.com/games-bin/DreamhousePuzzleParty/pics/"
DEST = ROOT / "public/_original/dreamhouse.barbie.com/Content/games/en-US/dreamhousepuzzle/pics"
REPORT = ROOT / "research/flashpoint-puzzle-images.json"
SOURCE = ROOT / "research/dreamhouse-puzzle-gamesettings-original.xml"


def fetch(name):
    target = DEST / name
    if target.exists() and target.read_bytes()[:3] == b"\xff\xd8\xff":
        return name, "existing", target.stat().st_size
    with tempfile.NamedTemporaryFile(suffix=".jpg") as tmp:
        proc = subprocess.run(["curl", "-L", "-s", "--max-time", "25", "-o", tmp.name,
                               "-w", "%{http_code}", BASE + name], capture_output=True, text=True)
        data = Path(tmp.name).read_bytes()
    if proc.returncode or proc.stdout != "200" or not data.startswith(b"\xff\xd8\xff"):
        return name, "missing", proc.stdout or proc.stderr[:100]
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    return name, "recovered", len(data)


def main():
    names = sorted(set(re.findall(r'(?i)[\w-]+\.jpg', SOURCE.read_text(encoding="utf-8-sig"))))
    results = {}
    with ThreadPoolExecutor(max_workers=8) as pool:
        for future in as_completed([pool.submit(fetch, name) for name in names]):
            name, status, detail = future.result()
            results[name] = {"status": status, "detail": detail, "source": BASE + name}
    REPORT.write_text(json.dumps(results, indent=2) + "\n")
    from collections import Counter
    print(Counter(v["status"] for v in results.values()))
    print(f"Total {len(results)}; report {REPORT}")


if __name__ == "__main__":
    main()
