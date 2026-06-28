/**
 * Bloom seletivo via UnrealBloomPass.
 *
 * Integração: substituímos o animationLoop do renderer do ForceGraph para que
 * a cada frame o EffectComposer (com bloom) renderize em vez do renderer cru.
 * O ForceGraph continua atualizando física e posições normalmente.
 */
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

let _composer = null;
let _bloomEnabled = true;
let _originalLoop = null;
let _renderer = null;

export function initBloom(graph) {
  _renderer = graph.renderer();
  const scene = graph.scene();
  const camera = graph.camera();

  _renderer.toneMapping = THREE.ReinhardToneMapping;
  _renderer.toneMappingExposure = 1.1;

  const w = window.innerWidth;
  const h = window.innerHeight;

  _composer = new EffectComposer(_renderer);
  _composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.85, 0.5, 0.2);
  _composer.addPass(bloom);
  _composer.addPass(new OutputPass());

  // Intercept renderer animation loop: save original, replace with composer render
  _originalLoop = _renderer.getAnimationLoop ? _renderer.getAnimationLoop() : null;
  _renderer.setAnimationLoop((time, frame) => {
    // Let ForceGraph tick its physics/positions via onEngineTick (already wired)
    if (_bloomEnabled && _composer) {
      _composer.render();
    } else {
      _renderer.render(scene, camera);
    }
    // Call original loop if it existed (handles XR and stats)
    _originalLoop?.(time, frame);
  });
}

export function setBloomEnabled(enabled) {
  _bloomEnabled = enabled;
}

export function disposeBloom() {
  if (_renderer && _originalLoop !== null) {
    _renderer.setAnimationLoop(_originalLoop);
  }
  _composer?.dispose();
  _composer = null;
  _renderer = null;
  _originalLoop = null;
}

export function resizeBloom(w, h) {
  _composer?.setSize(w, h);
}
