"""Lógica de status do pipeline de vídeo (reaproveitável)."""

from __future__ import annotations

from pathlib import Path

from backend.models import NodeStatus, PipelineStep

PIPELINE_STEPS = [
    ("roteiro", "roteiro.md", "Roteiro"),
    ("fonte", "fonte.md", "Fonte"),
    ("transcricao", "transcricao.md", "Transcrição"),
    ("metadados", "metadados/titulo.md", "Metadados"),
    ("thumbnail", "thumbnail.png", "Thumbnail"),
    ("cortes", "cortes.md", "Cortes"),
    ("distribuicao", "distribuicao.md", "Distribuição"),
    ("publicado", "publicado.md", "Publicado"),
]


def get_pipeline_steps(video_path: Path) -> list[PipelineStep]:
    return [
        PipelineStep(name=key, done=(video_path / rel).exists(), label=label)
        for key, rel, label in PIPELINE_STEPS
    ]


def compute_status(steps: list[PipelineStep]) -> NodeStatus:
    done_names = {s.name for s in steps if s.done}

    if "publicado" in done_names:
        return NodeStatus.done
    if "distribuicao" in done_names or "cortes" in done_names or "thumbnail" in done_names:
        return NodeStatus.wip
    if done_names:
        return NodeStatus.pending
    return NodeStatus.pending
