import "./styles/global.css";
import "./styles/hud.css";

import { api } from "./api/client.js";
import { initGraph } from "./graph/renderer.js";
import { initCamera } from "./camera/controls.js";
import { loadLevel0, drillInto } from "./levels/navigation.js";
import { initPanel, openPanel } from "./panel/detail.js";
import { initHUD } from "./ui/hud.js";
import { initSettings, loadSettings } from "./ui/settings.js";
import { initCredits } from "./ui/credits.js";
import { showOnboarding, hideOnboarding } from "./ui/onboarding.js";
import { getState } from "./state/store.js";
import { initBloom } from "./fx/bloom.js";

async function boot() {
  const container = document.getElementById("cockpit-canvas");

  initHUD();
  initSettings();

  const graph = initGraph(container, async (node) => {
    const { level } = getState();
    if (level === 0 && node.type === "workspace") {
      drillInto(node);
    } else {
      openPanel(node);
    }
  });

  initCamera(graph);
  initPanel();
  initCredits();

  await loadSettings();

  // Init bloom after graph renderer is ready (settings may disable it)
  const settings = getState().settings;
  if (settings?.bloom !== false) {
    try {
      initBloom(graph);
    } catch {
      // Bloom unavailable (e.g. WebGL context too old) — continue without it
    }
  }

  const workspaces = await api.listWorkspaces().catch(() => []);
  if (workspaces.length === 0) {
    showOnboarding();
    return;
  }
  hideOnboarding();
  await loadLevel0();
}

boot().catch((err) => {
  console.error("eAI Cockpit boot error:", err);
});
