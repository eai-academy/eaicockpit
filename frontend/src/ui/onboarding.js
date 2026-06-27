export function showOnboarding() {
  const el = document.createElement("div");
  el.id = "onboarding";
  el.className = "onboarding";
  el.setAttribute("role", "status");
  el.innerHTML = `
    <div class="onboarding-inner">
      <div class="onboarding-icon">🛸</div>
      <h2>Bem-vindo ao eAI Cockpit</h2>
      <p>Adicione um workspace para começar:</p>
      <code>eaicockpit add ./seu-projeto</code>
      <p class="onboarding-sub">ou</p>
      <code>eaicockpit start</code>
    </div>`;
  document.getElementById("hud-root").appendChild(el);
}

export function hideOnboarding() {
  document.getElementById("onboarding")?.remove();
}
