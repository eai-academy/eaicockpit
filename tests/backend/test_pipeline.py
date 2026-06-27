"""Testes de pipeline.py — status e etapas."""

from __future__ import annotations

from pathlib import Path

import pytest

from backend.models import NodeStatus
from backend.pipeline import compute_status, get_pipeline_steps


@pytest.fixture()
def video_empty(tmp_path: Path) -> Path:
    return tmp_path


@pytest.fixture()
def video_wip(tmp_path: Path) -> Path:
    (tmp_path / "roteiro.md").write_text("r")
    (tmp_path / "fonte.md").write_text("f")
    (tmp_path / "cortes.md").write_text("c")
    return tmp_path


@pytest.fixture()
def video_done(tmp_path: Path) -> Path:
    (tmp_path / "publicado.md").write_text("p")
    return tmp_path


def test_pipeline_steps_count(video_empty: Path) -> None:
    steps = get_pipeline_steps(video_empty)
    assert len(steps) == 8


def test_pipeline_empty_all_false(video_empty: Path) -> None:
    steps = get_pipeline_steps(video_empty)
    assert all(not s.done for s in steps)


def test_pipeline_wip_partial(video_wip: Path) -> None:
    steps = get_pipeline_steps(video_wip)
    done = {s.name for s in steps if s.done}
    assert "roteiro" in done
    assert "cortes" in done
    assert "publicado" not in done


def test_compute_status_done(video_done: Path) -> None:
    steps = get_pipeline_steps(video_done)
    assert compute_status(steps) == NodeStatus.done


def test_compute_status_wip(video_wip: Path) -> None:
    steps = get_pipeline_steps(video_wip)
    assert compute_status(steps) == NodeStatus.wip


def test_compute_status_pending(video_empty: Path) -> None:
    steps = get_pipeline_steps(video_empty)
    assert compute_status(steps) == NodeStatus.pending
