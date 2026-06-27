# PRD — eAI Cockpit

> **Product Requirements Document**
> Versão 1.0 · Autor: eAI Academy · Status: Draft para implementação

---

## 1. Visão

**eAI Cockpit** é um visualizador 3D de projetos Claude Code. Você aponta para uma ou
mais pastas de projeto (qualquer diretório com arquivos `.md`, `.claude/`, código) e o
cockpit varre, entende e renderiza tudo como um **universo navegável** — esferas
(mundos) flutuando no espaço, conectadas por linhas, que você explora, clica e mergulha.

A metáfora é o **HUD do Jarvis (Homem de Ferro)**: uma visão macro de tudo o que você
controla, na qual você pode dar zoom, abrir um "mundo", inspecionar detalhes e voltar —
sempre fluido, bonito e rápido.

### Propósito duplo
1. **Ferramenta pessoal de comando** — visão única de todos os negócios/projetos do autor
   (canal eAI Academy + empresas), para apoiar tomada de decisão.
2. **Produto/conteúdo** — open source lançado no canal eAI Academy, demonstrando o poder
   de construir com Claude Code.

### O que NÃO é
- Não é um editor de código (não substitui o VS Code).
- Não é um gerenciador de tarefas tradicional (kanban plano).
- Não faz upload/deploy de nada — é observabilidade e navegação.

---

## 2. Conceito central: Mundos dentro de Mundos (zoom semântico)

O diferencial do produto é a **navegação em camadas (Level of Detail / zoom semântico)**.
O usuário transita entre níveis de abstração sem trocar de tela:

```
NÍVEL 0 — GALÁXIA (visão macro)
  Cada nó = um WORKSPACE inteiro (eAI Academy, Empresa A, Empresa B…)
  Vê tudo funcionando junto. Clusters orbitando.
        │  clica numa bolha / dá zoom
        ▼
NÍVEL 1 — MUNDO (dentro de um workspace)
  Cada nó = um PROJETO/entidade do workspace
  Ex.: dentro de eAI Academy → vídeo-skills, vídeo-api, skills, marca…
        │  clica num nó
        ▼
NÍVEL 2 — DETALHE (painel, não troca de cena 3D)
  Abre um painel HUD lateral/overlay com:
  - Título, status do pipeline, métricas
  - Preview do conteúdo (ex.: título do vídeo, capítulos, thumbnail)
  - Ações rápidas (abrir pasta, copiar comando da skill)
        │  fecha o painel (ESC / clique fora)
        ▼
  Volta limpo ao grafo. Memória do painel é liberada.
```

**Colapsar/expandir:** o usuário pode "colapsar" um nível inteiro de volta em uma única
bolha (animação de implosão) e "explodir" uma bolha em seu universo interno (animação de
expansão). Transições com GSAP, com easing suave e câmera acompanhando.

---

## 3. Personas

| Persona | Necessidade |
|---------|-------------|
| **O Autor (você)** | Ver todos os negócios num lugar; decidir onde focar; navegar rápido. |
| **Criador Claude Code** | Apontar para o próprio projeto e entender o que tem dentro visualmente. |
| **Espectador do canal** | Ver o vídeo e querer instalar/testar — precisa de setup trivial. |

---

## 4. Stack técnica (decisão)

**Arquitetura escolhida: Servidor local (Python) + Browser (Three.js).**
Justificativa: é o melhor equilíbrio entre (a) distribuição open source trivial
(`pip install eaicockpit` / `git clone` + um comando), (b) ser conteúdo replicável pelo
público do canal, e (c) acesso ao filesystem para varrer pastas — que o browser puro não
tem. App desktop (Electron/Tauri) fica como evolução futura (v3), reaproveitando o mesmo
frontend.

### Backend
- **Python 3.11+** com **FastAPI** (async, rápido, simples) + **Uvicorn**.
- Responsável por: varrer diretórios, classificar projetos, montar o grafo (nós/arestas),
  servir o frontend estático e expor a API REST/WebSocket.
