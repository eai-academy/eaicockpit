"""Varredura de diretórios e classificação de nós."""

from __future__ import annotations

import re
from pathlib import Path

from backend.models import NodeStatus, NodeType

_SKIP = {".git", ".eaicockpit", "node_modules", "__pycache__", ".venv", "venv", "dist"}
_VIDEO_MARKERS = {
    "roteiro.md",
    "fonte.md",
    "metadados",
    "publicado.md",
    "cortes.md",
    "thumbnail.png",
    "distribuicao.md",
    "transcricao.md",
}
_SKILL_MARKERS = {"skill.md", "skill.yaml", "skill.yml"}


def is_claude_workspace(path: Path) -> bool:
    """Detecta se a pasta é um workspace Claude Code."""
    return (path / ".claude").exists() or (path / "CLAUDE.md").exists()


def scan_workspace(workspace_path: Path) -> list[Path]:
    """Retorna lista de sub-projetos diretos (não recursivo, sem symlinks externos)."""
    if not workspace_path.is_dir():
        return []

    results: list[Path] = []
    for child in sorted(workspace_path.iterdir()):
        if child.name.startswith(".") or child.name in _SKIP:
            continue
        if child.is_symlink() and not child.resolve().is_relative_to(workspace_path):
            continue
        if child.is_dir():
            results.append(child)

    return results


def classify_node(path: Path) -> tuple[NodeType, NodeStatus]:
    """Classifica tipo e status de um nó dado seu caminho."""
    if not path.exists():
        return NodeType.folder, NodeStatus.blocked

    if is_claude_workspace(path):
        return NodeType.workspace, NodeStatus.active

    contents = {p.name for p in path.iterdir() if p.exists()} if path.is_dir() else set()

    if _VIDEO_MARKERS & contents:
        status = _video_status(path)
        return NodeType.video, status

    if _SKILL_MARKERS & contents:
        return NodeType.skill, NodeStatus.active

    if path.suffix == ".md":
        return NodeType.doc, NodeStatus.active

    return NodeType.folder, NodeStatus.active


def _video_status(path: Path) -> NodeStatus:
    """Calcula status do pipeline de vídeo."""
    final_steps = ["publicado.md", "distribuicao.md"]
    mid_steps = ["cortes.md", "thumbnail.png", "metadados"]
    early_steps = ["roteiro.md", "fonte.md"]

    if any((path / s).exists() for s in final_steps):
        return NodeStatus.done
    if any((path / s).exists() for s in mid_steps):
        return NodeStatus.wip
    if any((path / s).exists() for s in early_steps):
        return NodeStatus.pending
    return NodeStatus.pending


def extract_wikilinks(md_path: Path) -> list[str]:
    """Extrai [[links]] de um arquivo Markdown."""
    if not md_path.exists() or md_path.suffix != ".md":
        return []
    try:
        content = md_path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return []
    return re.findall(r"\[\[([^\[\]]+)\]\]", content)
