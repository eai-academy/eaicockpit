# CLAUDE.md — eAI Cockpit

> **Contexto técnico do produto para o Claude Code.**
> Este documento é a fonte de verdade de *como* construir o eAI Cockpit. O **PRD.md**
> define o *o quê* e o *porquê*; este arquivo define o *como*, as diretrizes, o que fazer
> e — igualmente importante — **o que NÃO fazer**.
>
> Status: implementação · Versão alvo: v1 · Autor: eAI Academy

---

## 0. Leia isto primeiro (regras de ouro)

1. **Performance e beleza são requisitos de primeira classe, não polimento final.** Cada PR
   é avaliado por 60fps e por estética. Se uma feature funciona mas derruba o frame rate,
   ela **não está pronta**.
2. **Nunca carregar o universo inteiro.** Lazy loading por nível é a espinha dorsal.
3. **`dispose()` é obrigatório.** Toda geometria, material, textura, listener e referência
   que sai de cena é liberada. Memory leak é bug bloqueante.
4. **Simplicidade de setup é sagrada.** O usuário roda `pip install eaicockpit` (ou
   `git clone` + 1 comando) e funciona. Zero banco externo, zero config obrigatória.
5. **Siga o PRD.** Se algo aqui conflitar com o PRD.md, o PRD vence — e me avise.
6. **Não invente escopo.** Voz, app desktop, YouTube API e SQLite são v2/v3. Não construa
   na v1, nem deixe stubs grandes.

---

## 1. O que estamos construindo (resumo de 30 segundos)

**eAI Cockpit** é um visualizador 3D de projetos Claude Code. O usuário aponta para pastas;
o backend Python varre, classifica e monta um grafo; o frontend Three.js renderiza um
**universo navegável** estilo HUD do Jarvis — esferas (mundos) no espaço, conectadas, com
glow holográfico. A navegação é em camadas (**zoom semântico**): Galáxia (workspaces) →
Mundo (projetos) → Detalhe (painel HUD).

Propósito duplo: ferramenta pessoal de comando do autor **e** produto open source que é
chamariz/conteúdo para o canal **eAI Academy**. É grátis e público.

---

## 2. Stack técnica (não trocar sem aprovação)

### Backend — Python
- **Python 3.11+**, **FastAPI**, **Uvicorn** (ASGI).
- **Watchdog** para observar o filesystem e empurrar updates via WebSocket.
- **Pydantic v2** para os modelos do grafo (validação + serialização rápida).
- Empacotamento via **`pyproject.toml`** (build com `hatchling` ou `setuptools`); publicável
  como `pip install eaicockpit`, expondo o entry point `eaicockpit`.
- **Sem** ORM, sem banco externo, sem Django. Persistência v1 = arquivos JSON locais.

### Frontend — JavaScript (vanilla + módulos ES)
- **Three.js** (última versão estável, via npm).
- **3d-force-graph** (vasturiano) — grafo 3D com física sobre Three.js.
- **GSAP v3** — transições de câmera, expand/collapse, animação de painel.
- **postprocessing** (pmndrs) — bloom/glow seletivo (Jarvis).
- **Vite** — dev server (HMR) + build do bundle estático que o FastAPI serve.
- **Sem framework de UI pesado** na v1. O HUD (painéis, botões, configurações) é
  **HTML/CSS/JS vanilla** sobreposto ao canvas. Nada de React/Vue/Svelte na v1 — mantém o
  bundle pequeno e o foco em performance. (Reavaliar só se a UI do painel crescer muito.)

### Linguagens permitidas
- **Python** (backend), **JavaScript ES2022+ / módulos ES** (frontend), **HTML5**, **CSS3**
  (com custom properties para a paleta). **GLSL** só se precisarmos de shader custom para
  algum efeito — preferir o que `postprocessing` já oferece.
- **TypeScript:** opcional e bem-vindo no frontend se não atrapalhar o setup do Vite; se
  adotar, adotar para o frontend inteiro, não pela metade. Decisão: **começar em JS** para
  simplicidade; migrar para TS só se a base crescer.

---

## 3. Estrutura do repositório (seguir exatamente)

