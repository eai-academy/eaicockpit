## Descrição
<!-- O que esta PR faz? Qual problema resolve? -->

## Fase do plano
<!-- Ex: Fase 1 — feat/p1-fastapi-skeleton -->

## Tipo de mudança
- [ ] feat (nova funcionalidade)
- [ ] fix (correção de bug)
- [ ] perf (melhoria de performance)
- [ ] docs (documentação)
- [ ] chore (tooling, deps, CI)
- [ ] refactor

## Checklist de qualidade
- [ ] `ruff check` e `ruff format --check` sem erros
- [ ] `mypy backend/` sem erros
- [ ] `pytest` verde
- [ ] `eslint` + `prettier` sem erros (se frontend)
- [ ] `vite build` sem warnings (se frontend)
- [ ] Sem `console.log`, código morto ou `TODO` vago

## Impacto em performance (preencher se tocar render/painel/níveis)
<!-- 60fps/500 nós · painel <100ms · transição <600ms · 0 leak/50 ciclos -->
- [ ] Não regredi nenhuma meta de performance
- Observações:

## Cross-check de segurança
- [ ] Nenhum segredo/dado pessoal adicionado
- [ ] Entrada externa validada/sanitizada (se aplicável)
- [ ] `pip-audit` / `npm audit` sem high/critical novos (se adicionou deps)
- [ ] Registro de riscos atualizado (se identificou risco novo)

## Screenshots / evidências (se aplicável)
