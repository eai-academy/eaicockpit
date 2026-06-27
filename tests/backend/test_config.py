"""Testes de config.py — round-trip e casos de borda."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from backend.models import Settings, WorkspaceConfig


@pytest.fixture()
def config_dir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    cfg_dir = tmp_path / ".eaicockpit"
    monkeypatch.setattr("backend.config._CONFIG_DIR", cfg_dir)
    monkeypatch.setattr("backend.config._CONFIG_FILE", cfg_dir / "config.json")
    return cfg_dir


def test_get_workspaces_empty(config_dir: Path) -> None:
    from backend.config import get_workspaces

    assert get_workspaces() == []


def test_add_and_get_workspace(config_dir: Path) -> None:
    from backend.config import add_workspace, get_workspaces

    ws = WorkspaceConfig(id="ws:test", path="/tmp/test", label="test")
    add_workspace(ws)
    result = get_workspaces()
    assert len(result) == 1
    assert result[0].id == "ws:test"


def test_add_duplicate_workspace(config_dir: Path) -> None:
    from backend.config import add_workspace, get_workspaces

    ws = WorkspaceConfig(id="ws:dup", path="/tmp/dup", label="dup")
    add_workspace(ws)
    add_workspace(ws)
    assert len(get_workspaces()) == 1


def test_remove_workspace(config_dir: Path) -> None:
    from backend.config import add_workspace, get_workspaces, remove_workspace

    ws = WorkspaceConfig(id="ws:rm", path="/tmp/rm", label="rm")
    add_workspace(ws)
    assert remove_workspace("ws:rm") is True
    assert get_workspaces() == []


def test_remove_nonexistent(config_dir: Path) -> None:
    from backend.config import remove_workspace

    assert remove_workspace("ws:ghost") is False


def test_settings_round_trip(config_dir: Path) -> None:
    from backend.config import get_settings, save_settings

    s = Settings(sound=True, bloom=False, quality="low")
    save_settings(s)
    loaded = get_settings()
    assert loaded.sound is True
    assert loaded.bloom is False
    assert loaded.quality == "low"


def test_config_file_created(config_dir: Path) -> None:
    from backend.config import add_workspace

    ws = WorkspaceConfig(id="ws:x", path="/x", label="x")
    add_workspace(ws)
    cfg_file = config_dir / "config.json"
    assert cfg_file.exists()
    data = json.loads(cfg_file.read_text())
    assert len(data["workspaces"]) == 1