```
eaicockpit/
├── PRD.md                  # o quê e por quê (não editar sem aprovação)
├── CLAUDE.md               # este arquivo (como construir)
├── plan.md                 # plano de implementação faseado
├── README.md               # instalação e uso (público)
├── LICENSE                 # MIT
├── CONTRIBUTING.md         # como contribuir (AAA)
├── CHANGELOG.md            # Keep a Changelog + SemVer
├── CODE_OF_CONDUCT.md      # Contributor Covenant
├── pyproject.toml          # empacotamento Python (pip install eaicockpit)
├── .gitignore
├── .editorconfig
├── backend/
│   ├── __init__.py
│   ├── main.py             # FastAPI app + rotas + serve frontend estático
│   ├── scanner.py          # varredura e classificação de projetos
│   ├── pipeline.py         # lógica de status do pipeline de vídeo
│   ├── graph.py            # montagem de nós/arestas + níveis (LOD-aware)
│   ├── watcher.py          # watchdog → WebSocket
│   ├── models.py           # Pydantic: Node, Link, Graph, NodeDetail
│   ├── config.py           # leitura/escrita de .eaicockpit/config.json
│   └── cli.py              # comandos: add, remove, start, list
├── frontend/
│   ├── index.html
│   ├── public/             # estáticos (favicon, ícones, sons opcionais)
│   ├── src/
│   │   ├── main.js         # bootstrap Three.js + 3d-force-graph
│   │   ├── graph/          # render de nós, arestas, LOD, instancing
│   │   ├── levels/         # zoom semântico (galáxia↔mundo) + expand/collapse
│   │   ├── panel/          # painel de detalhe (Nível 2) + dispose rigoroso
│   │   ├── camera/         # controles e transições GSAP
│   │   ├── fx/             # bloom/postprocessing seletivo, partículas
│   │   ├── ui/             # HUD: botões, menu de configurações, créditos, onboarding
│   │   ├── settings/       # estado de configurações + persistência (localStorage)
│   │   ├── api/            # cliente REST/WS
│   │   └── styles/         # CSS (variáveis da paleta, glassmorphism)
│   ├── vite.config.js
│   └── package.json
├── tests/
│   ├── backend/            # pytest (scanner, graph, pipeline, api)
│   └── perf/               # checklist/scripts de perf (ver seção 9)
└── .eaicockpit/            # GERADO: config, cache (gitignored)
```

> Crie os arquivos AAA (CONTRIBUTING, CHANGELOG, CODE_OF_CONDUCT, LICENSE, .editorconfig)
> mesmo que curtos. Um produto AAA tem a casa arrumada desde o primeiro commit.

---

## 4. Modelo de dados (contrato backend↔frontend)

Definir em `backend/models.py` com Pydantic v2. O frontend consome este JSON e nada além.

```jsonc
// GET /api/graph?level=0  → leve, SEM previews
{
  "level": 0,
  "nodes": [
    {
      "id": "ws:eai-academy",
      "type": "workspace",          // workspace | video | skill | folder | doc
      "label": "eAI Academy",
      "status": "active",           // active | done | wip | pending | blocked
      "childCount": 14,
      "color": "#7C3AED",
      "size": 12,
      "preview_endpoint": "/api/node/ws:eai-academy"  // lazy, só no clique
    }
  ],
  "links": [
    { "source": "ws:eai-academy", "target": "ws:empresa-a", "type": "sibling" }
    // type: hierarchy | sibling | semantic | dependency
  ]
}
```

`GET /api/node/<id>` retorna o **detalhe completo** (lazy): título, métricas, status do
pipeline por etapa, preview de conteúdo, ações rápidas. **Nunca** mande detalhe no grafo.

### API (implementar exatamente estas rotas na v1)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/graph?level=0` | Grafo do nível (leve) |
| GET | `/api/graph?parent=<id>` | Filhos de um nó (explodir bolha) |
| GET | `/api/node/<id>` | Detalhe completo (lazy) |
| POST | `/api/workspace` | Adiciona pasta como workspace |
| DELETE | `/api/workspace/<id>` | Remove workspace |
| GET | `/api/settings` / PUT | Lê/grava configurações persistidas |
| WS | `/ws` | Push de updates (watchdog) — **v2 para tempo real; v1 pode stub** |

---

## 5. Backend — diretrizes

### Varredura (`scanner.py`)
1. Detecta workspace Claude Code (`.claude/`, `CLAUDE.md`) vs. pasta genérica.
2. Mapeia subprojetos (`videos/<slug>/` etc.) e classifica tipo de nó.
3. Para vídeos, calcula status do pipeline em `pipeline.py` (roteiro → fonte → transcrição
   → metadados → thumbnail → cortes → distribuição → publicado).
4. Extrai **metadados leves** para preview — **sem ler arquivos grandes** (lazy: só no clique
   via `/api/node/<id>`).
5. Lê `[[links]]` em `.md` para arestas semânticas.

### Regras
- **Cache em disco** (`.eaicockpit/cache.json`): não re-varrer tudo a cada start. Invalida
  por mtime.
- Varredura deve ser **assíncrona/não bloqueante** onde fizer sentido; nunca travar a
  resposta da API enquanto varre projeto enorme.
- **Trate caminhos com segurança:** valide que a pasta existe e é legível; nunca siga
  symlinks para fora; **nunca** exponha conteúdo de arquivo fora dos workspaces apontados.
