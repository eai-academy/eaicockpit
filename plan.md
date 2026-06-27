# plan.md — eAI Cockpit

> **Plano de implementação faseado.**
> Define a **ordem de construção**, as **branches por micro etapa** e os **gates de
> qualidade** que travam a passagem de uma fase para a próxima.
>
> Documentos irmãos: [PRD.md](PRD.md) (o quê/porquê) · [CLAUDE.md](CLAUDE.md) (o como) ·
> [README.md](README.md) (público).
>
> Status: pronto para execução · Versão alvo: **v1**

---

## 0. Como ler e executar este plano

### Princípios inegociáveis
1. **Fases são sequenciais.** Só se avança para a próxima fase quando **TODOS os gates de
   qualidade e desempenho da fase atual passarem** (ver §"Gates" de cada fase + a tabela
   global em [§ Gates de qualidade](#-gates-de-qualidade-globais)).
2. **Cada micro etapa = uma branch + um PR.** Nada vai direto para `main`. `main` está
   sempre verde (CI passando).
3. **Performance é gate, não polimento.** As metas da seção 8 do PRD são critério de aceite.
4. **`dispose()` e lazy loading desde o início.** Não é refactor futuro.
5. **Setup de 1 comando nunca quebra.** Qualquer mudança que complique `pip install` é
   rejeitada.
6. **Segurança é gate, não conserto futuro.** Toda fase termina com um **Cross-check de
   segurança** (ver [§ Segurança](#-segurança-riscos-e-cross-check-obrigatório)). A fase só
   é DONE se o cross-check passar. Nenhum risco identificado avança "para resolver depois".

### Convenções de branch
```
main                      # sempre estável, protegida
develop                   # integração da fase corrente (opcional; pode-se ir direto p/ main via PR)
feat/<fase>-<slug>        # micro etapa nova (feature)
fix/<slug>                # correção
perf/<slug>               # otimização de performance
docs/<slug>               # documentação
chore/<slug>              # tooling, deps, CI
```
Exemplos: `feat/p1-fastapi-skeleton`, `feat/p3-instanced-nodes`, `perf/p6-selective-bloom`.

### Convenções de commit / versão
- **Conventional Commits:** `feat:`, `fix:`, `perf:`, `docs:`, `chore:`, `test:`, `refactor:`.
- **SemVer** + **Keep a Changelog** no [CHANGELOG.md](CHANGELOG.md).
- Cada fase concluída → tag (`v0.1.0`, `v0.2.0`, …); fim da v1 → `v1.0.0`.

### Fluxo de cada micro etapa
```
1. git checkout -b feat/pX-slug a partir de main atualizada
2. implementar + testes
3. rodar gates locais (lint, testes, perf quando aplicável)
4. abrir PR → CI verde → revisão → squash merge em main
5. atualizar CHANGELOG; deletar a branch
```

---

## 🧭 Visão geral das fases

| Fase | Nome | Entrega central | Gate de saída | Foco de segurança |
|------|------|-----------------|----------------|-------------------|
| **0** | Fundação & Repositório | Scaffolding, tooling, CI + **primeiro push** no repo já criado | Push em `main` feito; CI verde; `pip install -e .` funciona | Sem segredos no histórico; gitignore forte; secret scanning + Dependabot; SECURITY.md |
| **1** | Backend esqueleto + CLI | FastAPI sobe, CLI `add/list/start`, config local | API responde; CLI testada; pytest verde | Bind `127.0.0.1`; sem stack trace ao cliente; CORS restrito |
| **2** | Scanner & modelo de grafo | Varredura → nós/arestas → `/api/graph` | Grafo correto de fixtures; cache funciona | **Path traversal**; sem symlink p/ fora; cache não vaza dados sensíveis |
| **3** | Frontend base 3D | Vite + Three.js + 3d-force-graph renderiza grafo real | Cena renderiza; 60fps com 100 nós | Sem XSS ao renderizar labels/dados; deps front auditadas |
| **4** | Performance: LOD + Instancing | InstancedMesh, LOD, culling, física congela | **60fps com 500 nós** | DoS por grafo gigante (limites/paginação) |
| **5** | Zoom semântico (Galáxia↔Mundo) | Expand/collapse animado (GSAP), lazy por nível | Transição < 600ms; lazy load confirmado | `parent=<id>` validado; sem IDOR (só workspaces conhecidos) |
| **6** | Estética Jarvis | Bloom seletivo, partículas, paleta, câmera | Beleza aprovada; bloom não derruba fps | Assets/sons de origem confiável; sem CDN não fixado |
| **7** | Painel de detalhe (Nível 2) | `/api/node/<id>` + painel HUD + **dispose** | Painel < 100ms; **0 leak em 50 ciclos** | **XSS no painel** (sanitizar md/preview); leitura lazy só dentro do workspace |
| **8** | UI: configurações, créditos, onboarding | ⚙️ settings, "Sobre/Quem criou", onboarding, A11y | Settings persistem; A11y básica; reduced-motion | `PUT /api/settings` validado; sem injeção via config |
| **9** | Empacotamento & Release v1 | `pip install eaicockpit`, docs, `v1.0.0` | Instalável < 2min; release publicada | Supply chain: deps fixadas/auditadas; release assinada/íntegra |

> **Watchdog/WebSocket tempo real, Nível 2 como cena 3D, busca, YouTube, SQLite, Tauri e
> voz são v2/v3 — fora deste plano** (ver PRD §5).

---

## FASE 0 — Fundação & Repositório

**Objetivo:** ter a casa montada antes de escrever lógica. Repo público open source, com
todos os arquivos AAA, tooling de qualidade e CI rodando.

### Micro etapas (branches)
- `chore/p0-git-init` — `git init`, `.gitignore`, `.editorconfig`, `.gitattributes` (LF).
- `docs/p0-community-files` — `LICENSE` (MIT), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`
  (Contributor Covenant), `CHANGELOG.md` (Keep a Changelog), `SECURITY.md`,
  templates de issue/PR em `.github/`.
- `chore/p0-python-tooling` — `pyproject.toml` (build + entry point `eaicockpit`), deps
  (fastapi, uvicorn, watchdog, pydantic), config do **ruff** e **mypy**, `pytest`.
- `chore/p0-frontend-tooling` — `frontend/package.json`, `vite.config.js`, **ESLint** +
  **Prettier**, deps (three, 3d-force-graph, gsap, postprocessing).
- `chore/p0-ci` — GitHub Actions: job backend (ruff + mypy + pytest) e job frontend
  (eslint + build). Roda em todo PR.
- `chore/p0-first-push` — conectar o remoto e publicar o primeiro commit (ver abaixo).

### Publicação no repositório GitHub (já existe — só falta push)
O repositório **já está criado e público**: **`eai-academy/eaicockpit`**. A conta logada no
`gh` é **`EdsonAvelar`**, **collaborator com `push`** (não admin — o dono é `eai-academy`).
Falta apenas conectar o remoto e subir o primeiro commit:

```bash
git remote add origin https://github.com/eai-academy/eaicockpit.git
git branch -M main
git push -u origin main
```

> **Antes do `git push`:** rodar o [Cross-check de segurança](#-cross-check-de-segurança-obrigatório-p-fechar-a-fase)
> (varredura de segredos + `.gitignore`). Segredo no histórico público = vazado para sempre.

### Configurações do repositório (open source AAA)
- **Licença:** MIT (`LICENSE` na raiz) — entra no primeiro push.
- Descrição + topics: `claude-code`, `threejs`, `3d-visualization`, `fastapi`, `dataviz`.
- **Branch protection** em `main` (exige PR + CI verde): **depende do dono `eai-academy`**,
  pois `EdsonAvelar` não é admin. Pedir ao dono para habilitar, ou aceitar como item externo.
- Habilitar Issues e Discussions; templates em `.github/`.
- README com badges (já pronto).

### ✅ Gate de saída (Fase 0)
- [ ] Primeiro push em `main` feito; repo público acessível com o conteúdo.
- [ ] `pip install -e .` funciona; `eaicockpit --help` responde (mesmo que stub).
- [ ] `npm install` + `npm run build` no `frontend/` funciona.
- [ ] CI **verde** em um PR de teste (ruff, mypy, pytest, eslint, build).
- [ ] Todos os arquivos de comunidade presentes (LICENSE, CONTRIBUTING, COC, CHANGELOG,
      SECURITY, templates).
- [ ] `ruff`, `eslint`, `prettier` sem erros.

### 🔒 Cross-check de segurança (obrigatório p/ fechar a fase)
- [ ] **Nenhum segredo no histórico** — varredura antes do 1º push (`gh` secret scanning /
      `gitleaks` / revisão manual). Segredo no histórico público = vazado para sempre.
- [ ] `.gitignore` cobre `.eaicockpit/`, `.env`, `__pycache__/`, `node_modules/`, `dist/`,
      `*.log`, caches e qualquer arquivo com **caminhos/dados pessoais**.
- [ ] **Secret Scanning** e **Dependabot** habilitados no repo (grátis em repo público).
- [ ] `SECURITY.md` presente (como reportar falha + política de versões suportadas).
- [ ] README com nota **"AS IS, sem garantia"** (a cláusula da MIT cobre legalmente).
- [ ] CI **não** expõe segredos em logs; tokens só via `secrets:` do GitHub Actions.
- [ ] Riscos abertos registrados no [Registro de riscos](#-registro-de-riscos-vivo).

---

## FASE 1 — Backend esqueleto + CLI

**Objetivo:** o servidor sobe, a CLI funciona, a config local é lida/gravada.

### Micro etapas
- `feat/p1-fastapi-skeleton` — `backend/main.py`: app FastAPI, healthcheck `/api/health`,
  serve estáticos do `frontend/dist` (placeholder), bind **`127.0.0.1`** por padrão.
- `feat/p1-config` — `backend/config.py`: ler/gravar `.eaicockpit/config.json` (lista de
  workspaces); criar pasta se não existir.
- `feat/p1-cli` — `backend/cli.py`: `add <pasta>`, `remove <id>`, `list`, `start`
  (sobe uvicorn; `--no-open`/`--port`; abre navegador). Entry point no `pyproject.toml`.
- `feat/p1-models` — `backend/models.py`: Pydantic `Node`, `Link`, `Graph`, `NodeDetail`
  (contrato do CLAUDE.md §4).

### Testes
- `pytest` de `config` (round-trip de leitura/escrita, pasta inexistente).
- `pytest` de CLI (add/list/remove com tmp dirs; validação de pasta inexistente).
- `pytest` de API (`/api/health` 200; CORS/headers; bind localhost).

### ✅ Gate de saída
- [ ] `eaicockpit add/list/remove/start` funcionam manualmente e em testes.
- [ ] `/api/health` responde; servidor é localhost-only por padrão.
- [ ] pytest **verde**; cobertura mínima do backend definida (ex.: ≥ 70% nos módulos novos).
- [ ] ruff + mypy limpos.

### 🔒 Cross-check de segurança
- [ ] Bind **`127.0.0.1`** por padrão; expor na rede só com flag explícita (`--host`) e
      aviso claro. Teste confirma que não escuta em `0.0.0.0` sem a flag.
- [ ] **CORS restrito** à própria origem local; sem `*` em produção.
- [ ] Erros respondem JSON limpo — **nunca stack trace cru** ao cliente; logs detalhados só
      no servidor.
- [ ] CLI valida entrada (pasta existe/legível) e **não executa shell** com input do usuário.
- [ ] `config.json` é gravado com permissões sensatas; nenhum segredo nele.
- [ ] Riscos abertos atualizados no [Registro de riscos](#-registro-de-riscos-vivo).

---

## FASE 2 — Scanner & modelo de grafo

**Objetivo:** transformar pastas reais em `/api/graph` correto, com cache.

### Micro etapas
- `feat/p2-scanner` — `backend/scanner.py`: detectar workspace (`.claude/`/`CLAUDE.md`)
  vs. pasta genérica; mapear subprojetos; classificar tipo de nó (workspace/video/skill/
  folder/doc). Segurança de caminho (sem symlink p/ fora; só workspaces apontados).
- `feat/p2-pipeline` — `backend/pipeline.py`: status do pipeline de vídeo (roteiro →
  fonte → transcrição → metadados → thumbnail → cortes → distribuição → publicado).
- `feat/p2-graph` — `backend/graph.py`: montar nós/arestas por nível; `/api/graph?level=0`
  e `/api/graph?parent=<id>`; arestas hierárquicas + semânticas (`[[links]]` em `.md`).
- `feat/p2-cache` — cache em `.eaicockpit/cache.json`; invalidação por mtime; **metadados
  leves** apenas (sem ler arquivos grandes — lazy fica para a Fase 7).

### Testes
- Fixtures de projeto em `tests/backend/fixtures/` (workspace fake com vídeos/skills/docs).
- Asserções: contagem de nós/arestas, tipos corretos, status do pipeline, parsing de
  `[[links]]`, cache hit/miss por mtime.
- Teste de **não-vazamento de segurança** (caminho fora do workspace é recusado).

### ✅ Gate de saída
- [ ] `/api/graph?level=0` e `?parent=` retornam grafo correto das fixtures.
- [ ] Pipeline calcula status corretamente para casos felizes e parciais.
- [ ] Cache acelera o segundo start (medido) e invalida ao mudar mtime.
- [ ] Varredura **não bloqueia** a resposta da API em projeto grande (teste com fixture
      inflada).
- [ ] pytest verde; ruff + mypy limpos.

### 🔒 Cross-check de segurança (camada crítica — filesystem)
- [ ] **Path traversal coberto por teste:** `../`, caminhos absolutos e codificações
      maliciosas são recusados; resolução é confinada (`Path.resolve()` + verificação de que
      está **dentro** de um workspace apontado).
- [ ] **Symlinks que apontam para fora do workspace são ignorados/recusados** (teste).
- [ ] Scanner só lê dentro dos workspaces configurados — **nunca** o filesystem geral.
- [ ] `cache.json` não armazena conteúdo de arquivo sensível, só metadados leves; fica em
      `.eaicockpit/` (gitignored).
- [ ] Parsing de `[[links]]`/`.md` é tolerante a arquivo malformado (sem crash/DoS).
- [ ] Riscos abertos atualizados no [Registro de riscos](#-registro-de-riscos-vivo).

---

## FASE 3 — Frontend base 3D

**Objetivo:** ver o grafo real renderizado em 3D no navegador.

### Micro etapas
- `feat/p3-vite-bootstrap` — `frontend/index.html`, `src/main.js`, loop único de render
  (`requestAnimationFrame`), `src/styles/` com variáveis da paleta eAI.
- `feat/p3-api-client` — `src/api/`: cliente isolado (REST); o resto nunca faz `fetch`.
- `feat/p3-state` — `src/state/` (store leve em JS puro): nível atual, nós, seleção.
- `feat/p3-graph-render` — `src/graph/`: 3d-force-graph consumindo `/api/graph`; nós com
  label e cor por status; arestas.
- `feat/p3-camera-base` — `src/camera/`: OrbitControls + zoom/pan suaves.

### Testes / verificação
- Smoke test: app carrega grafo das fixtures sem erro de console.
- Lint (eslint/prettier) limpo; build de produção sem warnings.
- **Medição inicial de fps** com 100 nós (baseline).

### ✅ Gate de saída
- [ ] Cena renderiza grafo real (backend ligado) e responde a órbita/zoom.
- [ ] **60fps com 100 nós** (baseline) no Chrome.
- [ ] Zero erro/`console.log` no console; eslint/prettier limpos; build sem warnings.

### 🔒 Cross-check de segurança
- [ ] **Sem XSS:** labels/dados vindos da API nunca entram via `innerHTML` cru; usar
      `textContent` ou sanitização. Teste com label contendo `<script>`/HTML.
- [ ] `npm audit` sem vulnerabilidades **high/critical** (ou exceções justificadas).
- [ ] Sem chamadas a domínios externos não previstos (cliente API só fala com o backend local).
- [ ] Riscos abertos atualizados no [Registro de riscos](#-registro-de-riscos-vivo).

---

## FASE 4 — Performance: LOD + Instancing (gate duro)

**Objetivo:** bater a meta principal de desempenho **antes** de adicionar beleza.

### Micro etapas
- `perf/p4-instancing` — `InstancedMesh` por tipo de nó (1 draw call p/ milhares).
- `perf/p4-lod` — Level of Detail: nós distantes viram sprites/billboards; labels só perto.
- `perf/p4-culling` — garantir frustum culling ativo; verificar draw calls.
- `perf/p4-physics-freeze` — `cooldownTicks`: congelar física quando o layout assenta.
- `perf/p4-worker` — mover cálculo de força para **Web Worker** (não travar main thread).
- `perf/p4-throttle` — throttle/debounce em hover/resize/scroll.

### Testes de performance (cena de stress em `tests/perf/`)
- Cena com **500 nós** sintéticos.
- Medir: fps médio/percentil, draw calls, tempo de frame (alvo 16ms), uso de CPU com
  layout assentado (deve cair perto de zero).

### ✅ Gate de saída (BLOQUEANTE)
- [ ] **60fps com 500 nós visíveis** (medido, documentado no PR).
- [ ] CPU cai quando o layout congela (física pausada).
- [ ] Main thread não trava durante o layout (worker confirmado).
- [ ] Draw calls dentro do orçamento; LOD e culling verificados no profiler.

### 🔒 Cross-check de segurança
- [ ] **DoS por grafo gigante:** a API impõe limite/paginação por nível; um workspace com
      dezenas de milhares de nós não trava cliente nem servidor (degrada/limita com aviso).
- [ ] Worker não recebe nem executa código vindo de dados externos (só dados, nunca função).
- [ ] Riscos abertos atualizados no [Registro de riscos](#-registro-de-riscos-vivo).

> Sem este gate, **não** se inicia a Fase 5.

---

## FASE 5 — Zoom semântico (Galáxia ↔ Mundo)

**Objetivo:** o diferencial do produto — navegar entre níveis com lazy loading.

### Micro etapas
- `feat/p5-levels` — `src/levels/`: estado de nível (0 galáxia / 1 mundo); breadcrumb.
- `feat/p5-lazy-expand` — clicar numa esfera busca filhos via `/api/graph?parent=<id>`
  (lazy); colapsar libera o nível anterior.
- `feat/p5-gsap-transitions` — `src/camera/`: animação de **expansão** (explodir bolha) e
  **implosão** (colapsar), câmera acompanhando, easing suave (GSAP).
- `feat/p5-dispose-levels` — ao trocar de nível, `dispose()` de geometria/material/textura
  do nível que saiu; remover listeners; anular refs.

### Testes / verificação
- Navegação galáxia→mundo→galáxia repetida sem erros.
- **Lazy confirmado:** rede mostra requisição de filhos só ao explodir (não tudo no start).
- Profiler: heap estável após várias trocas de nível (precursor do gate da Fase 7).

### ✅ Gate de saída
- [ ] Transição expand/collapse **< 600ms**, sem stutter (medido).
- [ ] Lazy loading por nível confirmado na aba Network.
- [ ] Sem crescimento de heap após 20 trocas de nível.
- [ ] 60fps mantido durante e após transições.

### 🔒 Cross-check de segurança
- [ ] **`parent=<id>` validado** no backend: só IDs de nós/workspaces conhecidos são
      aceitos; ID arbitrário/forjado retorna 404, **não** vira caminho de filesystem (anti-IDOR
      e anti-path-traversal via parâmetro).
- [ ] Estado de nível no cliente não confia em dados não validados para montar requisições.
- [ ] Riscos abertos atualizados no [Registro de riscos](#-registro-de-riscos-vivo).

---

## FASE 6 — Estética Jarvis

**Objetivo:** a "beleza" exigida — sem sacrificar os gates de performance.

### Micro etapas
- `feat/p6-palette-darkmode` — fundo `#0A0A1A`→gradiente; paleta eAI via CSS custom props.
- `perf/p6-selective-bloom` — `postprocessing`: bloom **seletivo via layers** (só nós que
  importam, nunca a cena inteira).
- `feat/p6-edge-particles` — partículas percorrendo arestas (fluxo de energia), com budget.
- `feat/p6-cinematic-camera` — órbita lenta automática quando ocioso; suaviza ao interagir.
- `feat/p6-degrade` — degradação graciosa: se fps cair, reduzir partículas / LOD agressivo.

### Testes / verificação
- Revisão visual (capturas no PR) — aprovação estética.
- Medir fps **com** bloom+partículas em 500 nós.

### ✅ Gate de saída
- [ ] Estética aprovada (Jarvis: glow, partículas, dark, paleta eAI).
- [ ] **60fps com 500 nós mantido** com bloom seletivo + partículas ligados.
- [ ] Degradação graciosa funciona quando fps cai.
- [ ] Bloom é seletivo (confirmado: cena inteira não recebe bloom).

### 🔒 Cross-check de segurança
- [ ] **Assets locais:** sons/texturas/fontes servidos do próprio pacote (`public/`), sem
      depender de CDN externo. Se algum CDN for usado, fixar versão + SRI (integridade).
- [ ] Nenhuma dependência nova introduz telemetria/coleta de dados.
- [ ] Riscos abertos atualizados no [Registro de riscos](#-registro-de-riscos-vivo).

---

## FASE 7 — Painel de detalhe (Nível 2) + disciplina de memória (gate duro)

**Objetivo:** abrir detalhe de um nó com preview/ações e **zero memory leak**.

### Micro etapas
- `feat/p7-node-detail-api` — `/api/node/<id>` no backend: detalhe completo **lazy** (lê
  metadados maiores só agora), status por etapa, preview, ações.
- `feat/p7-panel-ui` — `src/panel/`: painel HUD glassmorphism, entrada deslizante (GSAP),
  fecha com `ESC`/clique fora.
- `feat/p7-panel-dispose` — `dispose()` rigoroso de tudo que o painel cria; remover
  listeners; anular refs ao fechar.
- `feat/p7-actions` — ações rápidas (abrir pasta / copiar comando da skill).

### Testes / verificação
- Abrir/fechar painel repetidamente medindo heap no profiler.
- Medir latência de abertura.

### ✅ Gate de saída (BLOQUEANTE)
- [ ] Abertura de painel **< 100ms**.
- [ ] **Zero crescimento de memória após 50 ciclos** de abrir/fechar (heap estável no
      profiler — documentado no PR com captura).
- [ ] Sem listeners órfãos; sem geometria/material/textura não liberados.
- [ ] 60fps mantido com painel aberto.

### 🔒 Cross-check de segurança (camada crítica — conteúdo de arquivo no painel)
- [ ] **XSS no painel:** preview de `.md`/título/descrição é **sanitizado** antes de exibir
      (renderizar como texto, ou markdown com sanitizador allowlist). Teste com arquivo
      contendo `<script>`, `onerror=`, `javascript:` em link.
- [ ] Leitura lazy de `/api/node/<id>` confinada ao workspace; **não** lê arquivo fora dele
      (reaproveita a validação da Fase 2; teste).
- [ ] Ação "abrir pasta" usa API segura do SO, **sem** construir comando shell com input.
- [ ] "Copiar comando da skill" não injeta conteúdo executável automaticamente (só copia).
- [ ] Riscos abertos atualizados no [Registro de riscos](#-registro-de-riscos-vivo).

---

## FASE 8 — UI: configurações, créditos, onboarding, acessibilidade

**Objetivo:** os requisitos de produto AAA — controles e identidade do canal.

### Micro etapas
- `feat/p8-settings` — `src/settings/` + `src/ui/`: menu ⚙️ (som, bloom, partículas, órbita
  automática, qualidade/LOD, tema, reset de câmera). Persistir em `localStorage`;
  `GET/PUT /api/settings` quando relevante. Defaults sensatos (som **off** por padrão).
- `feat/p8-credits` — modal **"Sobre / Quem criou"**: eAI Academy, link do canal, versão,
  licença MIT, agradecimentos. (Chamariz do canal.)
- `feat/p8-onboarding` — overlay de primeira execução: "Arraste uma pasta aqui ou rode
  `eaicockpit add <pasta>`" (só quando não há workspaces).
- `feat/p8-hud` — HUD permanente: indicador de nível, breadcrumb, voltar/colapsar, FPS
  togglável.
- `feat/p8-a11y` — foco visível, navegação por teclado em menus/painéis, contraste,
  **`prefers-reduced-motion`** (reduz órbita/partículas).
- `feat/p8-sound` — sons sutis opcionais (clique, whoosh), carregados sob demanda.

### Testes / verificação
- Settings persistem entre reloads e refletem no backend quando aplicável.
- Teclado navega todos os menus/painéis; foco visível; reduced-motion respeitado.
- Onboarding aparece só sem workspaces.

### ✅ Gate de saída
- [ ] Todas as configurações funcionam e **persistem**.
- [ ] Tela de créditos completa e bonita; links corretos.
- [ ] Onboarding correto na 1ª execução.
- [ ] Acessibilidade básica aprovada; `prefers-reduced-motion` respeitado.
- [ ] Gates de performance das fases anteriores **não regrediram**.

### 🔒 Cross-check de segurança
- [ ] **`PUT /api/settings` validado** por schema Pydantic: só chaves/valores conhecidos são
      aceitos; valores fora do esperado são rejeitados (sem injeção via config).
- [ ] Settings de `localStorage` são validadas ao ler (não confiar cegamente no que está lá).
- [ ] Links externos (canal, créditos) usam `rel="noopener noreferrer"` e `https://`.
- [ ] Riscos abertos atualizados no [Registro de riscos](#-registro-de-riscos-vivo).

---

## FASE 9 — Empacotamento & Release v1

**Objetivo:** instalável em < 2 min por quem viu o vídeo; release pública.

### Micro etapas
- `chore/p9-build-pipeline` — build do frontend (`vite build`) embutido no pacote Python;
  `eaicockpit start` serve o `dist`.
- `chore/p9-packaging` — finalizar `pyproject.toml` (metadados, classifiers, README como
  long description); testar `pip install` a partir de wheel local e de TestPyPI.
- `docs/p9-docs-final` — revisar README (GIF/screenshot do cockpit), CHANGELOG `v1.0.0`,
  CONTRIBUTING; checar todos os links da doc.
- `chore/p9-release` — publicar no **PyPI** (`eaicockpit`); criar **GitHub Release**
  `v1.0.0` com notas; tag.

### Testes / verificação
- Instalação limpa em ambiente virgem (venv novo) **< 2 min** até o cockpit abrir.
- `eaicockpit add <pasta> && eaicockpit start` funciona ponta a ponta.
- Smoke test em Chrome, Edge e Firefox.

### ✅ Gate de saída (Release)
- [ ] `pip install eaicockpit` funciona do zero em < 2 min.
- [ ] Fluxo completo (add → start → navegar → painel) funciona em 3 navegadores.
- [ ] **Todos os gates de performance e memória** das fases 4, 5, 6, 7 reconfirmados na
      build final.
- [ ] CI verde; CHANGELOG e README finalizados; Release `v1.0.0` publicada.

### 🔒 Cross-check de segurança (gate de lançamento — supply chain)
- [ ] **Dependências fixadas e auditadas:** `pip-audit` (Python) e `npm audit` (frontend)
      sem high/critical; versões pinadas (lockfiles commitados).
- [ ] Artefato publicado é **íntegro e reproduzível** a partir do tag; release com checksums.
- [ ] Conta PyPI com **2FA**; publicação via token de projeto (não senha), idealmente por
      CI com **Trusted Publishing** (OIDC), sem token longo em segredo.
- [ ] **Varredura final de segredos** em todo o histórico antes da release pública.
- [ ] **Todos os cross-checks de segurança das fases 0–8 reconfirmados** na build final.
- [ ] [Registro de riscos](#-registro-de-riscos-vivo) sem item **aberto** de severidade
      alta/crítica.

---

## 🚦 Gates de qualidade (globais)

Aplicáveis a **todo PR** (além dos gates específicos de cada fase):

### Qualidade de código
- [ ] **Backend:** `ruff` (lint+format) sem erros; `mypy` limpo; type hints no código novo.
- [ ] **Frontend:** `eslint` + `prettier` sem erros; build de produção sem warnings.
- [ ] **Testes:** `pytest` verde; testes novos para lógica nova; cobertura não regride.
- [ ] Sem `console.log`, código morto, `TODO` vago ou segredos commitados.
- [ ] Conventional Commits; CHANGELOG atualizado se afeta o usuário.

### Desempenho (quando o PR toca render/painel/níveis)
- [ ] Declara no corpo do PR o impacto nas metas de performance.
- [ ] Não regride: 60fps/500 nós · painel < 100ms · transição < 600ms · **0 leak/50 ciclos**.

### Segurança (todo PR)
- [ ] Nenhum segredo/credencial/caminho pessoal adicionado.
- [ ] Entrada externa (parâmetros de API, conteúdo de arquivo, config) é validada/sanitizada.
- [ ] `pip-audit` / `npm audit` sem high/critical novos.

### CI (GitHub Actions) — bloqueia merge
- Job backend: `ruff` + `mypy` + `pytest` + **`pip-audit`**.
- Job frontend: `eslint` + `prettier --check` + `vite build` + **`npm audit`**.
- Job segurança: **`gitleaks`** (segredos) em todo PR; **CodeQL** (SAST) habilitado no repo.
- `main` protegida: PR obrigatório + CI verde + (opcional) 1 review.

> **Regra mestra:** uma fase só é considerada concluída — e a próxima só começa — quando o
> gate de saída da fase, **o cross-check de segurança da fase** e os gates globais estiverem
> **todos verdes**.

---

## 🔐 Segurança: riscos e cross-check obrigatório

> Esta seção centraliza **todos os riscos de segurança conhecidos**, a postura de defesa e o
> ferramental. **Cada fase tem seu próprio Cross-check de segurança** (blocos `🔒` acima); uma
> fase só fecha quando o cross-check dela passa e o [Registro de riscos](#-registro-de-riscos-vivo)
> está atualizado. **Nada de "resolver depois".**

### Modelo de ameaça (o que estamos protegendo)
O eAI Cockpit é uma ferramenta **local**: um servidor Python que lê o **filesystem do
usuário** e o expõe a um frontend no navegador. O código é **open source público**. Daí os
vetores principais:

1. **Vazamento no repositório público** — segredos, tokens ou **caminhos/dados pessoais**
   (nomes de empresas/clientes) commitados. *Mais provável e mais grave.*
2. **Exposição de informação do autor** — demos/screenshots/`cache.json` revelando dados
   reais dos negócios.
3. **Acesso indevido ao filesystem** — path traversal, symlink, ou `id`/`parent` forjado
   levando o backend a ler/servir arquivos **fora dos workspaces apontados**.
4. **Servidor exposto na rede** — bind em `0.0.0.0` deixaria a máquina acessível a terceiros
   na mesma rede.
5. **XSS / injeção no frontend** — conteúdo de arquivo do usuário (labels, `.md`, preview)
   renderizado sem sanitização.
6. **Supply chain** — dependência maliciosa/vulnerável (PyPI/npm) ou release adulterada.
7. **DoS** — grafo gigante travando cliente/servidor.
8. **Reputacional/legal** — falta de "AS IS"/garantia; PRs maliciosos mergeados sem revisão.

### Postura de defesa (princípios)
- **Localhost-only por padrão** (`127.0.0.1`); rede só com flag explícita + aviso.
- **Confinamento de filesystem:** toda leitura passa por `Path.resolve()` + verificação de
  estar **dentro** de um workspace configurado; symlinks p/ fora recusados.
- **Validação de entrada** em toda a API (Pydantic) e **sanitização de saída** no frontend.
- **Mínimo privilégio:** sem shell com input do usuário; sem rede externa não prevista.
- **Segredos nunca no repo;** detecção automatizada antes de cada push e em CI.
- **Sem garantia** declarada (MIT "AS IS") + `SECURITY.md` para reporte responsável.

### Ferramental de segurança (automatizado)
| Camada | Ferramenta | Onde roda |
|--------|-----------|-----------|
| Segredos | `gitleaks` (pre-push + CI) · GitHub **Secret Scanning** | local + repo |
| Deps Python | `pip-audit` | CI |
| Deps frontend | `npm audit` | CI |
| SAST | **CodeQL** | repo (PR) |
| Atualização de deps | **Dependabot** | repo |
| Path traversal / IDOR | testes `pytest` dedicados | CI |
| XSS | testes de render com payload malicioso | CI/manual |

### 🧾 Registro de riscos (vivo)
Tabela mantida ao longo do projeto. **Status:** `aberto` · `mitigado` · `aceito`.
Atualizar no cross-check de cada fase. **Nenhum item `aberto` de severidade alta/crítica
pode passar para a fase seguinte** (e nenhum pode existir na release v1).

| ID | Risco | Sev. | Fase que trata | Mitigação | Status |
|----|-------|------|----------------|-----------|--------|
| S-01 | Segredo/dado pessoal no histórico público | Alta | 0 | gitignore forte + gitleaks + secret scanning | _a iniciar_ |
| S-02 | Servidor exposto na rede (`0.0.0.0`) | Alta | 1 | bind `127.0.0.1` padrão + teste | _a iniciar_ |
| S-03 | Stack trace/erro vazando ao cliente | Média | 1 | handler de erro → JSON limpo | _a iniciar_ |
| S-04 | Path traversal no scanner/API | Alta | 2 | confinamento `Path.resolve()` + testes | _a iniciar_ |
| S-05 | Symlink apontando p/ fora do workspace | Alta | 2 | recusar symlink externo + teste | _a iniciar_ |
| S-06 | `cache.json` vazando conteúdo sensível | Média | 2 | só metadados leves; gitignored | _a iniciar_ |
| S-07 | XSS via label/dado renderizado | Alta | 3 | `textContent`/sanitização + teste | _a iniciar_ |
| S-08 | DoS por grafo gigante | Média | 4 | limites/paginação + degradação | _a iniciar_ |
| S-09 | IDOR via `parent=<id>` forjado | Alta | 5 | validar IDs conhecidos; 404 senão | _a iniciar_ |
| S-10 | Dependência de CDN externo não fixado | Baixa | 6 | assets locais ou SRI + pin | _a iniciar_ |
| S-11 | XSS via preview de `.md` no painel | Alta | 7 | sanitizador allowlist + teste | _a iniciar_ |
| S-12 | Leitura lazy fora do workspace | Alta | 7 | reusar confinamento da Fase 2 + teste | _a iniciar_ |
| S-13 | Injeção via `PUT /api/settings` | Média | 8 | schema Pydantic estrito | _a iniciar_ |
| S-14 | Supply chain (dep maliciosa/release adulterada) | Alta | 9 | pin + audit + Trusted Publishing + checksums | _a iniciar_ |
| S-15 | PR malicioso mergeado sem revisão | Média | 0 (contínuo) | branch protection + revisão + CodeQL | _a iniciar_ |
| S-16 | Falta de "AS IS"/garantia (legal) | Baixa | 0 | MIT + nota no README + SECURITY.md | _a iniciar_ |

> Surgindo risco novo durante uma fase, **adicione uma linha aqui** e só feche a fase quando
> ele estiver `mitigado` ou conscientemente `aceito` (com justificativa).

---

## 🧪 Estratégia de teste por camada

| Camada | Ferramenta | O que cobre |
|--------|-----------|-------------|
| Backend unit | pytest | scanner, pipeline, graph, config, models |
| Backend API | pytest + httpx/TestClient | rotas, contratos, segurança de caminho |
| Frontend lint/build | eslint, prettier, vite | sanidade e regressão de build |
| Performance | scripts em `tests/perf/` + Chrome DevTools | fps, draw calls, frame time |
| Memória | Chrome DevTools (heap snapshots) | leak em painel e troca de nível |
| **Segurança** | gitleaks, pip-audit, npm audit, CodeQL + testes dedicados | segredos, deps, path traversal, IDOR, XSS |
| Manual / E2E | checklist por fase | navegação, UX, A11y, multi-navegador |

---

## 📦 Definition of Done (resumo)

Uma fase está **DONE** quando:
- [ ] Todas as micro etapas mergeadas em `main` via PR com CI verde.
- [ ] Gate de saída da fase **e** gates globais verdes.
- [ ] **Cross-check de segurança (🔒) da fase concluído** e [Registro de riscos](#-registro-de-riscos-vivo)
      atualizado, sem item `aberto` de severidade alta/crítica.
- [ ] Metas de performance/memória reconfirmadas (quando aplicável).
- [ ] CHANGELOG atualizado e tag da fase criada.
- [ ] Setup de 1 comando segue funcionando.

---

> Após a conclusão da v1 (`v1.0.0`), abrir o planejamento da **v2** (PRD §5): Nível 2 como
> cena 3D, watch em tempo real (WebSocket/Watchdog), busca/filtro, métricas do YouTube,
> histórico em SQLite.
