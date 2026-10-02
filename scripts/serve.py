"""Local static preview with legacy page-route fallback. No network proxy."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import os

os.chdir(Path(__file__).resolve().parent.parent / 'public')
# I Can Be legacy aliases: the original site 301'd games/careers/videos.html to the
# index pages, and the nav's Dolls link (Dolls/index.html) was 404/500 in the original
# — it now leads to the restored Team Barbie page (documented fix).
ICANBE_REDIRECTS = {
    '/_original/icanbe.barbie.com/en_us/games.html': '/_original/icanbe.barbie.com/en_US/games/index.html',
    '/_original/icanbe.barbie.com/en_us/careers.html': '/_original/icanbe.barbie.com/en_US/careers/index.html',
    '/_original/icanbe.barbie.com/en_us/videos.html': '/_original/icanbe.barbie.com/en_US/videos/index.html',
    '/_original/icanbe.barbie.com/en_us/dolls/index.html': '/_original/icanbe.barbie.com/en_US/dolls/team_barbie.html',
}
class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.wasm':'application/wasm', '.swf':'application/x-shockwave-flash', '.xml':'application/xml'}
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()
    def do_GET(self):
        p = urlsplit(self.path).path
        for src, dst in ICANBE_REDIRECTS.items():
            if p.lower() == src.lower():
                self.send_response(302)
                self.send_header('Location', dst)
                self.end_headers()
                return
        if p in ('/_original/icanbe.barbie.com', '/_original/icanbe.barbie.com/'):
            self.send_response(302)
            self.send_header('Location', '/_original/icanbe.barbie.com/en_us/index.html')
            self.end_headers()
            return
        if p.startswith('/_external/'):
            self.path='/index.html'
        if not Path(self.translate_path(p)).is_file() and (p.endswith(('/', '.aspx', '.html')) or not Path(p).suffix):
            self.path='/index.html'
        super().do_GET()
ThreadingHTTPServer(('0.0.0.0', 4173), Handler).serve_forever()
