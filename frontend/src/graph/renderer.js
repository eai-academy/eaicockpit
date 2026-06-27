import ForceGraph3D from "3d-force-graph";
import { setState } from "../state/store.js";

const STATUS_COLORS = {
  active: "#7C3AED",
  done: "#10B981",
  wip: "#F59E0B",
  pending: "#EF4444",
  blocked: "#EF4444",
};

const NODE_SIZE_MAP = {
  workspace: 14,
  video: 8,
  skill: 8,
  folder: 6,
  doc: 5,
};

let _graph = null;

export function initGraph(canvas, onNodeClick) {
  _graph = ForceGraph3D({ canvas })(canvas)
    .backgroundColor("#0A0A1A")
    .nodeLabel((node) => sanitizeText(node.label))
    .nodeColor((node) => STATUS_COLORS[node.status] || "#7C3AED")
    .nodeVal((node) => NODE_SIZE_MAP[node.type] || 8)
    .nodeOpacity(0.92)
    .linkColor(() => "rgba(124, 58, 237, 0.4)")
    .linkWidth(1.2)
    .linkDirectionalParticles((link) => (link.type === "hierarchy" ? 2 : 0))
    .linkDirectionalParticleSpeed(0.004)
    .linkDirectionalParticleColor(() => "#06B6D4")
    .onNodeClick((node) => {
      setState({ selectedNode: node });
      onNodeClick(node);
    })
    .onBackgroundClick(() => setState({ selectedNode: null }))
    .cooldownTicks(120)
    .onEngineStop(() => _graph.cooldownTicks(0));

  window.addEventListener("resize", handleResize);
  return _graph;
}

export function updateGraphData(data) {
  if (!_graph) return;
  const nodes = data.nodes.map((n) => ({ ...n }));
  const links = data.links.map((l) => ({ ...l }));
  _graph.graphData({ nodes, links });
  _graph.cooldownTicks(120);
}

export function destroyGraph() {
  if (!_graph) return;
  window.removeEventListener("resize", handleResize);
  _graph._destructor?.();
  _graph = null;
}

function handleResize() {
  if (!_graph) return;
  _graph.width(window.innerWidth).height(window.innerHeight);
}

function sanitizeText(text) {
  if (typeof text !== "string") return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
