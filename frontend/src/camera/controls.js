import { gsap } from "gsap";

let _graph = null;
let _orbitTimer = null;
let _orbitEnabled = true;

export function initCamera(graph) {
  _graph = graph;
  _startOrbit();
}

export function focusNode(node) {
  if (!_graph) return;
  _stopOrbit();
  const distance = 200;
  const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
  _graph.cameraPosition(
    { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
    node,
    800
  );
  setTimeout(() => _startOrbit(), 4000);
}

export function resetCamera() {
  if (!_graph) return;
  _stopOrbit();
  _graph.cameraPosition({ x: 0, y: 0, z: 600 }, { x: 0, y: 0, z: 0 }, 800);
  setTimeout(() => _startOrbit(), 1000);
}

export function setOrbitEnabled(enabled) {
  _orbitEnabled = enabled;
  if (enabled) _startOrbit();
  else _stopOrbit();
}

function _startOrbit() {
  if (!_orbitEnabled || !_graph) return;
  _stopOrbit();
  let angle = 0;
  _orbitTimer = setInterval(() => {
    if (!_graph) return;
    angle += 0.002;
    const cam = _graph.camera();
    const r = Math.sqrt(cam.position.x ** 2 + cam.position.z ** 2) || 600;
    _graph.cameraPosition({ x: Math.sin(angle) * r, z: Math.cos(angle) * r });
  }, 33);
}

function _stopOrbit() {
  if (_orbitTimer) {
    clearInterval(_orbitTimer);
    _orbitTimer = null;
  }
}

export function animateExpand(onComplete) {
  gsap.fromTo(
    "#cockpit-canvas",
    { opacity: 0.3, scale: 0.95 },
    { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out", onComplete }
  );
}

export function animateCollapse(onComplete) {
  gsap.fromTo(
    "#cockpit-canvas",
    { opacity: 1, scale: 1 },
    { opacity: 0.3, scale: 0.95, duration: 0.4, ease: "power2.in", onComplete }
  );
}
