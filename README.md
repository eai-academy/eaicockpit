<div align="center">

# 🛸 eAI Cockpit

### Seus projetos Claude Code como um universo navegável.

Aponte para suas pastas e veja tudo virar um **HUD estilo Jarvis**: mundos flutuando no
espaço, conectados por linhas de energia, que você explora, clica e mergulha — fluido,
bonito e rápido.

[![License: MIT](https://img.shields.io/badge/License-MIT-7C3AED.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-06B6D4.svg)](https://www.python.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-10B981.svg)](https://threejs.org/)
[![Status](https://img.shields.io/badge/status-v1%20em%20construção-F59E0B.svg)](#-roadmap)

**Feito pela [eAI Academy](#-quem-criou) — construído inteiro com Claude Code.**

</div>

---

## ✨ O que é

**eAI Cockpit** é um visualizador 3D de projetos Claude Code. Você aponta para uma ou mais
pastas e o cockpit varre, entende e renderiza tudo como um **universo navegável** — esferas
(mundos) no espaço, conectadas, com glow holográfico.

A metáfora é o **HUD do Jarvis (Homem de Ferro)**: uma visão macro de tudo o que você
controla, na qual você dá zoom, abre um "mundo", inspeciona detalhes e volta — sempre
fluido. A navegação é em **camadas** (zoom semântico):

```
🌌 GALÁXIA   → cada esfera é um workspace inteiro (canal, empresa A, empresa B…)
     │  clica / dá zoom
     ▼
🪐 MUNDO     → cada esfera é um projeto do workspace (vídeo, skill, módulo…)
     │  clica num nó
     ▼
🛰️ DETALHE   → painel HUD com status, métricas, preview e ações rápidas
```

### O que **não** é
- ❌ Não é um editor de código (não substitui o VS Code).
- ❌ Não é um kanban / gerenciador de tarefas tradicional.
- ❌ Não faz upload/deploy de nada — é **observabilidade e navegação**.

---

## 🎬 Demo

> 📺 Vídeo de lançamento no canal **eAI Academy** _(em breve)_.
> _(Adicione aqui um GIF/screenshot do cockpit em ação.)_

---

## 🚀 Instalação (menos de 2 minutos)

### Opção A — pip _(recomendado)_
```bash
pip install eaicockpit
```

### Opção B — a partir do código
```bash
git clone https://github.com/eai-academy/eaicockpit.git
cd eaicockpit
pip install -e .
```

**Requisitos:** Python 3.11+ e um navegador moderno (Chrome/Edge/Firefox com WebGL).

---

## ⚡ Uso

```bash
eaicockpit add ./meu-projeto      # adiciona uma pasta como workspace
eaicockpit add ../outra-empresa   # adicione quantas quiser
eaicockpit list                   # veja seus workspaces
eaicockpit start                  # sobe o cockpit e abre no navegador 🚀
```

O `start` abre automaticamente o cockpit no seu navegador (use `--no-open` para evitar).
Tudo roda **localmente** na sua máquina — nada sai para a internet.

### Controles
| Ação | Como |
|------|------|
| Orbitar / dar zoom | mouse (arrastar + scroll) |
| Abrir um mundo | clique numa esfera |
| Abrir detalhe | clique num nó |
| Fechar painel | `ESC` ou clique fora |
| Voltar um nível | botão de voltar no HUD |
| Configurações | ícone de engrenagem ⚙️ |

---

## 🎛️ Recursos (v1)

- 🌌 **Zoom semântico** entre Galáxia e Mundo, com transições cinematográficas (GSAP).
- 🪐 **Multi-workspace** desde o início — canal + empresas no mesmo céu.
- 🎨 **Estética Jarvis** — dark mode profundo, glow/bloom holográfico, partículas nas arestas.
- 🟢 **Status por cor** — feito, em andamento, pendente/bloqueado, ativo.
- 🛰️ **Painel de detalhe** com preview, métricas e ações rápidas.
- ⚙️ **Configurações** — som, bloom, partículas, órbita automática, qualidade, tema.
- ♿ **Acessibilidade** — teclado, foco visível, respeita `prefers-reduced-motion`.
- 🏎️ **Rápido de verdade** — 60fps com 500 nós visíveis (ver [Performance](#-performance)).

---

## 🏎️ Performance

Performance é critério de aceite, não polimento. Metas garantidas pela arquitetura:

- ✅ **60fps** com **500 nós** visíveis.
- ✅ Abertura de painel **< 100ms**.
- ✅ Transição expand/collapse **< 600ms**, sem stutter.
- ✅ **Zero** crescimento de memória após 50 ciclos de abrir/fechar.

Como: lazy loading por nível · Level of Detail · `InstancedMesh` · frustum culling · física
que congela ao assentar · `dispose()` rigoroso · Web Workers · bloom seletivo.

---

## 🧱 Stack

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | Python 3.11+ · FastAPI · Uvicorn · Watchdog · Pydantic v2 |
| **Frontend** | Three.js · 3d-force-graph · GSAP v3 · postprocessing · Vite |
| **Persistência** | Arquivos JSON locais (`.eaicockpit/`) — zero banco externo |

> Tudo local, zero setup. App desktop (Tauri) e voz são evoluções futuras (v3).

---

## 🗺️ Roadmap

- **v1** — CLI, multi-workspace, Galáxia ↔ Mundo, painel de detalhe, estética Jarvis,
  configurações, créditos, 60fps/500 nós. _(em construção)_
- **v2** — Nível de detalhe como cena 3D real · watch em tempo real · busca/filtro ·
  métricas do YouTube · histórico (SQLite).
- **v3** — App desktop (Tauri) · controle por **voz** (o "seu próprio Jarvis") · ações
  executáveis · marketplace de visualizações.

Detalhes completos no [PRD.md](PRD.md).

---

## 📚 Documentação do projeto

- [PRD.md](PRD.md) — visão, escopo e decisões (o quê e por quê).
- [CLAUDE.md](CLAUDE.md) — contrato técnico de implementação (o como).
- [plan.md](plan.md) — plano faseado de implementação.
- [CONTRIBUTING.md](CONTRIBUTING.md) — como contribuir.
- [CHANGELOG.md](CHANGELOG.md) — histórico de versões.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Leia o [CONTRIBUTING.md](CONTRIBUTING.md) e o
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Em resumo: Conventional Commits, lint/format
limpos, testes passando e **sem regredir as metas de performance**.

---

## 👤 Quem criou

<div align="center">

### **eAI Academy**

Conteúdo sobre construir software de verdade com **Claude Code**.
Este projeto é open source **e** o tema de um vídeo no canal — construído inteiro com IA,
ao vivo, do zero ao cockpit.

🎥 **YouTube:** [@eAIAcademy](https://youtube.com/@eAIAcademy) ·
📧 [contato](mailto:contato@eaiacademy.com)

_Se o cockpit te ajudou ou te impressionou, deixa uma ⭐ no repo e dá uma passada no canal._

</div>

---

## 📄 Licença

[MIT](LICENSE) © eAI Academy. Use, modifique e compartilhe à vontade.

<div align="center">
<sub>Construído com 💜 e Claude Code · <code>#7C3AED</code></sub>
</div>
