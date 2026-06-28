"""Montagem do grafo de nós/arestas por nível."""

from __future__ import annotations

from pathlib import Path

from backend.models import (
    STATUS_COLORS,
    Graph,
    Link,
    Node,
    NodeDetail,
    NodeStatus,
    NodeType,
    PipelineStep,
    WorkspaceConfig,
)
from backend.scanner import classify_node, scan_workspace

# Limite de nós por nível — anti-DoS: workspace enorme não trava o cliente
MAX_NODES_PER_LEVEL = 500


def _node_color(status: NodeStatus) -> str:
    return STATUS_COLORS.get(status, "#7C3AED")


def _workspace_status(workspace_path: Path) -> NodeStatus:
    """Heurística simples de status para o workspace."""
    if not workspace_path.exists():
        return NodeStatus.blocked
    return NodeStatus.active


def build_graph(
    workspaces: list[WorkspaceConfig],
    level: int = 0,
    parent_id: str | None = None,
) -> Graph:
    if level == 0 or parent_id is None:
        return _build_galaxy(workspaces)
    return _build_world(parent_id, workspaces)


def _build_galaxy(workspaces: list[WorkspaceConfig]) -> Graph:
    """Nível 0 — cada nó é um workspace."""
    nodes: list[Node] = []
    links: list[Link] = []

    for ws in workspaces:
        ws_path = Path(ws.path)
        status = _workspace_status(ws_path)
        children = scan_workspace(ws_path) if ws_path.exists() else []
        nodes.append(
            Node(
                id=ws.id,
                type=NodeType.workspace,
                label=ws.label,
                status=status,
                child_count=len(children),
                color=_node_color(status),
                size=14,
                preview_endpoint=f"/api/node/{ws.id}",
            )
        )

    # Arestas "sibling" entre workspaces (opcional — só se houver mais de 1)
    for i in range(len(nodes) - 1):
        links.append(Link(source=nodes[i].id, target=nodes[i + 1].id, type="sibling"))

    return Graph(level=0, nodes=nodes, links=links)


def _build_world(parent_id: str, workspaces: list[WorkspaceConfig]) -> Graph:
    """Nível 1 — filhos de um workspace."""
    ws = next((w for w in workspaces if w.id == parent_id), None)
    if ws is None:
        return Graph(level=1, parent_id=parent_id)

    ws_path = Path(ws.path)
    items = scan_workspace(ws_path)
    nodes: list[Node] = []
    links: list[Link] = []

    for item in items[:MAX_NODES_PER_LEVEL]:
        node_type, status = classify_node(item)
        node_id = f"{parent_id}/{item.name}"
        nodes.append(
            Node(
                id=node_id,
                type=node_type,
                label=item.name,
                status=status,
                color=_node_color(status),
                size=8,
                preview_endpoint=f"/api/node/{node_id}",
            )
        )
        links.append(Link(source=parent_id, target=node_id, type="hierarchy"))

    return Graph(level=1, parent_id=parent_id, nodes=nodes, links=links)


def get_node_detail(node_id: str, workspaces: list[WorkspaceConfig]) -> NodeDetail | None:
    """Detalhe completo de um nó — lazy (só chamado no clique)."""
    # Workspace (nível 0)
    ws = next((w for w in workspaces if w.id == node_id), None)
    if ws:
        ws_path = Path(ws.path)
        return NodeDetail(
            id=node_id,
            type=NodeType.workspace,
            label=ws.label,
            status=_workspace_status(ws_path),
            path=ws.path,
            actions=[{"label": "Abrir pasta", "action": f"open:{ws.path}"}],
        )

    # Nó filho (nível 1)
    parts = node_id.split("/", 1)
    if len(parts) != 2:
        return None
    ws_id, rel = parts
    ws = next((w for w in workspaces if w.id == ws_id), None)
    if ws is None:
        return None

    item_path = Path(ws.path) / rel
    if not item_path.exists():
        return None

    node_type, status = classify_node(item_path)
    pipeline = _build_pipeline(item_path, node_type)

    preview: dict[str, object] = {}
    title_file = item_path / "metadados" / "titulo.md"
    if title_file.exists():
        preview["title"] = title_file.read_text(encoding="utf-8").strip()[:200]

    return NodeDetail(
        id=node_id,
        type=node_type,
        label=item_path.name,
        status=status,
        path=str(item_path),
        pipeline=pipeline,
        preview=preview,
        actions=[{"label": "Abrir pasta", "action": f"open:{item_path}"}],
    )


def _build_pipeline(path: Path, node_type: NodeType) -> list[PipelineStep]:
    if node_type != NodeType.video:
        return []

    steps = [
        ("roteiro", "roteiro.md", "Roteiro"),
        ("fonte", "fonte.md", "Fonte"),
        ("transcricao", "transcricao.md", "Transcrição"),
        ("metadados", "metadados/titulo.md", "Metadados"),
        ("thumbnail", "thumbnail.png", "Thumbnail"),
        ("cortes", "cortes.md", "Cortes"),
        ("distribuicao", "distribuicao.md", "Distribuição"),
        ("publicado", "publicado.md", "Publicado"),
    ]

    return [
        PipelineStep(name=key, done=(path / rel).exists(), label=label) for key, rel, label in steps
    ]
