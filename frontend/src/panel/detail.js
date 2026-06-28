import { api } from "../api/client.js";

let _panelEl = null;
let _closeHandler = null;
let _escHandler = null;
let _abortCtrl = null; // cancels in-flight fetch when panel closes early

export function initPanel() {
  if (_panelEl) return;
  _panelEl = document.createElement("div");
  _panelEl.id = "detail-panel";
  _panelEl.className = "detail-panel";
  _panelEl.setAttribute("role", "dialog");
  _panelEl.setAttribute("aria-modal", "true");
  _panelEl.setAttribute("aria-label", "Detalhes do nó");
  document.getElementById("hud-root").appendChild(_panelEl);
}

export async function openPanel(node) {
  if (!_panelEl) initPanel();

  // Cancel any in-flight request from previous open
  _abortCtrl?.abort();
  _abortCtrl = new AbortController();

  _detachClose();
  _panelEl.innerHTML = _renderLoading();
  _panelEl.classList.add("open");

  let detail = null;
  try {
    detail = await api.getNode(node.id);
  } catch {
    // aborted or network error
  }

  if (!detail) {
    _panelEl.innerHTML = _renderError();
    _attachClose();
    return;
  }

  _panelEl.innerHTML = _renderDetail(detail);
  _attachClose();
}

export function closePanel() {
  if (!_panelEl) return;
  _abortCtrl?.abort();
  _abortCtrl = null;
  _panelEl.classList.remove("open");
  _detachClose();
  // Clear DOM after transition (~300ms) to avoid flash
  setTimeout(() => {
    if (_panelEl && !_panelEl.classList.contains("open")) {
      _panelEl.innerHTML = "";
    }
  }, 350);
}

// ── Listeners (dispose-safe) ──────────────────────────────────────────────────

function _attachClose() {
  _closeHandler = (e) => {
    if (_panelEl && !_panelEl.contains(e.target)) closePanel();
  };
  _escHandler = (e) => {
    if (e.key === "Escape") closePanel();
  };
  // Delay so the click that opened the panel doesn't immediately close it
  setTimeout(() => document.addEventListener("click", _closeHandler), 50);
  document.addEventListener("keydown", _escHandler);
  _panelEl.querySelector(".panel-close")?.addEventListener("click", closePanel);
}

function _detachClose() {
  if (_closeHandler) document.removeEventListener("click", _closeHandler);
  if (_escHandler) document.removeEventListener("keydown", _escHandler);
  _closeHandler = null;
  _escHandler = null;
}

// ── Render ────────────────────────────────────────────────────────────────────

const STATUS_LABEL = {
  active: "Ativo",
  done: "Concluído",
  wip: "Em andamento",
  pending: "Pendente",
  blocked: "Bloqueado",
};

const TYPE_LABEL = {
  workspace: "Workspace",
  video: "Vídeo",
  skill: "Skill",
  folder: "Pasta",
  doc: "Documento",
};

function _renderLoading() {
  return `<div class="panel-inner"><div class="panel-loading">
    <div class="panel-spinner"></div>
    <span>Carregando...</span>
  </div></div>`;
}

function _renderError() {
  return `<div class="panel-inner">
    <button class="panel-close" aria-label="Fechar">✕</button>
    <p class="panel-error">Não foi possível carregar os detalhes.</p>
  </div>`;
}

function _renderDetail(detail) {
  const pipeline = detail.pipeline ?? [];
  const completedSteps = pipeline.filter((s) => s.done).length;
  const progress = pipeline.length ? Math.round((completedSteps / pipeline.length) * 100) : null;

  const pipelineHtml = pipeline
    .map(
      (step) =>
        `<li class="pipeline-step ${step.done ? "done" : "pending"}">
          <span class="step-dot" aria-hidden="true"></span>
          <span class="step-label">${_esc(step.label)}</span>
        </li>`
    )
    .join("");

  const progressHtml =
    progress !== null
      ? `<div class="pipeline-progress" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
           <div class="progress-bar" style="width:${progress}%"></div>
           <span class="progress-label">${progress}% concluído</span>
         </div>`
      : "";

  const previewHtml = detail.preview?.title
    ? `<p class="preview-title">${_esc(detail.preview.title)}</p>`
    : "";

  return `
    <div class="panel-inner">
      <button class="panel-close" aria-label="Fechar painel">✕</button>
      <div class="panel-meta">
        <span class="panel-type">${_esc(TYPE_LABEL[detail.type] || detail.type)}</span>
        <span class="panel-status status-${_esc(detail.status)}">${_esc(STATUS_LABEL[detail.status] || detail.status)}</span>
      </div>
      <h2 class="panel-title">${_esc(detail.label)}</h2>
      ${previewHtml}
      ${
        pipeline.length
          ? `${progressHtml}<ul class="pipeline-list" aria-label="Pipeline">${pipelineHtml}</ul>`
          : ""
      }
      <p class="panel-path" title="${_esc(detail.path)}">${_esc(_shortPath(detail.path))}</p>
    </div>`;
}

function _shortPath(p) {
  if (!p) return "";
  const parts = p.replace(/\\/g, "/").split("/");
  return parts.length > 4 ? "…/" + parts.slice(-3).join("/") : p;
}

// All user-controlled data goes through this — prevents XSS
function _esc(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
