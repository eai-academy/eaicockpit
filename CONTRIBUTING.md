# Contribuindo com o eAI Cockpit

Obrigado por querer contribuir! Este guia explica como participar do projeto.

## Antes de começar

- Leia o [PRD.md](PRD.md) (o quê e porquê) e o [CLAUDE.md](CLAUDE.md) (o como).
- Veja o [plan.md](plan.md) para entender em qual fase o projeto está.
- Abra uma **issue** antes de começar qualquer mudança não trivial — assim evitamos
  trabalho duplicado.

## Fluxo de trabalho

1. Faça um **fork** do repositório.
2. Crie uma branch a partir de `main`:
   ```bash
   git checkout -b feat/minha-feature
   ```
3. Implemente sua mudança seguindo as diretrizes do [CLAUDE.md](CLAUDE.md).
4. Garanta que todos os gates passam localmente:
   ```bash
   # Backend
   ruff check . && ruff format --check .
   mypy backend/
   pytest

   # Frontend
   cd frontend && npm run lint && npm run build
   ```
5. Abra um **Pull Request** para `main` com:
   - Título em [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `perf:`, `docs:`, etc.
   - Descrição do impacto em **performance** (se tocar render/painel/níveis).
   - Cross-check de segurança confirmado (se aplicável).

## O que não fazer

- Não adicionar dependências externas sem discussão prévia.
- Não implementar features de v2/v3 (voz, Tauri, YouTube, SQLite) — ver PRD §5.
- Não quebrar o setup de 1 comando (`pip install eaicockpit`).
- Não degradar as metas de performance (60fps/500 nós, painel <100ms, etc.).

## Padrões de código

- **Python:** 4 espaços, type hints obrigatórios, `ruff` + `mypy` limpos.
- **JS:** 2 espaços, ESLint + Prettier, sem `console.log` em produção.
- **Commits:** Conventional Commits; mensagens em inglês ou português, seja consistente.

## Reportando bugs

Abra uma [issue](https://github.com/eai-academy/eaicockpit/issues) com:
- Descrição do comportamento esperado vs. observado.
- Passos para reproduzir.
- Versão do Python, Node.js e sistema operacional.

## Vulnerabilidades de segurança

**Não abra uma issue pública.** Leia o [SECURITY.md](SECURITY.md).

## Código de conduta

Este projeto segue o [Contributor Covenant](CODE_OF_CONDUCT.md). Seja respeitoso.
