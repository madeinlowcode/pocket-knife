# Requirements: Pocket-Knife

**Defined:** 2026-03-25
**Core Value:** O usuário usa 85+ skills de IA (imagem, vídeo, áudio, LLM, web search) com suas próprias API keys, sem intermediário pago.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: Plugin registrado como plugin Claude Code válido via `.claude-plugin/plugin.json` com namespace `pocket-knife`
- [x] **FOUND-02**: Script `load-env.sh` carrega `~/.claude/.env` uma vez via SessionStart hook e disponibiliza variáveis de ambiente
- [x] **FOUND-03**: `.gitattributes` configurado com `eol=lf` para prevenir CRLF em scripts bash no Windows
- [x] **FOUND-04**: README.md com instruções de instalação (`/plugin install` e `/plugin marketplace add`)
- [x] **FOUND-05**: Licença MIT no repositório
- [x] **FOUND-06**: Estrutura de diretórios segue padrão do Inference: `skills/[categoria]/[skill-name]/SKILL.md`

### Setup & Onboarding

- [ ] **SETUP-01**: CLI interativa via `npx pocket-knife init` que cria `~/.claude/.env` perguntando chaves por categoria de skill
- [x] **SETUP-02**: Skill `/pocket-knife:setup` para configuração conversacional do `~/.claude/.env` dentro do Claude Code
- [x] **SETUP-03**: Resolução híbrida de chaves: env var existente → `~/.claude/.env` → mensagem guiando para setup
- [ ] **SETUP-04**: Validação de chaves durante setup (teste rápido de autenticação com cada provedor)

### Skills — Imagem (9 skills)

- [x] **IMG-01**: Skill `ai-image-generation` — geração de imagem via Google Gemini (chave: `GOOGLE_API_KEY`)
- [x] **IMG-02**: Skill `nano-banana` — geração via Gemini Flash (chave: `GOOGLE_API_KEY`)
- [x] **IMG-03**: Skill `nano-banana-2` — geração via Gemini 3.1 Flash (chave: `GOOGLE_API_KEY`)
- [x] **IMG-04**: Skill `flux-image` — geração via fal.ai FLUX (chave: `FAL_KEY`)
- [x] **IMG-05**: Skill `image-upscaling` — upscaling de imagem (chave: `FAL_KEY`)
- [x] **IMG-06**: Skill `background-removal` — remoção de fundo (chave: `FAL_KEY`)
- [x] **IMG-07**: Skill `p-image` — geração via ImagineArt/Prodia (chave: provedor específico)
- [x] **IMG-08**: Skill `qwen-image-2` — geração via Qwen (chave: provedor específico)
- [x] **IMG-09**: Skill `qwen-image-2-pro` — geração via Qwen Pro (chave: provedor específico)

### Skills — Vídeo (5+ skills)

- [x] **VID-01**: Skill `ai-video-generation` — geração de vídeo genérica
- [x] **VID-02**: Skill `google-veo` — geração de vídeo via Google Veo (chave: `GOOGLE_API_KEY`)
- [x] **VID-03**: Skill `image-to-video` — conversão de imagem para vídeo
- [x] **VID-04**: Skills de vídeo adicionais conforme disponíveis no Inference (Kling, Seedream, etc.)

### Skills — Áudio (10 skills)

- [x] **AUD-01**: Skill `elevenlabs-tts` — text-to-speech (chave: `ELEVENLABS_API_KEY`)
- [x] **AUD-02**: Skill `elevenlabs-stt` — speech-to-text (chave: `ELEVENLABS_API_KEY`)
- [x] **AUD-03**: Skill `elevenlabs-dialogue` — geração de diálogos (chave: `ELEVENLABS_API_KEY`)
- [x] **AUD-04**: Skill `elevenlabs-sound-effects` — efeitos sonoros (chave: `ELEVENLABS_API_KEY`)
- [x] **AUD-05**: Skill `elevenlabs-voice-cloner` — clonagem de voz (chave: `ELEVENLABS_API_KEY`)
- [x] **AUD-06**: Skill `elevenlabs-voice-changer` — alteração de voz (chave: `ELEVENLABS_API_KEY`)
- [x] **AUD-07**: Skill `elevenlabs-music` — geração de música (chave: `ELEVENLABS_API_KEY`)
- [x] **AUD-08**: Skill `elevenlabs-dubbing` — dublagem automática (chave: `ELEVENLABS_API_KEY`)
- [x] **AUD-09**: Skills de áudio adicionais conforme disponíveis no Inference
- [x] **AUD-10**: Todas as skills ElevenLabs usam `disable-model-invocation: true`

### Skills — LLM & Search

- [x] **LLM-01**: Skill `llm-models` — acesso a modelos LLM (Claude, Gemini, Kimi, GLM) com chaves respectivas
- [x] **SRCH-01**: Skill `web-search` — busca web via Tavily (chave: `TAVILY_API_KEY`) e/ou Exa (chave: `EXA_API_KEY`)

### Skills — Social

- [x] **SOC-01**: Skill `twitter-automation` — automação Twitter/X com `disable-model-invocation: true` (chave: requer OAuth v2)

### Skills — SDK

- [x] **SDK-01**: Skill `javascript-sdk` — guia/template para SDK JavaScript
- [x] **SDK-02**: Skill `python-sdk` — guia/template para SDK Python

### Skills — UI

- [ ] **UI-01**: Skill `agent-ui` — interface de agente
- [ ] **UI-02**: Skill `chat-ui` — interface de chat
- [ ] **UI-03**: Skill `tools-ui` — interface de ferramentas
- [ ] **UI-04**: Skill `widgets-ui` — widgets de interface

### Skills — Guides (20+ skills)

