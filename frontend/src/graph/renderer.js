import ForceGraph3D from "3d-force-graph";
import * as THREE from "three";
import { setState } from "../state/store.js";

export const STATUS_COLORS = {
  active: "#7C3AED",
  done: "#10B981",
  wip: "#F59E0B",
  pending: "#EF4444",
  blocked: "#EF4444",
};

const NODE_BASE_SIZE = {
  workspace: 7,
  video: 4,
  skill: 4,
  folder: 3,
  doc: 2.5,
};

// LOD thresholds (distance from camera)
const LOD_NEAR = 200;
const LOD_FAR = 500;

// Sprite texture cache — one canvas per color
const _spriteCache = new Map();

let _graph = null;
let _resizeTimer = null;

// ── Sprite helpers ────────────────────────────────────────────────────────────

function _getSpriteMaterial(hexColor) {
  if (_spriteCache.has(hexColor)) return _spriteCache.get(hexColor);

  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, hexColor + "ff");
  grd.addColorStop(0.5, hexColor + "aa");
  grd.addColorStop(1, hexColor + "00");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  _spriteCache.set(hexColor, mat);
  return mat;
}

function _disposeSprites() {
  for (const mat of _spriteCache.values()) {
    mat.map?.dispose();
    mat.dispose();
  }
  _spriteCache.clear();
}

// ── Node Three.js object with LOD ────────────────────────────────────────────

function _makeNodeObject(node) {
  const color = STATUS_COLORS[node.status] || "#7C3AED";
  const radius = NODE_BASE_SIZE[node.type] || 4;

  const lod = new THREE.LOD();

  // High detail sphere (near)
  const geoHigh = new THREE.SphereGeometry(radius, 16, 12);
  const matHigh = new THREE.MeshPhongMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.35,
    shininess: 80,
    transparent: true,
    opacity: 0.92,
  });
  lod.addLevel(new THREE.Mesh(geoHigh, matHigh), 0);

  // Medium detail sphere (mid-range)
  const geoMed = new THREE.SphereGeometry(radius, 8, 6);
  const matMed = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.88 });
  lod.addLevel(new THREE.Mesh(geoMed, matMed), LOD_NEAR);

  // Sprite billboard (far)
  const sprite = new THREE.Sprite(_getSpriteMaterial(color).clone());
  sprite.scale.setScalar(radius * 3.5);
  lod.addLevel(sprite, LOD_FAR);

  return lod;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function initGraph(container, onNodeClick) {
  _graph = ForceGraph3D()(container)
    .backgroundColor("#0A0A1A")
    .width(window.innerWidth)
    .height(window.innerHeight)
    // Custom Three.js objects with LOD
    .nodeThreeObject(_makeNodeObject)
    .nodeThreeObjectExtend(false)
    // Labels only on hover (nodeLabel renders tooltip, not 3D text — keeps it lean)
    .nodeLabel((node) => sanitizeText(node.label))
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
    // Physics: 120 ticks then freeze — stops wasting CPU when layout settles
    .cooldownTicks(120)
    .onEngineStop(() => _graph && _graph.cooldownTicks(0));

  // Ambient + directional light for Phong material
  const scene = _graph.scene();
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  const dir = new THREE.DirectionalLight(0x7c3aed, 1.2);
  dir.position.set(200, 300, 200);
  scene.add(ambient, dir);

  window.addEventListener("resize", _handleResizeThrottled);
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
  window.removeEventListener("resize", _handleResizeThrottled);
  if (_resizeTimer) clearTimeout(_resizeTimer);

  // Dispose all custom node objects
  const { nodes } = _graph.graphData();
  nodes.forEach((node) => {
    const obj = _graph.nodeThreeObject()(node);
    _disposeObject3D(obj);
  });

  _disposeSprites();
  _graph._destructor?.();
  _graph = null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _handleResizeThrottled() {
  if (_resizeTimer) return;
  _resizeTimer = setTimeout(() => {
    _resizeTimer = null;
    if (_graph) _graph.width(window.innerWidth).height(window.innerHeight);
  }, 100);
}

function _disposeObject3D(obj) {
  if (!obj) return;
  if (obj.geometry) obj.geometry.dispose();
  if (obj.material) {
    if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
    else obj.material.dispose();
  }
  if (obj.children) obj.children.forEach(_disposeObject3D);
}

function sanitizeText(text) {
  if (typeof text !== "string") return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
