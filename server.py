"""Small GitHub Pages-style server for local preview.

Unknown extensionless paths receive 404.html while keeping the requested URL,
which lets the browser router resolve /notes and post slugs from the JSON archives.
"""

from argparse import ArgumentParser
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import webbrowser


ROOT = Path(__file__).parent.resolve()


class PagesHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        clean_path = unquote(urlsplit(path).path).lstrip("/")
        if self.server.base_path and clean_path.startswith(self.server.base_path):
            clean_path = clean_path[len(self.server.base_path):].lstrip("/")
        return str(ROOT / clean_path)

    def do_GET(self):
        requested = Path(self.translate_path(self.path))
        if requested.is_dir():
            requested = requested / "index.html"
            self.path = self.path.rstrip("/") + "/index.html"
        if requested.is_file():
            return super().do_GET()

        path = urlsplit(self.path).path.rstrip("/")
        if path and Path(path).suffix:
            self.send_error(HTTPStatus.NOT_FOUND)
            return

        fallback = ROOT / "404.html"
        content = fallback.read_bytes()
        self.send_response(HTTPStatus.NOT_FOUND)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


def main():
    parser = ArgumentParser(description="Preview AI, Actually like a static GitHub Pages site.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=4173, type=int)
    parser.add_argument("--base-path", default="/", help="Optional deployment path, e.g. /documenting-ai")
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), PagesHandler)
    server.base_path = args.base_path.strip("/")
    preview_url = f"http://{args.host}:{args.port}{args.base_path.rstrip('/')}/"
    print(f"AI, Actually preview: {preview_url}")
    print("Unknown extensionless paths are served through 404.html for slug routing.")
    webbrowser.open(preview_url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nPreview stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()