import { api } from "../api/client.js";
import { getState, setState } from "../state/store.js";
import { setOrbitEnabled } from "../camera/controls.js";
import { showFPS } from "./hud.js";
import { setBloomEnabled } from "../fx/bloom.js";

export function initSettings() {
  const modal = document.createElement("div");
  modal.id = "settings-modal";
  modal.className = "settings-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-label", "Configurações");
  modal.innerHTML = renderSettings(getState().settings);
  document.getElementById("hud-root").appendChild(modal);

  modal.addEventListener("change", (e) => {
    const { name, checked, value, type } = e.target;
    const val = type === "checkbox" ? checked : value;
    const s = { ...getState().settings, [name]: val };
    setState({ settings: s });
    applySettings(s);
    api.saveSettings(s).catch(() => {});
  });

  modal
    .querySelector(".settings-close")
    ?.addEventListener("click", () => modal.classList.remove("open"));
}

export function applySettings(settings) {
  setOrbitEnabled(settings.auto_orbit);
  showFPS(settings.show_fps);
  setBloomEnabled(settings.bloom);
}

export async function loadSettings() {
  const s = await api.getSettings().catch(() => null);
  if (!s) return;
  const saved = Object.fromEntries(
    Object.entries(s).filter(([, v]) => v !== null && v !== undefined)
  );
  const merged = { ...getState().settings, ...saved };
  setState({ settings: merged });
  applySettings(merged);
}

function renderSettings(s) {
  const toggle = (name, label, checked) =>
    `<label class="settings-row">
      <span>${escapeHtml(label)}</span>
      <input type="checkbox" name="${name}" ${checked ? "checked" : ""} />
    </label>`;

  return `
    <div class="settings-inner">
      <div class="settings-header">
        <h3>Configurações</h3>
        <button class="settings-close" aria-label="Fechar configurações">✕</button>
      </div>
      ${toggle("bloom", "Bloom / Glow", s.bloom)}
      ${toggle("particles", "Partículas", s.particles)}
      ${toggle("auto_orbit", "Órbita automática", s.auto_orbit)}
      ${toggle("sound", "Som sutil", s.sound)}
      ${toggle("show_fps", "Mostrar FPS", s.show_fps)}
      <label class="settings-row">
        <span>Qualidade</span>
        <select name="quality">
          <option value="high" ${s.quality === "high" ? "selected" : ""}>Alta</option>
          <option value="low" ${s.quality === "low" ? "selected" : ""}>Baixa (mais rápido)</option>
        </select>
      </label>
    </div>`;
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