- **Watchdog** (lib Python) para detectar mudanças em arquivos e atualizar o grafo em
  tempo real (push via WebSocket) — sem precisar recarregar.
- **Cache em disco** (`.eaicockpit/cache.json`) para não re-varrer tudo a cada start.

### Frontend
- **Three.js** (vanilla, última versão) — não há amarra com libs antigas; partimos limpo.
- **3d-force-graph** (vasturiano) — biblioteca sobre Three.js para grafos 3D com física,
  já entrega ~80% (nós, arestas, órbita, zoom, partículas nas arestas).
- **GSAP v3** — transições de câmera, expand/collapse, animação do painel (já é familiar
  ao ecossistema do autor via HyperFrames).
- **postprocessing** (lib do pmndrs) — bloom/glow para o efeito holográfico Jarvis.
- **Vite** — dev server com HMR + build do bundle estático que o FastAPI serve.

### Persistência
- **v1:** arquivos JSON locais (`.eaicockpit/`) — config de workspaces, cache, posições.
- **v2+:** SQLite (histórico, métricas no tempo) — opcional, ligável.
- **Não** usar banco externo na v1. Tudo local, zero setup.

### Por que não HTML estático puro?
Porque o produto precisa **apontar para qualquer pasta** e **detectar mudanças**. Isso
exige um processo com acesso a filesystem — daí o servidor Python leve.

---

## 5. Escopo da v1 (decisão: multi-projeto desde já)

A v1 já nasce **multi-workspace**, porque é assim que o autor vai usar de verdade (canal +
empresas) e porque o efeito 3D só impressiona com volume. Mas a profundidade de "níveis"
é entregue incrementalmente:

