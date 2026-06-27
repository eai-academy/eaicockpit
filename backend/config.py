"""Leitura e escrita de .eaicockpit/config.json."""

from __future__ import annotations

import json
from pathlib import Path

from backend.models import Settings, WorkspaceConfig

_CONFIG_DIR = Path.home() / ".eaicockpit"
_CONFIG_FILE = _CONFIG_DIR / "config.json"


def _ensure_dir() -> None:
    _CONFIG_DIR.mkdir(parents=True, exist_ok=True)


def _load_raw() -> dict:  # type: ignore[type-arg]
    if not _CONFIG_FILE.exists():
        return {"workspaces": [], "settings": {}}
    with _CONFIG_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)  # type: ignore[no-any-return]


def _save_raw(data: dict) -> None:  # type: ignore[type-arg]
    _ensure_dir()
    with _CONFIG_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_workspaces() -> list[WorkspaceConfig]:
    raw = _load_raw()
    return [WorkspaceConfig(**w) for w in raw.get("workspaces", [])]


def save_workspaces(workspaces: list[WorkspaceConfig]) -> None:
    raw = _load_raw()
    raw["workspaces"] = [w.model_dump() for w in workspaces]
    _save_raw(raw)


def add_workspace(workspace: WorkspaceConfig) -> None:
    workspaces = get_workspaces()
    if any(w.id == workspace.id for w in workspaces):
        return
    workspaces.append(workspace)
    save_workspaces(workspaces)


def remove_workspace(workspace_id: str) -> bool:
    workspaces = get_workspaces()
    filtered = [w for w in workspaces if w.id != workspace_id]
    if len(filtered) == len(workspaces):
        return False
    save_workspaces(filtered)
    return True


def get_settings() -> Settings:
    raw = _load_raw()
    return Settings(**raw.get("settings", {}))


def save_settings(settings: Settings) -> None:
    raw = _load_raw()
    raw["settings"] = settings.model_dump()
    _save_raw(raw)
