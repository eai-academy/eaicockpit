import { api } from "../api/client.js";

let _panelEl = null;
let _closeHandler = null;
let _escHandler = null;

export function initPanel() {
  _panelEl = document.getElementById("detail-panel");
  if (!_panelEl) {
    _panelEl = document.createElement("div");
    _panelEl.id = "detail-panel";
    _panelEl.className = "detail-panel";
    _panelEl.setAttribute("role", "dialog");
    _panelEl.setAttribute("aria-modal", "true");
    document.getElementById("hud-root").appendChild(_panelEl);
  }
}

export async function openPanel(node) {
  if (!_panelEl) initPanel();
  _panelEl.innerHTML = renderLoading();
  _panelEl.classList.add("open");

  const detail = await api.getNode(node.id).catch(() => null);
  if (!detail) {
    _panelEl.innerHTML = renderError();
    _attachClose();
    return;
  }
  _panelEl.innerHTML = renderDetail(detail);
  _attachClose();
}

export function closePanel() {
  if (!_panelEl) return;
  _panelEl.classList.remove("open");
  _panelEl.innerHTML = "";
  _detachClose();
}

function _attachClose() {
  _detachClose();
  _closeHandler = (e) => {
    if (!_panelEl.contains(e.target)) closePanel();
  };
  _escHandler = (e) => {
    if (e.key === "Escape") closePanel();
  };
  setTimeout(() => document.addEventListener("click", _closeHandler), 10);
  document.addEventListener("keydown", _escHandler);
  _panelEl.querySelector(".panel-close")?.addEventListener("click", closePanel);
}

function _detachClose() {
  if (_closeHandler) document.removeEventListener("click", _closeHandler);
  if (_escHandler) document.removeEventListener("keydown", _escHandler);
  _closeHandler = null;
  _escHandler = null;
}

function renderLoading() {
  return `<div class="panel-inner"><p class="panel-loading">Carregando...</p></div>`;
}

function renderError() {
  return `<div class="panel-inner">
    <button class="panel-close" aria-label="Fechar">✕</button>
    <p class="panel-error">Não foi possível carregar o nó.</p>
  </div>`;
}

function renderDetail(detail) {
  const pipelineHtml = detail.pipeline
    .map(
      (step) =>
        `<li class="pipeline-step ${step.done ? "done" : ""}">
          <span class="step-dot"></span>
          <span class="step-label">${escapeHtml(step.label)}</span>
        </li>`
    )
    .join("");

  const previewHtml = detail.preview?.title
    ? `<p class="preview-title">${escapeHtml(detail.preview.title)}</p>`
    : "";

  return `
    <div class="panel-inner">
      <button class="panel-close" aria-label="Fechar painel">✕</button>
      <div class="panel-type">${escapeHtml(detail.type)}</div>
      <h2 class="panel-title">${escapeHtml(detail.label)}</h2>
      <div class="panel-status status-${escapeHtml(detail.status)}">${escapeHtml(detail.status)}</div>
      ${previewHtml}
      ${
        detail.pipeline.length
          ? `<ul class="pipeline-list">${pipelineHtml}</ul>`
          : ""
      }
      <div class="panel-path">${escapeHtml(detail.path)}</div>
    </div>`;
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
