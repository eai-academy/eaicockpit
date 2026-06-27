"""CLI do eAI Cockpit — comandos: add, remove, list, start."""

from __future__ import annotations

import hashlib
import webbrowser
from pathlib import Path

import click
import uvicorn

from backend import __version__
from backend.config import add_workspace, get_workspaces, remove_workspace
from backend.models import WorkspaceConfig


@click.group()
@click.version_option(version=__version__, prog_name="eaicockpit")
def cli() -> None:
    """eAI Cockpit — visualizador 3D de projetos Claude Code."""


@cli.command()
@click.argument("path", type=click.Path(exists=True, file_okay=False, resolve_path=True))
def add(path: str) -> None:
    """Adiciona uma pasta como workspace."""
    resolved = Path(path)
    ws_id = "ws:" + hashlib.md5(str(resolved).encode()).hexdigest()[:8]
    ws = WorkspaceConfig(id=ws_id, path=str(resolved), label=resolved.name)
    add_workspace(ws)
    click.echo(f"✓ Workspace adicionado: {resolved.name} ({ws_id})")


@cli.command(name="remove")
@click.argument("workspace_id")
def remove_cmd(workspace_id: str) -> None:
    """Remove um workspace pelo ID."""
    if remove_workspace(workspace_id):
        click.echo(f"✓ Workspace removido: {workspace_id}")
    else:
        click.echo(f"✗ Workspace não encontrado: {workspace_id}", err=True)
        raise SystemExit(1)


@cli.command(name="list")
def list_cmd() -> None:
    """Lista workspaces configurados."""
    workspaces = get_workspaces()
    if not workspaces:
        click.echo("Nenhum workspace configurado. Use: eaicockpit add <pasta>")
        return
    for ws in workspaces:
        exists = "✓" if Path(ws.path).exists() else "✗"
        click.echo(f"  {exists} [{ws.id}] {ws.label} — {ws.path}")


@cli.command()
@click.option("--host", default="127.0.0.1", show_default=True, help="Host do servidor.")
@click.option("--port", default=7373, show_default=True, help="Porta do servidor.")
@click.option("--no-open", is_flag=True, default=False, help="Não abrir o navegador.")
@click.option("--reload", is_flag=True, default=False, hidden=True)
def start(host: str, port: int, no_open: bool, reload: bool) -> None:
    """Inicia o cockpit e abre no navegador."""
    if host not in ("127.0.0.1", "localhost"):
        click.echo(
            f"⚠️  Atenção: servidor exposto em {host}. Garanta que sua rede é segura.",
            err=True,
        )

    url = f"http://{host}:{port}"
    click.echo(f"🛸 eAI Cockpit iniciando em {url}")

    if not no_open:
        webbrowser.open(url)

    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="warning",
    )
