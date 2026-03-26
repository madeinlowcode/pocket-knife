# Roadmap: Pocket-Knife

## Overview

Pocket-Knife entrega 85+ skills de IA com chamadas diretas às APIs dos provedores, sem intermediário pago. A jornada começa com o scaffold do plugin e os contratos de segurança que afetam todas as skills, passa por uma batch de validação (um skill por provedor) que estabelece os templates reutilizáveis, depois porta em volume as skills de imagem, LLM, busca e guides (sem risco de chave), avança para as skills mais complexas de áudio e vídeo com polling assíncrono, e encerra com social, UI, SDK e o CLI de onboarding — tudo distribuído via GitHub e marketplace do Claude Code.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Scaffold do plugin, env loader, contratos de segurança e estrutura de distribuição
- [ ] **Phase 2: Validation Batch** - Um skill por provedor para validar auth, curl templates e política de invocação
- [ ] **Phase 3: Image, LLM, Search e Guides** - Skills de alta demanda e guides sem API key
- [ ] **Phase 4: Audio e Video** - Skills ElevenLabs (async audio) e vídeo (async polling, binary output)
- [ ] **Phase 5: Social, UI, SDK e CLI** - Skills restantes e CLI de onboarding npx

## Phase Details

### Phase 1: Foundation
**Goal**: O plugin é instalável, o env loader funciona e os contratos de segurança estão estabelecidos antes de qualquer skill ser escrita
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, SETUP-02, SETUP-03, QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06, DIST-01, DIST-02, DIST-03
**Success Criteria** (what must be TRUE):
  1. `claude plugin install` ou `/plugin marketplace add pocket-knife` instala o plugin sem erro
  2. Variáveis do `~/.claude/.env` estão disponíveis como env vars em qualquer chamada `Bash(curl *)` durante a sessão
  3. Scripts `.sh` clonam e executam sem erro em Windows (WSL/Git Bash) sem mensagem `bad interpreter`
  4. Nenhum valor de API key aparece em nenhum output ou log do Claude — apenas `****` ou mensagem de setup
  5. `/pocket-knife:setup` guia o usuário conversacionalmente para criar/atualizar `~/.claude/.env`
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Plugin scaffold: `.claude-plugin/plugin.json`, `marketplace.json`, estrutura `skills/` (9 categorias), `.gitattributes`, `README.md`, `LICENSE`, `scripts/validate-plugin.sh`
- [x] 01-02-PLAN.md — Env loader: `hooks/hooks.json` (SessionStart) + `scripts/load-env.sh` com contrato de segurança QUAL-04 (sem `set -x`, sem echo de valores)
- [x] 01-03-PLAN.md — Setup command e qualidade: `commands/setup.md` com `disable-model-invocation: true`, resolução híbrida de chaves (SETUP-03), checkpoint de verificação humana

### Phase 2: Validation Batch
**Goal**: Um skill funcional por provedor principal valida o round-trip env loader → curl → API e estabelece templates reutilizáveis para os 80+ skills restantes
**Depends on**: Phase 1
**Requirements**: IMG-01, AUD-01, LLM-01, SRCH-01, VID-02
**Success Criteria** (what must be TRUE):
  1. `/pocket-knife:ai-image-generation` gera uma imagem via Google Gemini com `GOOGLE_API_KEY` válida
  2. `/pocket-knife:elevenlabs-tts` gera um arquivo de áudio via ElevenLabs com `ELEVENLABS_API_KEY` válida
  3. `/pocket-knife:llm-models` responde via pelo menos um LLM configurado (Claude, Gemini, Kimi ou GLM)
  4. `/pocket-knife:web-search` retorna resultados via Tavily ou Exa com chave válida
  5. Skill com chave ausente exibe mensagem human-readable orientando para `/pocket-knife:setup` — sem JSON dump
**Plans**: TBD

Plans:
- [ ] 02-01: Skills de validação — `ai-image-generation` (Google), `llm-models` (multi-provider), `web-search` (Tavily+Exa)
- [ ] 02-02: Skills de validação — `elevenlabs-tts` (ElevenLabs), `google-veo` (Veo async), VERSIONS.md pattern estabelecido

### Phase 3: Image, LLM, Search e Guides
**Goal**: Todas as skills de imagem, LLM, busca web e guides estão funcionando — o plugin é imediatamente útil mesmo sem chaves de áudio/vídeo
**Depends on**: Phase 2
**Requirements**: IMG-02, IMG-03, IMG-04, IMG-05, IMG-06, IMG-07, IMG-08, IMG-09, GUIDE-01, GUIDE-02, GUIDE-03, GUIDE-04, GUIDE-05, GUIDE-06, GUIDE-07
**Success Criteria** (what must be TRUE):
  1. Todos os 9 skills de imagem (`flux-image`, `nano-banana`, `nano-banana-2`, `background-removal`, `image-upscaling`, `p-image`, `qwen-image-2`, `qwen-image-2-pro`) respondem corretamente com chaves válidas
  2. Todos os 7+ guide skills (`prompting-guide`, `design-guide`, `video-guide`, `writing-guide`, `social-guide`, `product-guide` e demais) são invocáveis sem nenhuma API key configurada
  3. Após instalar todos os skills, `/` no Claude Code mostra todos os skills esperados sem truncamento (budget OK)
  4. Nenhum SKILL.md excede 300 linhas — conteúdo extenso está em `reference.md` ou `examples/`
