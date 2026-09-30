"""Recover paths using the nearest 2013 capture when the 20130628161553 replay misses.
Usage: python3 scripts/recover_cdx.py /images/games/thumbs/x.jpg ...
"""
import concurrent.futures, hashlib, json, pathlib, subprocess, sys, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
STAMP = '20130628161553'

def cdx(path, from_year='2013'):
    url = 'https://web.archive.org/cdx/search/cdx'
    params = urllib.parse.urlencode({
        'url': 'http://www.barbie.com' + path,
        'output': 'json',
        'filter': 'statuscode:200',
        'from': f'{from_year}0101', 'to': f'{from_year}1231',
        'collapse': 'digest',
        'fl': 'timestamp,digest',
    })
    result = subprocess.run(['curl', '-sS', '--retry', '6', '--retry-all-errors', '--retry-delay', '2', '--max-time', '60', f'{url}?{params}'], capture_output=True, text=True)
    try:
        rows = json.loads(result.stdout)
        stamps = [r[0] for r in rows[1:]]
    except Exception:
        return []
    if not stamps:
        return []
    stamps.sort(key=lambda t: abs(int(t[:8]) - 20130628))
    return stamps

def recover(path):
    original = 'http://www.barbie.com' + path
    relative = path.lstrip('/')
    target = ROOT / 'public' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    stamps = cdx(path)
    if not stamps:
        stamps = cdx(path, from_year='2012')
    entry = {'original': original, 'local': str(target.relative_to(ROOT)), 'ok': False, 'error': 'no 2012-2013 capture'}
    for ts in stamps[:4]:
        url = f'https://web.archive.org/web/{ts}id_/{original}'
        result = subprocess.run(['curl', '-L', '--retry', '3', '--retry-all-errors', '--retry-delay', '2', '--max-time', '60', '-sS', '-w', '%{http_code}', url, '-o', str(target)], capture_output=True, text=True)
        data = target.read_bytes() if target.exists() else b''
        valid = result.stdout.strip() == '200' and bool(data) and not data.lstrip().startswith((b'<', b'<!'))
        if valid:
            entry = {'original': original, 'archive': f'https://web.archive.org/web/{ts}id_/{original}', 'capture': ts, 'local': str(target.relative_to(ROOT)), 'ok': True, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
            print(f'OK {relative} capture={ts} bytes={len(data)}', flush=True)
            return entry
        if target.exists():
            target.unlink()
    print(f'MISSING {relative} (tried {stamps[:4]})', flush=True)
    return entry

if __name__ == '__main__':
    paths = sys.argv[1:]
    entries = list(concurrent.futures.ThreadPoolExecutor(max_workers=2).map(recover, paths))
    manifest = ROOT / 'research' / 'asset-manifest.json'
    previous = json.loads(manifest.read_text()) if manifest.exists() else []
    merged = {e['original']: e for e in previous + entries}
    manifest.write_text(json.dumps(list(merged.values()), indent=2) + '\n')
