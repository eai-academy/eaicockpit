"""FastAPI app — rotas REST e servidor de estáticos."""

from __future__ import annotations

import hashlib
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend import __version__
from backend.config import (
    add_workspace,
    get_settings,
    get_workspaces,
    remove_workspace,
    save_settings,
)
from backend.graph import build_graph, get_node_detail
from backend.models import Graph, NodeDetail, Settings, WorkspaceConfig

app = FastAPI(
    title="eAI Cockpit",
    version=__version__,
    docs_url=None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:7373", "http://127.0.0.1:7373", "http://localhost:5173"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

_STATIC_DIR = Path(__file__).parent.parent / "frontend" / "dist"


# ── Health ────────────────────────────────────────────────────────────────────


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "version": __version__}


# ── Graph ─────────────────────────────────────────────────────────────────────


@app.get("/api/graph", response_model=Graph)
async def get_graph(level: int = 0, parent: str | None = None) -> Graph:
    workspaces = get_workspaces()
    return build_graph(workspaces, level=level, parent_id=parent)


# ── Node detail (lazy) ────────────────────────────────────────────────────────


@app.get("/api/node/{node_id:path}", response_model=NodeDetail)
async def get_node(node_id: str) -> NodeDetail:
    workspaces = get_workspaces()
    detail = get_node_detail(node_id, workspaces)
    if detail is None:
        raise HTTPException(status_code=404, detail="Node not found")
    return detail


# ── Workspaces ────────────────────────────────────────────────────────────────


@app.get("/api/workspaces")
async def list_workspaces() -> list[WorkspaceConfig]:
    return get_workspaces()


@app.post("/api/workspace", status_code=201)
async def create_workspace(path: str) -> WorkspaceConfig:
    resolved = Path(path).resolve()
    if not resolved.exists() or not resolved.is_dir():
        raise HTTPException(
            status_code=400, detail=f"Path does not exist or is not a directory: {path}"
        )
    ws_id = "ws:" + hashlib.md5(str(resolved).encode()).hexdigest()[:8]
    ws = WorkspaceConfig(id=ws_id, path=str(resolved), label=resolved.name)
    add_workspace(ws)
    return ws


@app.delete("/api/workspace/{workspace_id}")
async def delete_workspace(workspace_id: str) -> dict[str, str]:
    if not remove_workspace(workspace_id):
        raise HTTPException(status_code=404, detail="Workspace not found")
    return {"status": "removed"}


# ── Settings ──────────────────────────────────────────────────────────────────


@app.get("/api/settings", response_model=Settings)
async def read_settings() -> Settings:
    return get_settings()


@app.put("/api/settings", response_model=Settings)
async def update_settings(settings: Settings) -> Settings:
    save_settings(settings)
    return settings


# ── Frontend estático ─────────────────────────────────────────────────────────

if _STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=_STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str = "") -> FileResponse:
        index = _STATIC_DIR / "index.html"
        return FileResponse(index)