- O servidor é **localhost-only por padrão** (bind `127.0.0.1`). Não expor na rede sem flag
  explícita. Isto é uma ferramenta local, não um serviço público.
- Erros são tratados e logados; a API responde com JSON de erro claro, nunca stack trace
  cru para o cliente.

---

## 6. Frontend — diretrizes de arquitetura

- **Separação por responsabilidade** conforme as pastas de `src/`. Render de grafo não sabe
  de UI; UI não mexe direto em geometria.
- **Um único loop de render** (`requestAnimationFrame`). Tudo que anima passa por ele.
- **Estado central simples** (um módulo `state`/store leve em JS puro). Sem libs de estado.
- **API client isolado** em `src/api/` — o resto do app nunca faz `fetch` direto.
- **Configurações** (`src/settings/`) persistem em `localStorage` e espelham no backend via
  `PUT /api/settings` quando relevante. Toda config tem default sensato.

---

## 7. Zoom semântico e níveis (o diferencial)

- **Nível 0 (Galáxia):** nós = workspaces. **Nível 1 (Mundo):** nós = projetos do workspace.
  **Nível 2 (Detalhe):** painel HUD overlay (v1) — **não** é cena 3D nova na v1 (isso é v2).
- Transição entre níveis com **GSAP**: easing suave, câmera acompanhando, animação de
  **implosão** (colapsar) e **expansão** (explodir). Alvo < 600ms, sem stutter.
- Ao colapsar/voltar: **liberar memória** do nível que saiu (ver seção 9).
- O painel (Nível 2) abre em < 100ms, desliza com glassmorphism, e ao fechar (ESC / clique
  fora) faz `dispose` completo do que criou.

---

## 8. UX / Estética (a "beleza" é requisito)

- **Dark mode profundo:** fundo `#0A0A1A` → gradiente roxo-preto.
- **Paleta eAI (usar custom properties CSS):**
  - Roxo primário `#7C3AED` · Ciano `#06B6D4`
  - Status: verde `#10B981` (feito) · âmbar `#F59E0B` (em andamento) · vermelho `#EF4444`
    (pendente/bloqueado) · roxo `#7C3AED`/ativo.
- **Glow/bloom holográfico** nas esferas e arestas (bloom **seletivo** via layers — caro,
  só onde importa).
- **Partículas** percorrendo arestas (fluxo de energia).
- **Câmera cinematográfica:** órbita lenta automática quando ocioso; suaviza ao interagir.
- **Painel HUD:** vidro fosco (glassmorphism), entrada deslizante.
- **Som sutil opcional** (ligável nas configurações, **desligado por padrão**): clique,
  whoosh ao entrar numa bolha. Estilo Jarvis.
- **Tipografia:** uma fonte limpa e técnica (ex.: Inter / system-ui para UI; opcional mono
  para dados). Carregar local/`public/`, não bloquear render.

### Elementos de UI obrigatórios (requisitos AAA do produto)
- **Botão/menu de Configurações** (ícone de engrenagem, canto): liga/desliga som, bloom,
  órbita automática, partículas, qualidade (LOD agressivo / alto), tema; reset de câmera.
  Tudo persistido.
- **Tela "Sobre / Créditos" (quem criou):** modal acessível pelo menu, com nome do autor
  (**eAI Academy**), link do canal, versão do app, licença (MIT) e agradecimentos. É o
  chamariz para o canal — capriche.
- **Onboarding na primeira execução:** overlay "Arraste uma pasta aqui ou rode
  `eaicockpit add <pasta>`". Mostrar só quando não há workspaces.
- **HUD mínimo permanente:** indicador de nível atual, breadcrumb (Galáxia › Mundo), botão
  de voltar/colapsar, e (discreto) FPS togglável para diagnóstico.
- **Acessibilidade básica:** foco visível, navegação por teclado nos painéis/menus, contraste
  adequado, `prefers-reduced-motion` respeitado (reduz órbita/partículas).

---

## 9. Performance e memória (critério de aceite, não opcional)

### Princípios (implementar desde a v1)
1. **Lazy loading por nível** — API serve só o nível visível; filhos sob demanda.
2. **LOD** — nós distantes viram sprites/billboards; labels só aparecem perto.
3. **Instancing** — `InstancedMesh` para nós do mesmo tipo (1 draw call p/ milhares).
4. **Frustum culling** ativo (garantir).
5. **Pausar física quando estável** — `cooldownTicks` do 3d-force-graph; congelar layout.
6. **Limpeza rigorosa de memória** ao fechar painel/colapsar nível:
   `geometry.dispose()`, `material.dispose()`, `texture.dispose()`, remover listeners,
   anular referências. **Zero leak** ao abrir/fechar repetido.
