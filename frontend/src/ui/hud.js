import { goBack } from "../levels/navigation.js";
import { getState } from "../state/store.js";

let _hudEl = null;
let _fpsEl = null;
let _frameCount = 0;
let _lastTime = performance.now();
let _fpsLoop = null;

export function initHUD() {
  _hudEl = document.createElement("div");
  _hudEl.id = "hud-bar";
  _hudEl.className = "hud-bar";
  _hudEl.innerHTML = `
    <button id="hud-back" class="hud-btn" aria-label="Voltar" style="display:none">← Voltar</button>
    <nav id="hud-breadcrumb" class="hud-breadcrumb" aria-label="Navegação"></nav>
    <div class="hud-right">
      <span id="hud-fps" class="hud-fps" style="display:none">-- fps</span>
      <button id="hud-settings-btn" class="hud-btn" aria-label="Configurações">⚙</button>
    </div>
  `;
  document.getElementById("hud-root").appendChild(_hudEl);

  document.getElementById("hud-back").addEventListener("click", () => goBack());
  document.getElementById("hud-settings-btn").addEventListener("click", () => {
    document.getElementById("settings-modal")?.classList.toggle("open");
  });

  _fpsEl = document.getElementById("hud-fps");
}

export function updateBreadcrumb(crumbs) {
  const bc = document.getElementById("hud-breadcrumb");
  const backBtn = document.getElementById("hud-back");
  if (!bc) return;

  bc.innerHTML = crumbs
    .map((c, i) => {
      const isLast = i === crumbs.length - 1;
      if (isLast || !c.action) return `<span class="crumb">${escapeHtml(c.label)}</span>`;
      return `<button class="crumb crumb-link">${escapeHtml(c.label)}</button>`;
    })
    .join('<span class="crumb-sep">›</span>');

  crumbs.forEach((c, i) => {
    if (c.action && i < crumbs.length - 1) {
      const btns = bc.querySelectorAll(".crumb-link");
      btns[i]?.addEventListener("click", c.action);
    }
  });

  if (backBtn) backBtn.style.display = getState().level > 0 ? "block" : "none";
}

export function showFPS(visible) {
  if (_fpsEl) _fpsEl.style.display = visible ? "inline" : "none";
  if (visible) _startFPSLoop();
  else _stopFPSLoop();
}

export function tickFPS() {
  _frameCount++;
  const now = performance.now();
  if (now - _lastTime >= 500) {
    const fps = Math.round((_frameCount * 1000) / (now - _lastTime));
    if (_fpsEl && _fpsEl.style.display !== "none") _fpsEl.textContent = `${fps} fps`;
    _frameCount = 0;
    _lastTime = now;
  }
}

function _startFPSLoop() {
  if (_fpsLoop) return;
  const loop = () => {
    tickFPS();
    _fpsLoop = requestAnimationFrame(loop);
  };
  _fpsLoop = requestAnimationFrame(loop);
}

function _stopFPSLoop() {
  if (_fpsLoop) cancelAnimationFrame(_fpsLoop);
  _fpsLoop = null;
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
