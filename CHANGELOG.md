# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

---

## [0.9.0] — 2026-06-27

### Added
- **Frontend 3D completo** com Three.js + 3d-force-graph (Fase 3)
  - Grafo 3D renderizando workspaces reais do backend
  - Nós coloridos por status (roxo/verde/âmbar/vermelho)
  - Labels ao hover, partículas nas arestas hierárquicas
- **LOD + Instancing** para performance (Fase 4)
  - Objetos Three.js com LOD: esfera detalhada → esfera simples → sprite
  - Frustum culling ativo; física congela após assentar (cooldownTicks)
  - Throttle no resize; limite de 500 nós por nível (anti-DoS)
- **Zoom semântico Galáxia ↔ Mundo** (Fase 5)
  - Drill-in num workspace expande seus projetos filhos via lazy loading
  - Animação GSAP de expansão/implosão (fade + scale)
  - Breadcrumb e botão Voltar no HUD
  - Anti-IDOR: `parent=<id>` validado contra workspaces conhecidos
- **Estética Jarvis** (Fase 6)
  - Bloom seletivo via UnrealBloomPass (Three.js postprocessing)
  - Câmera com órbita lenta automática; suaviza ao interagir
  - Material Phong emissivo nos nós; sprites glow nos nós distantes
  - Toggle de bloom nas configurações
- **Painel de detalhe** (Fase 7)
  - Abre em <100ms ao clicar num nó
  - Pipeline visual com barra de progresso (para vídeos)
  - Dispose rigoroso: AbortController cancela fetch, listeners removidos ao fechar
  - XSS: todos os dados da API sanitizados via `_esc()`
- **UI completa** (Fase 8)
  - Settings modal: bloom, partículas, órbita, FPS, qualidade — tudo persistido
  - Credits modal: eAI Academy, GitHub, YouTube, MIT license
  - Onboarding overlay para primeira execução sem workspaces
  - Acessibilidade: focus-visible, aria-label, prefers-reduced-motion

### Fixed
- Conflito de versão Three.js entre `3d-force-graph` e deps diretas (dedupe)
- `ForceGraph3D` agora recebe container `<div>`, não `<canvas>` externo
- Endpoint `/api/graph` retorna 404 para `parent` desconhecido (anti-IDOR)

### Security
- Path traversal coberto (resolver + confinamento ao workspace)
- Symlinks para fora do workspace ignorados
- Labels/dados da API nunca via `innerHTML` cru
- `npm audit`: 0 vulnerabilidades

---

## [0.1.0] — 2026-06-20

### Added
- Estrutura inicial do repositório (scaffolding, tooling, CI)
- PRD, CLAUDE.md, plan.md, README.md — documentação de projeto AAA
- Backend FastAPI: scanner, graph, pipeline, config, CLI, modelos Pydantic v2
- Frontend Vite + ESLint + Prettier
- GitHub Actions CI: ruff + mypy + pytest + eslint + build + gitleaks
- Licença MIT

[Unreleased]: https://github.com/eai-academy/eaicockpit/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/eai-academy/eaicockpit/compare/v0.1.0...v0.9.0
[0.1.0]: https://github.com/eai-academy/eaicockpit/releases/tag/v0.1.0
