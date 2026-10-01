"""Local static preview with legacy page-route fallback. No network proxy."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import os

os.chdir(Path(__file__).resolve().parent.parent / 'public')
class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.wasm':'application/wasm', '.swf':'application/x-shockwave-flash', '.xml':'application/xml'}
    def do_GET(self):
        p = urlsplit(self.path).path
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