7. **Web Workers** para o cálculo de força (não travar a main thread).
8. **Throttle/debounce** em hover/resize/scroll.
9. **Bloom seletivo** (layers) — nunca a cena inteira.
10. **Orçamento de frame:** 16ms/frame. Se cair, **degradar graciosamente** (menos
    partículas, LOD mais agressivo).

### Metas mensuráveis (gate de aceite)
- 60fps com **500 nós** visíveis.
- Abertura de painel **< 100ms**.
- Transição expand/collapse **< 600ms** sem stutter.
- **Zero** crescimento de memória após **50 ciclos** de abrir/fechar painel (testar no
  profiler do Chrome DevTools — heap estável).

> Qualquer PR que toque em render/painel deve declarar no corpo como afeta essas metas.

---

## 10. O que NÃO fazer (anti-diretrizes)

- ❌ Não carregar o grafo inteiro de uma vez "porque é mais simples".
- ❌ Não criar nó/material/textura sem ter um caminho claro de `dispose()`.
- ❌ Não aplicar bloom na cena inteira.
- ❌ Não adicionar banco de dados externo, Docker obrigatório, ou serviço em nuvem na v1.
- ❌ Não adicionar React/Vue/Svelte/jQuery na v1.
- ❌ Não implementar voz, app Tauri, YouTube API ou SQLite na v1 (são v2/v3).
- ❌ Não expor o servidor na rede por padrão; não ler/servir arquivos fora dos workspaces.
- ❌ Não bloquear a main thread com varredura ou layout pesado.
- ❌ Não deixar `console.log`, código morto, ou `TODO` vago em PR de merge.
- ❌ Não quebrar o setup de 1 comando. Se uma dependência complica o `pip install`, repensar.
- ❌ Não virar editor de código, kanban tradicional, nem ferramenta de deploy (ver PRD §1).

---

## 11. Qualidade, testes e ferramentas

- **Backend:** `pytest` para scanner, graph, pipeline e rotas da API. Lint/format com
  **ruff** (lint + format). Type hints em todo código novo; checar com `mypy` quando viável.
- **Frontend:** **ESLint** + **Prettier**. Sem warnings no build de produção.
- **Perf:** checklist da seção 9 + roteiro de teste no profiler antes de marcar feature de
  render como pronta. Cena de stress com 500 nós em `tests/perf/`.
- **CI (GitHub Actions):** rodar lint + testes do backend e build do frontend em cada PR.
- **Convenções:** Conventional Commits (`feat:`, `fix:`, `perf:`, `docs:`…). SemVer no
  `CHANGELOG.md` (Keep a Changelog).
- **.editorconfig:** Python 4 espaços, JS/CSS/HTML 2 espaços, LF, UTF-8, newline final.

---

## 12. CLI (interface de entrada do produto)

`cli.py` expõe o comando `eaicockpit`:

```
eaicockpit add <pasta>     # adiciona um workspace (grava em .eaicockpit/config.json)
eaicockpit remove <id>     # remove um workspace
eaicockpit list            # lista workspaces configurados
eaicockpit start           # sobe FastAPI+Uvicorn e abre o browser no cockpit
```

- `start` deve abrir o navegador automaticamente (com flag `--no-open` para desligar) e
  imprimir a URL local. Porta default sensata (ex.: 7373), configurável por flag.
- Mensagens de CLI claras, com cor sutil; erros amigáveis (pasta inexistente etc.).

---

## 13. Roadmap (resumo — detalhe no PRD §5)

- **v1 (este escopo):** CLI, varredura multi-workspace, Níveis 0↔1 com zoom semântico, nós
  com label+cor, painel de detalhe, expand/collapse animado, bloom/dark/paleta eAI,
  status de vídeo, perf 60fps/500 nós, **UI: configurações + créditos + onboarding**.
- **v2:** Nível 2 como cena 3D real, watch em tempo real (WS), busca/filtro, métricas
  YouTube, histórico (SQLite).
- **v3:** App desktop (Tauri), voz (Web Speech API), ações executáveis, marketplace.

---

## 14. Definition of Done (por feature)

Uma feature da v1 está pronta quando:
- [ ] Funciona conforme PRD + este documento.
- [ ] Não regride as metas de performance da seção 9 (declarado no PR).
- [ ] Sem memory leak (geometria/material/textura/listeners liberados).
- [ ] Lint/format limpos; testes relevantes passando.
- [ ] Sem `console.log`/código morto/segredos.
- [ ] Setup de 1 comando continua funcionando.
- [ ] Documentada no README/CHANGELOG se afeta o usuário.

---

> Próximo documento: **plan.md** — plano de implementação faseado (ordem dos arquivos e
> entregas). Gerar após este CLAUDE.md ser aprovado.