- [x] **GUIDE-01**: Skill `prompting-guide` — guia de prompting
- [x] **GUIDE-02**: Skill `design-guide` — guia de design
- [x] **GUIDE-03**: Skill `video-guide` — guia de vídeo
- [x] **GUIDE-04**: Skill `writing-guide` — guia de escrita
- [x] **GUIDE-05**: Skill `social-guide` — guia de mídias sociais
- [x] **GUIDE-06**: Skill `product-guide` — guia de produto
- [x] **GUIDE-07**: Demais guides conforme disponíveis no Inference

### Quality & Safety

- [x] **QUAL-01**: Todas as skills com side effects usam `disable-model-invocation: true`
- [x] **QUAL-02**: Todas as skills usam `allowed-tools: Bash(curl *)` em vez de `Bash(*)`
- [x] **QUAL-03**: Scripts curl usam flag `-f` e checam HTTP status code para erros claros
- [x] **QUAL-04**: Nenhuma API key hardcoded — todas vêm do `~/.claude/.env`
- [x] **QUAL-05**: Skills compatíveis com Claude Code >= 1.0.33
- [x] **QUAL-06**: Descrições de skills concisas (<100 chars) para não estourar budget de 16K chars

### Distribution

- [x] **DIST-01**: Repositório público no GitHub com estrutura de plugin válida
- [x] **DIST-02**: Suporte a `/plugin marketplace add` e `/plugin install` via GitHub
- [x] **DIST-03**: `marketplace.json` configurado em `.claude-plugin/`

## v2 Requirements

### Ecosystem

- **ECO-01**: Auto-update de skills quando o repositório é atualizado
- **ECO-02**: Smoke test automatizado para verificar conectividade com todos os provedores
- **ECO-03**: VERSIONS.md por skill rastreando versões das APIs dos provedores
- **ECO-04**: Script de migração para usuários vindos do Inference

### Community

- **COMM-01**: Contributing guide para adição de novas skills
- **COMM-02**: Template de SKILL.md para contribuidores
- **COMM-03**: CI/CD para validação de skills em PRs

## Out of Scope

| Feature | Reason |
|---------|--------|
| Proxy/gateway para APIs | Derrota o propósito do projeto (chamada direta) |
| Monetização/tiers pagos | Projeto 100% open source e gratuito |
| GUI/dashboard para gerenciar chaves | Fora do escopo de um plugin Claude Code — CLI e skill cobrem isso |
| Migração automática de installs do Inference | Risco de corromper configurações; guia no README é suficiente |
| Skills com modelos locais/offline | Contradiz arquitetura de chamada direta a APIs |
| Auto-install no primeiro uso do Claude | Viola princípio de menor privilégio |
| Armazenar chaves dentro do diretório do plugin | Risco de commit acidental de segredos |
| Skills para provedores sem API key pública | Requer proxy, que está fora de escopo |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| FOUND-06 | Phase 1 | Complete |
| SETUP-02 | Phase 1 | Complete |
| SETUP-03 | Phase 1 | Complete |
| QUAL-01 | Phase 1 | Complete |
| QUAL-02 | Phase 1 | Complete |
| QUAL-03 | Phase 2 | Complete |
| QUAL-04 | Phase 1 | Complete |
| QUAL-05 | Phase 1 | Complete |
| QUAL-06 | Phase 1 | Complete |
| DIST-01 | Phase 1 | Complete |
| DIST-02 | Phase 1 | Complete |
| DIST-03 | Phase 1 | Complete |
| IMG-01 | Phase 2 | Complete |
| AUD-01 | Phase 2 | Complete |
| LLM-01 | Phase 2 | Complete |
| SRCH-01 | Phase 2 | Complete |
| VID-02 | Phase 2 | Complete |
| IMG-02 | Phase 3 | Complete |
| IMG-03 | Phase 3 | Complete |
| IMG-04 | Phase 3 | Complete |
| IMG-05 | Phase 3 | Complete |
| IMG-06 | Phase 3 | Complete |
| IMG-07 | Phase 3 | Complete |
| IMG-08 | Phase 3 | Complete |
| IMG-09 | Phase 3 | Complete |
| GUIDE-01 | Phase 3 | Complete |
| GUIDE-02 | Phase 3 | Complete |
| GUIDE-03 | Phase 3 | Complete |
| GUIDE-04 | Phase 3 | Complete |
| GUIDE-05 | Phase 3 | Complete |
| GUIDE-06 | Phase 3 | Complete |
| GUIDE-07 | Phase 3 | Complete |
| AUD-02 | Phase 4 | Complete |
| AUD-03 | Phase 4 | Complete |
| AUD-04 | Phase 4 | Complete |
| AUD-05 | Phase 4 | Complete |
| AUD-06 | Phase 4 | Complete |
| AUD-07 | Phase 4 | Complete |
| AUD-08 | Phase 4 | Complete |
| AUD-09 | Phase 4 | Complete |
| AUD-10 | Phase 4 | Complete |
| VID-01 | Phase 4 | Complete |
| VID-03 | Phase 4 | Complete |
| VID-04 | Phase 4 | Complete |
| SOC-01 | Phase 5 | Complete |
| SDK-01 | Phase 5 | Complete |
| SDK-02 | Phase 5 | Complete |
| UI-01 | Phase 5 | Pending |
| UI-02 | Phase 5 | Pending |
| UI-03 | Phase 5 | Pending |
| UI-04 | Phase 5 | Pending |
| SETUP-01 | Phase 5 | Pending |
| SETUP-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 58 total (todos os IDs explícitos mapeados)
- Mapped to phases: 58
- Unmapped: 0

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after roadmap creation — traceability populated*
