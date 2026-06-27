export function initCredits() {
  const modal = document.createElement("div");
  modal.id = "credits-modal";
  modal.className = "credits-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-label", "Sobre o eAI Cockpit");
  modal.innerHTML = `
    <div class="credits-inner">
      <button class="credits-close" aria-label="Fechar">✕</button>
      <div class="credits-logo">🛸</div>
      <h2 class="credits-title">eAI Cockpit</h2>
      <p class="credits-version">v0.1.0 — Beta</p>
      <p class="credits-desc">
        Visualizador 3D de projetos Claude Code.<br>
        Construído inteiro com Claude Code.
      </p>
      <div class="credits-author">
        <strong>eAI Academy</strong>
        <a href="https://youtube.com/@eAIAcademy" target="_blank" rel="noopener noreferrer" class="credits-link">
          YouTube → @eAIAcademy
        </a>
      </div>
      <p class="credits-license">
        Licença <a href="https://github.com/eai-academy/eaicockpit/blob/main/LICENSE"
          target="_blank" rel="noopener noreferrer" class="credits-link">MIT</a> —
        use, modifique e compartilhe à vontade.
      </p>
      <p class="credits-cta">
        Se te ajudou ou impressionou, deixa uma ⭐ no
        <a href="https://github.com/eai-academy/eaicockpit" target="_blank"
          rel="noopener noreferrer" class="credits-link">repositório</a>
        e visita o canal!
      </p>
    </div>`;

  document.getElementById("hud-root").appendChild(modal);
  modal.querySelector(".credits-close").addEventListener("click", () =>
    modal.classList.remove("open")
  );
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });

  const btn = document.createElement("button");
  btn.className = "hud-btn credits-trigger";
  btn.setAttribute("aria-label", "Sobre");
  btn.textContent = "ℹ";
  btn.addEventListener("click", () => modal.classList.toggle("open"));
  document.getElementById("hud-bar")?.appendChild(btn);
}
