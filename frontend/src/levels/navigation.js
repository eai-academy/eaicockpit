import { api } from "../api/client.js";
import { animateCollapse, animateExpand, focusNode, resetCamera } from "../camera/controls.js";
import { getState, setState } from "../state/store.js";
import { updateGraphData } from "../graph/renderer.js";
import { updateBreadcrumb } from "../ui/hud.js";

export async function loadLevel0() {
  const data = await api.getGraph(0, null);
  setState({ level: 0, parentId: null, graphData: data });
  updateGraphData(data);
  updateBreadcrumb([{ label: "Galáxia" }]);
  resetCamera();
}

export async function drillInto(node) {
  if (node.type !== "workspace" && getState().level === 0) return;
  if (getState().level === 1) return;

  animateCollapse(async () => {
    const data = await api.getGraph(1, node.id);
    setState({ level: 1, parentId: node.id, graphData: data });
    updateGraphData(data);
    updateBreadcrumb([{ label: "Galáxia", action: goBack }, { label: node.label }]);
    animateExpand(() => focusNode(node));
  });
}

export function goBack() {
  const { level } = getState();
  if (level === 0) return;
  animateCollapse(() => {
    loadLevel0();
    animateExpand(null);
  });
}
