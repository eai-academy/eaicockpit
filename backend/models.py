"""Modelos Pydantic — contrato de dados entre backend e frontend."""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class NodeType(str, Enum):
    workspace = "workspace"
    video = "video"
    skill = "skill"
    folder = "folder"
    doc = "doc"


class NodeStatus(str, Enum):
    active = "active"
    done = "done"
    wip = "wip"
    pending = "pending"
    blocked = "blocked"


STATUS_COLORS: dict[NodeStatus, str] = {
    NodeStatus.active: "#7C3AED",
    NodeStatus.done: "#10B981",
    NodeStatus.wip: "#F59E0B",
    NodeStatus.pending: "#EF4444",
    NodeStatus.blocked: "#EF4444",
}

LINK_TYPES = {"hierarchy", "sibling", "semantic", "dependency"}


class Node(BaseModel):
    id: str
    type: NodeType
    label: str
    status: NodeStatus = NodeStatus.active
    child_count: int = Field(default=0, alias="childCount")
    color: str = "#7C3AED"
    size: float = 8.0
    preview_endpoint: str | None = Field(default=None, alias="previewEndpoint")

    model_config = {"populate_by_name": True}


class Link(BaseModel):
    source: str
    target: str
    type: str = "hierarchy"


class Graph(BaseModel):
    level: int
    parent_id: str | None = Field(default=None, alias="parentId")
    nodes: list[Node] = []
    links: list[Link] = []

    model_config = {"populate_by_name": True}


class PipelineStep(BaseModel):
    name: str
    done: bool
    label: str


class NodeDetail(BaseModel):
    id: str
    type: NodeType
    label: str
    status: NodeStatus
    path: str
    pipeline: list[PipelineStep] = []
    preview: dict[str, Any] = {}
    actions: list[dict[str, str]] = []


class WorkspaceConfig(BaseModel):
    id: str
    path: str
    label: str


class Settings(BaseModel):
    sound: bool = False
    bloom: bool = True
    particles: bool = True
    auto_orbit: bool = True
    quality: str = "high"
    show_fps: bool = False