**Plans**: TBD

Plans:
- [ ] 03-01: Image skills restantes — `flux-image`, `nano-banana`, `nano-banana-2`, `background-removal`, `image-upscaling` (fal.ai + Google)
- [ ] 03-02: Image skills restantes — `p-image`, `qwen-image-2`, `qwen-image-2-pro` (provedores específicos)
- [ ] 03-03: Guide skills — todos os 7+ guides (prompting, design, video, writing, social, product e demais do Inference)

### Phase 4: Audio e Video
**Goal**: Todas as skills ElevenLabs de áudio e todas as skills de vídeo funcionam com tratamento correto de polling assíncrono e outputs binários
**Depends on**: Phase 3
**Requirements**: AUD-02, AUD-03, AUD-04, AUD-05, AUD-06, AUD-07, AUD-08, AUD-09, AUD-10, VID-01, VID-03, VID-04
**Success Criteria** (what must be TRUE):
  1. `/pocket-knife:elevenlabs-stt` transcreve um arquivo de áudio enviado via multipart/form-data
  2. `/pocket-knife:elevenlabs-dubbing` e demais skills ElevenLabs completam sem usar modelos deprecated (`eleven_monolingual_v1`)
  3. `/pocket-knife:ai-video-generation` e `/pocket-knife:image-to-video` exibem mensagem de progresso durante geração e salvam arquivo binário não-vazio ao concluir
  4. Skill de vídeo com polling fal.ai aguarda conclusão do job (`GET /requests/{id}`) antes de entregar o resultado — sem fire-and-forget
  5. Todos os skills ElevenLabs têm `disable-model-invocation: true` e não disparam sem invocação explícita
**Plans**: TBD

Plans:
- [ ] 04-01: ElevenLabs skills restantes — `elevenlabs-stt` (multipart upload), `elevenlabs-dialogue`, `elevenlabs-sound-effects`
- [ ] 04-02: ElevenLabs skills restantes — `elevenlabs-voice-cloner`, `elevenlabs-voice-changer`, `elevenlabs-music`, `elevenlabs-dubbing`, skills adicionais (AUD-09)
- [ ] 04-03: Video skills restantes — `ai-video-generation`, `image-to-video`, skills adicionais de vídeo (Kling, Seedream, VID-04) com async polling helper

### Phase 5: Social, UI, SDK e CLI
**Goal**: O plugin está completo com todos os skills portados, o CLI `npx pocket-knife init` existe para onboarding guiado e o repositório está pronto para distribuição pública
**Depends on**: Phase 4
**Requirements**: SOC-01, SDK-01, SDK-02, UI-01, UI-02, UI-03, UI-04, SETUP-01, SETUP-04
**Success Criteria** (what must be TRUE):
  1. `/pocket-knife:twitter-automation` executa automação Twitter com `disable-model-invocation: true` e exibe orientação sobre rate limits
  2. `npx pocket-knife init` pergunta quais categorias de skills o usuário quer, solicita apenas as chaves relevantes e escreve `~/.claude/.env` sem sobrescrever chaves existentes sem confirmação
  3. `/pocket-knife:agent-ui`, `/pocket-knife:chat-ui`, `/pocket-knife:tools-ui` e `/pocket-knife:widgets-ui` são invocáveis e entregam seus templates/interfaces
  4. `/pocket-knife:javascript-sdk` e `/pocket-knife:python-sdk` são invocáveis e entregam guias/templates de SDK
  5. Validação de chaves durante setup confirma conectividade com cada provedor configurado
**UI hint**: yes
**Plans**: TBD

Plans:
- [ ] 05-01: Social e SDK skills — `twitter-automation` (OAuth Bearer), `javascript-sdk`, `python-sdk`
- [ ] 05-02: UI skills — `agent-ui`, `chat-ui`, `tools-ui`, `widgets-ui`
- [ ] 05-03: CLI `npx pocket-knife init` — `package.json`, `bin/pocket-knife.js`, validação de chaves (SETUP-01, SETUP-04)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/3 | In Progress|  |
| 2. Validation Batch | 0/2 | Not started | - |
| 3. Image, LLM, Search e Guides | 0/3 | Not started | - |
| 4. Audio e Video | 0/3 | Not started | - |
| 5. Social, UI, SDK e CLI | 0/3 | Not started | - |
