"""Recover explicit original paths; keep provenance and reject archive error pages.
Usage: python3 scripts/recover.py /path.ext ...
"""
import concurrent.futures, hashlib, json, pathlib, subprocess, sys, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
STAMP = '20130628161553'

def recover(path):
    original = path if path.startswith('http') else 'http://www.barbie.com' + path
    parsed = urllib.parse.urlsplit(original)
    relative = parsed.path.lstrip('/')
    if parsed.hostname not in ('www.barbie.com', 'barbie.com'):
        relative = '_original/' + parsed.hostname + '/' + relative
    target = ROOT / 'public' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    url = f'https://web.archive.org/web/{STAMP}id_/{original}'
    result = subprocess.run(['curl', '-L', '--retry', '2', '--retry-all-errors', '--max-time', '40', '-sS', '-w', '%{http_code}\n%{url_effective}', url, '-o', str(target)], capture_output=True, text=True)
    lines = result.stdout.splitlines()
    data = target.read_bytes() if target.exists() else b''
    valid = result.returncode == 0 and lines and lines[0] == '200' and bool(data)
    if target.suffix.lower() in ('.swf', '.jpg', '.png', '.gif') and data.lstrip().startswith((b'<', b'<!')):
        valid = False
    if not valid and target.exists():
        target.unlink()
    entry = {'original': original, 'archive': url, 'resolved': lines[-1] if lines else '', 'local': str(target.relative_to(ROOT)), 'ok': bool(valid), 'bytes':len(data), 'sha256':hashlib.sha256(data).hexdigest() if valid else None, 'error':result.stderr.strip() or None}
    print(('OK ' if valid else 'MISSING ') + relative, len(data), flush=True)
    return entry

if __name__ == '__main__':
    paths = sys.argv[1:]
    if paths and paths[0] == '--list':
        paths = pathlib.Path(paths[1]).read_text().splitlines()
    entries = list(concurrent.futures.ThreadPoolExecutor(max_workers=2).map(recover, paths))
    manifest = ROOT / 'research' / 'asset-manifest.json'
    previous = json.loads(manifest.read_text()) if manifest.exists() else []
    merged = {e['original']:e for e in previous + entries}
    manifest.write_text(json.dumps(list(merged.values()), indent=2) + '\n')
