# Pocket-Knife

## What This Is

Pocket-Knife é um projeto open source que oferece as mesmas 85+ skills do inference.sh, porém sem depender da plataforma paga da Inference. Em vez de usar o CLI `infsh` que cobra pelo uso das APIs, o usuário configura suas próprias API keys (Google, ElevenLabs, xAI, fal.ai, etc.) num arquivo `~/.claude/.env` centralizado. Cada skill chama diretamente a API do provedor usando as chaves do usuário. Distribuído via GitHub e marketplace de skills do Claude Code.

## Core Value

O usuário usa 85+ skills de IA (imagem, vídeo, áudio, LLM, web search) com suas próprias API keys, sem intermediário pago.

## Requirements

### Validated

- [x] Script loader centralizado que lê `~/.claude/.env` uma vez e disponibiliza as variáveis de ambiente para as skills
- [x] Skills de áudio ElevenLabs: elevenlabs-tts, elevenlabs-stt, elevenlabs-dialogue, elevenlabs-sound-effects, elevenlabs-voice-cloner, elevenlabs-voice-changer, elevenlabs-music, elevenlabs-dubbing, elevenlabs-voice-isolator (9 skills, AUD-02 a AUD-10)
- [x] Skills de vídeo fal.ai: ai-video-generation (Kling 1.6), image-to-video (Wan 2.2 5B), p-video (Seedance 1.0 Lite) + google-veo existente (VID-01, VID-03, VID-04)

### Active

- [ ] 85+ skills portadas do inference.sh, substituindo chamadas `infsh app run` por chamadas diretas às APIs dos provedores
- [ ] Skills de imagem: ai-image-generation, background-removal, flux-image, image-upscaling, nano-banana, nano-banana-2, p-image, qwen-image-2, qwen-image-2-pro
- [ ] Skills de LLM: llm-models (Claude, Gemini, Kimi, GLM)
- [ ] Skills de web search: web-search (Tavily, Exa)
- [ ] Skills de social: twitter-automation
- [ ] Skills de SDK: javascript-sdk, python-sdk
- [ ] Skills de UI: agent-ui, chat-ui, tools-ui, widgets-ui
- [ ] Skills de guias: todos os guides (prompting, design, video, writing, social, product)
- [ ] CLI de instalação (`npx pocket-knife init`) que cria `~/.claude/.env` interativamente, perguntando chaves conforme as skills que o usuário quer usar
- [ ] Skill de setup (`/pocket-knife:setup`) como alternativa conversacional dentro do Claude Code para configurar o `.env`
- [ ] Configuração como plugin do Claude Code (`.claude-plugin/plugin.json`)
- [ ] Hospedagem no GitHub com distribuição via marketplace de skills (Vercel/skills.sh)

### Out of Scope

- Criar um serviço proxy/gateway próprio — o objetivo é chamada direta às APIs dos provedores
- Cobrar pelo uso — projeto é 100% open source e gratuito
- Recriar a plataforma inference.sh — apenas as skills, não o backend
- Suporte a provedores que não têm API pública acessível com chave própria

## Context

- O projeto inference.sh (github.com/inference-sh/skills) tem licença MIT, permitindo uso livre do código das skills
- Cada skill do Inference é um único `SKILL.md` com frontmatter (`name`, `description`, `allowed-tools`) + instruções em markdown
- O padrão atual do Inference é: `infsh app run [provider/model] --input '{...}'` — nosso trabalho é substituir isso por chamadas diretas via `curl`, SDKs nativos ou scripts bash
- O arquivo `~/.claude/.env` não conflita com `.env` de projetos locais por estar em diretório global diferente
- Provedores principais: Google (Gemini), ElevenLabs, xAI (Grok), ByteDance (Seedream), fal.ai (FLUX, Reve), Tavily, Exa
- A estrutura de diretórios do Inference segue: `tools/[categoria]/[skill-name]/SKILL.md`
- O plugin se registra via `.claude-plugin/plugin.json` com metadados e lista de skills

## Constraints

- **Licença**: Manter MIT para ser compatível com o projeto original
- **Compatibilidade**: Skills devem funcionar no Claude Code como plugin (mesma experiência de uso)
- **Segurança**: API keys ficam em `~/.claude/.env` (fora de repositórios) — nunca commitadas
- **Dependências**: Minimizar dependências externas — preferir `curl`/bash nativo quando possível
- **Provedores**: Limitado a provedores que oferecem API pública com autenticação por API key

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Usar `~/.claude/.env` para chaves | Centralizado, fora de repos, não conflita com `.env` de projetos | ✓ Validated in Phase 1 — hooks/hooks.json + scripts/load-env.sh implementam |
| Script loader executado uma vez via SessionStart | Evita leitura repetida do `.env` em cada skill | ✓ Validated in Phase 1 — SessionStart hook executa load-env.sh uma vez por sessão |
| Chamadas diretas às APIs (sem proxy) | Elimina intermediário, custo direto ao provedor, sem vendor lock-in | ✓ Validated in Phase 2 — 5 skills com curl direto funcionando |
| CLI + Skill de setup (duas abordagens) | CLI para devs técnicos, skill para leigos — momentos diferentes de uso | ✓ Validated in Phase 1 — commands/setup.md implementa skill conversacional |
| Manter estrutura de diretórios do Inference | Facilita portabilidade e comparação com o original | ✓ Validated in Phase 1 — skills/{image,audio,video,llm,search,social,sdk,ui,guides}/ |
| Security contract: sem set -x, sem echo de valores | Previne vazamento de API keys em logs/stderr | ✓ Validated in Phase 1 — SECURITY CONTRACT em load-env.sh |
| disable-model-invocation para skills com side-effects | QUAL-01: evita invocação automática de skills que modificam estado | ✓ Validated in Phase 1 — setup.md usa disable-model-invocation |
| QUAL-03 error handling com `curl -f` + exit code case | Garante mensagens human-readable em vez de JSON dump | ✓ Validated in Phase 2 — todos os 5 skills de validação usam |
| Binary output pattern: curl -f --output + [ ! -s ] check | Verifica integridade de arquivos binários (MP3, imagens) | ✓ Validated in Phase 2 — elevenlabs-tts estabelece padrão |
| Async polling pattern: MAX_ATTEMPTS + operation_name loop | Jobs assíncronos aguardam conclusão antes de entregar resultado | ✓ Validated in Phase 2 — google-veo estabelece padrão |
| fal.ai async polling: POST /fal-ai/... → queue_id → GET /requests/{id} | Skills de imagem (flux, upscaling, background-removal) aguardam job via polling | ✓ Validated in Phase 3 — nano-banana-2, flux-image, image-upscaling, background-removal |
| DashScope Bearer auth: Authorization: Bearer + DashScope API | Autenticação para modelos qwen (Alibaba) via Bearer token | ✓ Validated in Phase 3 — qwen-image-2, qwen-image-2-pro |
| Guide skills: allowed-tools: [] (sem curl), sem API key | Guides são documentos puros de referência, zero side-effects | ✓ Validated in Phase 3 — 7 guides (prompting, design, video, writing, social, product, content) |
| Skill content < 300 linhas | Conteúdo extenso em reference docs para evitar budget overflow | ✓ Validated in Phase 3 — todos os 15 SKILL.md < 300 linhas |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-26 after Phase 3 completion*
