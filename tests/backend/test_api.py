"""Testes de rotas da API FastAPI."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.main import app


@pytest.fixture()
def config_dir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    cfg_dir = tmp_path / ".eaicockpit"
    monkeypatch.setattr("backend.config._CONFIG_DIR", cfg_dir)
    monkeypatch.setattr("backend.config._CONFIG_FILE", cfg_dir / "config.json")
    return cfg_dir


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def test_health(client: TestClient) -> None:
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_graph_empty(client: TestClient, config_dir: Path) -> None:
    r = client.get("/api/graph?level=0")
    assert r.status_code == 200
    data = r.json()
    assert data["level"] == 0
    assert data["nodes"] == []


def test_add_workspace_invalid_path(client: TestClient, config_dir: Path) -> None:
    r = client.post("/api/workspace", params={"path": "/nao/existe/nunca"})
    assert r.status_code == 400


def test_add_workspace_valid(client: TestClient, config_dir: Path, tmp_path: Path) -> None:
    folder = tmp_path / "meu-projeto"
    folder.mkdir()
    r = client.post("/api/workspace", params={"path": str(folder)})
    assert r.status_code == 201
    data = r.json()
    assert data["label"] == "meu-projeto"
    assert data["id"].startswith("ws:")


def test_delete_workspace_not_found(client: TestClient, config_dir: Path) -> None:
    r = client.delete("/api/workspace/ws:ghost")
    assert r.status_code == 404


def test_settings_round_trip(client: TestClient, config_dir: Path) -> None:
    payload = {
        "sound": True,
        "bloom": False,
        "particles": True,
        "auto_orbit": False,
        "quality": "low",
        "show_fps": True,
    }
    r = client.put("/api/settings", json=payload)
    assert r.status_code == 200
    r2 = client.get("/api/settings")
    assert r2.json()["sound"] is True
    assert r2.json()["bloom"] is False


def test_node_not_found(client: TestClient, config_dir: Path) -> None:
    r = client.get("/api/node/ws:ghost")
    assert r.status_code == 404
