import { gsap } from "gsap";

let _graph = null;
let _orbitTimer = null;
let _orbitEnabled = true;
let _orbitAngle = 0;

export function initCamera(graph) {
  _graph = graph;
  _startOrbit();
}

export function focusNode(node) {
  if (!_graph) return;
  _stopOrbit();
  const distance = 180;
  const nx = node.x || 0;
  const ny = node.y || 0;
  const nz = node.z || 0;
  const distRatio = 1 + distance / (Math.hypot(nx, ny, nz) || 1);
  _graph.cameraPosition(
    { x: nx * distRatio, y: ny * distRatio, z: nz * distRatio },
    { x: nx, y: ny, z: nz },
    800
  );
  // Resume orbit after 4s of idle
  setTimeout(() => {
    if (_orbitEnabled) _startOrbit();
  }, 4000);
}

export function resetCamera() {
  if (!_graph) return;
  _stopOrbit();
  _graph.cameraPosition({ x: 0, y: 0, z: 600 }, { x: 0, y: 0, z: 0 }, 800);
  setTimeout(() => {
    if (_orbitEnabled) _startOrbit();
  }, 1200);
}

export function setOrbitEnabled(enabled) {
  _orbitEnabled = enabled;
  if (enabled) _startOrbit();
  else _stopOrbit();
}

// Expand: fade in + slight scale-up (comes from collapsed state)
export function animateExpand(onComplete) {
  const el = document.getElementById("cockpit-canvas");
  if (!el) {
    onComplete?.();
    return;
  }
  gsap.fromTo(
    el,
    { opacity: 0.15, scale: 0.92 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.55,
      ease: "power3.out",
      onComplete: onComplete || undefined,
    }
  );
}

// Collapse: fade out + scale down, then call onComplete to load new data
export function animateCollapse(onComplete) {
  const el = document.getElementById("cockpit-canvas");
  if (!el) {
    onComplete?.();
    return;
  }
  gsap.to(el, {
    opacity: 0.15,
    scale: 0.92,
    duration: 0.35,
    ease: "power2.in",
    onComplete: onComplete || undefined,
  });
}

function _startOrbit() {
  if (!_orbitEnabled || !_graph) return;
  _stopOrbit();
  _orbitTimer = setInterval(() => {
    if (!_graph) return;
    _orbitAngle += 0.0015;
    const cam = _graph.camera();
    const r = Math.sqrt(cam.position.x ** 2 + cam.position.z ** 2) || 600;
    _graph.cameraPosition({
      x: Math.sin(_orbitAngle) * r,
      z: Math.cos(_orbitAngle) * r,
    });
  }, 33);
}

function _stopOrbit() {
  if (_orbitTimer) {
    clearInterval(_orbitTimer);
    _orbitTimer = null;
  }
}
