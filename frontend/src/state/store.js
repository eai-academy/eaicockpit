const _listeners = new Map();

const state = {
  level: 0,
  parentId: null,
  graphData: { nodes: [], links: [] },
  selectedNode: null,
  settings: {
    sound: false,
    bloom: true,
    particles: true,
    auto_orbit: true,
    quality: "high",
    show_fps: false,
  },
};

export function getState() {
  return state;
}

export function setState(partial) {
  const prev = { ...state };
  Object.assign(state, partial);
  _listeners.forEach((fn, key) => {
    if (key in partial) fn(state[key], prev[key]);
  });
}

export function on(key, fn) {
  _listeners.set(key, fn);
  return () => _listeners.delete(key);
}