### v1 — Núcleo (primeiro vídeo)
- [ ] CLI: `eaicockpit add <pasta>` adiciona um workspace; `eaicockpit start` sobe o servidor.
- [ ] Varredura de múltiplos workspaces apontados.
- [ ] **Nível 0 (galáxia)** e **Nível 1 (mundo)** com zoom semântico entre eles.
- [ ] Nós com **label visível** (nome do projeto) + cor por status do pipeline.
- [ ] Clique no nó → **painel de detalhe (Nível 2)** com preview e ações.
- [ ] Expand/collapse animado (GSAP) entre níveis.
- [ ] Bloom/glow (estética Jarvis), dark mode, paleta eAI (roxo #7C3AED + ciano).
- [ ] Detecção de status de vídeo (reaproveita a lógica do pipeline já definida).
- [ ] Performance: 60fps com até ~500 nós visíveis (ver seção 8).

### v2 — Profundidade
- [ ] **Nível 2 como cena 3D real** (entrar na bolha vira um sub-universo, não só painel).
- [ ] Watch em tempo real (arquivo muda → nó pulsa/atualiza).
- [ ] Busca/filtro ("mostre só vídeos sem distribuição").
- [ ] Métricas do canal (YouTube API) infladas nos nós de vídeo.
- [ ] Histórico (SQLite) — timeline de evolução do projeto.

### v3 — Produto/Jarvis
- [ ] App desktop (Tauri) reaproveitando o frontend.
- [ ] **Integração por voz** (Web Speech API → comandos: "abrir eAI Academy", "o que falta
      no vídeo de skills") — o "meu próprio Jarvis".
- [ ] Ações executáveis (disparar skills do Claude Code direto do cockpit).
- [ ] Marketplace/templates de visualização.

---

## 6. O que cada nó representa (granularidade híbrida)

Granularidade é **híbrida por nível** (a resposta do autor: "mundos dentro de mundos"):

| Nível | Nó representa | Exemplos |
|-------|---------------|----------|
| 0 Galáxia | Workspace | eAI Academy, Empresa A, Empresa B |
| 1 Mundo | Projeto/entidade dentro do workspace | vídeo-skills, marca, scripts |
| 2 Detalhe | Arquivos/atributos do projeto | roteiro.md, titulo.md, status, métricas |

**Tipos de nó** (com ícone/cor distintos):
- 🎬 Vídeo (tem pipeline de produção)
- 🛠️ Skill / ferramenta
- 📁 Pasta genérica / módulo
- 🏢 Workspace (nível 0)
- 📄 Documento (`.md` solto)

**Arestas (conexões):**
- Hierarquia (workspace → projeto → arquivo).
- Relação semântica (mesmo tema, série, referência cruzada via `[[links]]` em `.md`).
- Dependência (skill usada por projeto).

---

## 7. Detecção e modelo de dados

### Varredura (backend)
Para cada pasta apontada, o scanner:
1. Detecta se é workspace Claude Code (`.claude/`, `CLAUDE.md`) ou pasta genérica.
2. Mapeia subprojetos (ex.: `videos/<slug>/`) e classifica tipo de nó.
3. Para nós de vídeo, calcula o **status do pipeline** (reaproveita a lógica já desenhada:
   roteiro, fonte, transcrição, metadados, thumbnail, cortes, distribuição, publicado).
4. Extrai metadados leves para preview (título de `metadados/titulo.md`, capítulos da
   descrição, etc.) — **sem ler arquivos grandes** (lazy: só no clique).
5. Lê `[[links]]` em `.md` para montar arestas semânticas.

### Modelo do grafo (JSON servido pela API)
```jsonc
{
  "level": 0,
  "nodes": [
    {
      "id": "ws:eai-academy",
      "type": "workspace",
      "label": "eAI Academy",
      "status": "active",
      "childCount": 14,
      "color": "#7C3AED",
      "size": 12,
      "preview_endpoint": "/api/node/ws:eai-academy"   // lazy
    }
  ],
  "links": [
    { "source": "ws:eai-academy", "target": "ws:empresa-a", "type": "sibling" }
  ]
}
```

### API
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/graph?level=0` | Grafo do nível atual (leve, sem previews) |
| GET | `/api/graph?parent=<id>` | Filhos de um nó (ao explodir uma bolha) |
| GET | `/api/node/<id>` | Detalhe completo do nó (lazy, só no clique) |
| POST | `/api/workspace` | Adiciona uma pasta como workspace |
| DELETE | `/api/workspace/<id>` | Remove workspace |
| WS | `/ws` | Push de updates em tempo real (watchdog) |

---

## 8. Performance (requisito de primeira classe)

O grafo **vai crescer muito** — performance é critério de aceite, não "nice to have".

### Princípios
1. **Lazy loading por nível.** Nunca carregar o universo inteiro. A API serve só o nível
   visível; filhos vêm sob demanda ao explodir uma bolha.
2. **Level of Detail (LOD).** Nós distantes da câmera renderizam como sprites simples
   (billboards), não geometria completa. Labels só aparecem perto.
3. **Instancing.** Nós do mesmo tipo usam `InstancedMesh` do Three.js — milhares de
   esferas com 1 draw call.
4. **Frustum culling.** Não renderizar o que está fora da câmera (nativo do Three.js,
   garantir que está ativo).
5. **Pausar física quando estável.** O motor de força do 3d-force-graph deve "congelar"
   (`cooldownTicks`) quando o layout assenta — para de consumir CPU.
6. **Limpeza rigorosa de memória (crítico).** Ao fechar um painel ou colapsar um nível:
   - `geometry.dispose()`, `material.dispose()`, `texture.dispose()` em tudo que sai de cena.
   - Remover event listeners.
   - Anular referências para o GC coletar.
   - **Sem memory leaks** ao abrir/fechar repetidamente — testar com profiler.
7. **Web Workers** para o cálculo de layout de força (não travar a thread principal).
8. **Throttle/debounce** em eventos de hover/resize/scroll.
9. **Bloom seletivo.** Postprocessing é caro — aplicar bloom só nos nós que importam
   (selective bloom via layers), não na cena inteira.
10. **Orçamento de frame.** Alvo: 16ms/frame (60fps). Budget de polígonos e draw calls
    definido; degradar graciosamente (reduzir partículas/LOD) se cair abaixo.

### Metas mensuráveis
- 60fps com **500 nós** visíveis simultaneamente.
- Abertura de painel < 100ms.
- Transição expand/collapse < 600ms, sem stutter.
- Zero crescimento de memória após 50 ciclos de abrir/fechar painel.

---

## 9. UX / Estética

- **Dark mode** profundo (fundo `#0A0A1A` → gradiente roxo-preto).
- Paleta eAI: roxo `#7C3AED`, ciano `#06B6D4`, verde `#10B981` (feito), âmbar `#F59E0B`
  (em andamento), vermelho `#EF4444` (pendente/bloqueado).
- **Glow/bloom** holográfico nas esferas e arestas.
- **Partículas** percorrendo as arestas (fluxo de "energia").
- **Câmera cinematográfica:** órbita lenta automática quando ocioso; suaviza ao interagir.
- **Painel HUD** (Nível 2): vidro fosco (glassmorphism), entra deslizando, com a info do nó.
- **Som sutil** (opcional, ligável): clique, whoosh ao entrar numa bolha. Estilo Jarvis.
- **Onboarding:** primeira execução mostra "Arraste uma pasta aqui ou rode
  `eaicockpit add <pasta>`".

---

## 10. Estrutura do repositório (produto separado)

Produto vive em repositório próprio (`eaicockpit/`), fora da mesa de trabalho do canal.

```
eaicockpit/
├── PRD.md                  # este documento
├── CLAUDE.md               # contexto do produto p/ Claude Code
├── plan.md                 # plano de implementação (próximo passo)
├── README.md               # instalação e uso (para o público)
├── LICENSE                 # open source (MIT sugerido)
├── pyproject.toml          # empacotamento Python (pip install eaicockpit)
├── backend/
│   ├── main.py             # FastAPI app + rotas
│   ├── scanner.py          # varredura e classificação de projetos
│   ├── pipeline.py         # lógica de status (reaproveitada do canal)
│   ├── graph.py            # montagem de nós/arestas + níveis
│   ├── watcher.py          # watchdog → WebSocket
│   └── cli.py              # comandos: add, remove, start
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── main.js         # bootstrap Three.js + 3d-force-graph
│   │   ├── graph/          # render de nós, arestas, LOD, instancing
│   │   ├── levels/         # lógica de zoom semântico (galáxia↔mundo)
│   │   ├── panel/          # painel de detalhe (Nível 2) + dispose
│   │   ├── camera/         # controles e transições GSAP
│   │   ├── fx/             # bloom/postprocessing, partículas
│   │   └── api/            # cliente da API REST/WS
│   ├── vite.config.js
│   └── package.json
└── .eaicockpit/            # gerado: config, cache (gitignored)
```

---

## 11. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Performance degrada com muitos nós | Lazy por nível + LOD + instancing desde a v1 |
| Memory leak ao abrir/fechar | Disciplina de `dispose()` + teste com profiler como gate |
| Varredura lenta em projetos enormes | Cache em disco + varredura incremental (watchdog) |
| Complexidade do zoom semântico | Entregar Nível 0↔1 na v1; Nível 2 como cena 3D só na v2 |
| Setup difícil afasta público | `pip install` + 1 comando; vídeo de onboarding |
| Escopo inflar (voz, desktop) | Voz e Tauri explicitamente fora da v1 (v3) |

---

## 12. Métricas de sucesso

- **Pessoal:** o autor abre o cockpit toda semana para decidir prioridades.
- **Produto:** instalável em < 2 min por alguém que viu o vídeo.
- **Canal:** o vídeo de lançamento performa acima da média (CTR/retenção).
- **Técnico:** metas de performance da seção 8 atingidas.

---

## 13. Próximos passos (documentos)

1. **PRD.md** — este (o quê e por quê). ✅
2. **CLAUDE.md** — contexto técnico do produto para o Claude Code construir.
3. **plan.md** — plano de implementação faseado (como construir, ordem, arquivos).
```

> Após aprovar este PRD, gerar `CLAUDE.md` e `plan.md` na mesma pasta `eaicockpit/`.
