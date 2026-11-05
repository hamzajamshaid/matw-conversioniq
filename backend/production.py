from pathlib import Path

from fastapi import HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from main import app, health, predict, SessionInput

# Production aliases; existing development endpoints remain unchanged
app.add_api_route("/api/health", health, methods=["GET"])
app.add_api_route("/api/predict", predict, methods=["POST"])

DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if DIST.is_dir():
    assets = DIST / "assets"

    if assets.is_dir():
        app.mount("/assets", StaticFiles(directory=assets), name="assets")

    @app.get("/", include_in_schema=False)
    def serve_home():
        return FileResponse(DIST / "index.html")

    @app.get("/{path:path}", include_in_schema=False)
    def serve_frontend(path: str):
        requested = (DIST / path).resolve()

        if requested.is_relative_to(DIST.resolve()) and requested.is_file():
            return FileResponse(requested)

        if "." in Path(path).name:
            raise HTTPException(status_code=404)

        return FileResponse(DIST / "index.html")
