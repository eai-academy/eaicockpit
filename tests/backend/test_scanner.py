"""Testes de scanner.py — classificação e segurança de caminho."""

from __future__ import annotations

from pathlib import Path

import pytest

from backend.scanner import (
    classify_node,
    extract_wikilinks,
    is_claude_workspace,
    scan_workspace,
)


@pytest.fixture()
def workspace(tmp_path: Path) -> Path:
    """Workspace fake com estrutura de vídeos e skills."""
    # Workspace Claude Code
    (tmp_path / "CLAUDE.md").write_text("# Test")
    # Vídeo em andamento
    video = tmp_path / "videos" / "video-skills"
    video.mkdir(parents=True)
    (video / "roteiro.md").write_text("roteiro")
    (video / "fonte.md").write_text("fonte")
    # Vídeo publicado
    video2 = tmp_path / "videos" / "video-api"
    video2.mkdir(parents=True)
    (video2 / "publicado.md").write_text("publicado")
    # Skill
    skill = tmp_path / "skills" / "minha-skill"
    skill.mkdir(parents=True)
    (skill / "skill.md").write_text("skill")
    # Doc solto
    (tmp_path / "README.md").write_text("leia-me")
    return tmp_path


def test_is_claude_workspace(workspace: Path) -> None:
    assert is_claude_workspace(workspace) is True


def test_is_not_claude_workspace(tmp_path: Path) -> None:
    assert is_claude_workspace(tmp_path) is False


def test_scan_workspace_returns_dirs(workspace: Path) -> None:
    results = scan_workspace(workspace)
    names = {p.name for p in results}
    assert "videos" in names
    assert "skills" in names


def test_scan_skips_hidden(workspace: Path) -> None:
    hidden = workspace / ".hidden_dir"
    hidden.mkdir()
    results = scan_workspace(workspace)
    assert hidden not in results


def test_classify_video(workspace: Path) -> None:
    video_path = workspace / "videos" / "video-skills"
    node_type, status = classify_node(video_path)
    from backend.models import NodeStatus, NodeType

    assert node_type == NodeType.video
    assert status == NodeStatus.pending


def test_classify_video_published(workspace: Path) -> None:
    video_path = workspace / "videos" / "video-api"
    node_type, status = classify_node(video_path)
    from backend.models import NodeStatus, NodeType

    assert node_type == NodeType.video
    assert status == NodeStatus.done


def test_classify_skill(workspace: Path) -> None:
    skill_path = workspace / "skills" / "minha-skill"
    node_type, _ = classify_node(skill_path)
    from backend.models import NodeType

    assert node_type == NodeType.skill


def test_classify_workspace(workspace: Path) -> None:
    node_type, _ = classify_node(workspace)
    from backend.models import NodeType

    assert node_type == NodeType.workspace


def test_no_symlink_escape(workspace: Path, tmp_path: Path) -> None:
    """Symlink apontando para fora do workspace deve ser ignorado no scan."""
    outside = tmp_path.parent / "outside_secret"
    outside.mkdir(exist_ok=True)
    (outside / "secret.txt").write_text("confidential")
    link = workspace / "escape_link"
    try:
        link.symlink_to(outside)
    except (OSError, NotImplementedError):
        pytest.skip("Symlinks não suportados neste ambiente")

    results = scan_workspace(workspace)
    assert link not in results


def test_extract_wikilinks(tmp_path: Path) -> None:
    md = tmp_path / "notes.md"
    md.write_text("Veja [[projeto-a]] e também [[projeto-b]].")
    links = extract_wikilinks(md)
    assert "projeto-a" in links
    assert "projeto-b" in links


def test_extract_wikilinks_malformed(tmp_path: Path) -> None:
    md = tmp_path / "bad.md"
    md.write_text("[[sem fechar e [[outro]]")
    links = extract_wikilinks(md)
    assert "outro" in links


def test_extract_wikilinks_xss(tmp_path: Path) -> None:
    """Payload XSS em link não deve crashar o parser."""
    md = tmp_path / "xss.md"
    md.write_text("[[<script>alert(1)</script>]]")
    links = extract_wikilinks(md)
    assert len(links) == 1
