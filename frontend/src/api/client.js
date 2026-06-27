const BASE = "";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getGraph: (level = 0, parentId = null) => {
    const params = new URLSearchParams({ level });
    if (parentId) params.set("parent", parentId);
    return request(`/api/graph?${params}`);
  },

  getNode: (nodeId) => request(`/api/node/${encodeURIComponent(nodeId)}`),

  getSettings: () => request("/api/settings"),

  saveSettings: (settings) =>
    request("/api/settings", { method: "PUT", body: JSON.stringify(settings) }),

  addWorkspace: (path) =>
    request(`/api/workspace?path=${encodeURIComponent(path)}`, { method: "POST" }),

  removeWorkspace: (id) =>
    request(`/api/workspace/${encodeURIComponent(id)}`, { method: "DELETE" }),

  listWorkspaces: () => request("/api/workspaces"),
};
