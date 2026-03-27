# Pocket-Knife

## What This Is

Pocket-Knife é um plugin open source para Claude Code com 38 skills de IA (imagem, vídeo, áudio, LLM, web search, social, UI, SDK, guides) portadas do inference.sh. O usuário configura suas próprias API keys (Google, ElevenLabs, fal.ai, DashScope, Tavily, Exa, X/Twitter) em `~/.claude/.env` e cada skill chama diretamente a API do provedor via curl — sem intermediário pago. Inclui CLI interativa (`npx pocket-knife init`) e skill de setup conversacional.

## Core Value

O usuário usa 85+ skills de IA (imagem, vídeo, áudio, LLM, web search) com suas próprias API keys, sem intermediário pago.

## Requirements

### Validated

- [x] Script loader centralizado que lê `~/.claude/.env` uma vez e disponibiliza as variáveis de ambiente para as skills
- [x] Skills de áudio ElevenLabs: elevenlabs-tts, elevenlabs-stt, elevenlabs-dialogue, elevenlabs-sound-effects, elevenlabs-voice-cloner, elevenlabs-voice-changer, elevenlabs-music, elevenlabs-dubbing, elevenlabs-voice-isolator (9 skills, AUD-02 a AUD-10)
- [x] Skills de vídeo fal.ai: ai-video-generation (Kling 1.6), image-to-video (Wan 2.2 5B), p-video (Seedance 1.0 Lite) + google-veo existente (VID-01, VID-03, VID-04)
- [x] Skills de social: twitter-automation (OAuth 1.0a + Node.js helper)
- [x] Skills de SDK: javascript-sdk e python-sdk (guias puros, allowed-tools: [])
- [x] Skills de UI: agent-ui, chat-ui, tools-ui, widgets-ui (guias puros, allowed-tools: [])
- [x] CLI de instalação (`npx pocket-knife init`) — cli/package.json, bin/init.js, lib/prompts.js, lib/validate.js, lib/env-writer.js, lib/categories.json
- [x] Skill de setup (`/pocket-knife:setup`) — commands/setup.md com disable-model-invocation: true
- [x] Plugin do Claude Code — .claude-plugin/plugin.json com marketplace.json
- [x] Skills de imagem: ai-image-generation, background-removal, flux-image, image-upscaling, nano-banana, nano-banana-2, p-image, qwen-image-2, qwen-image-2-pro
- [x] Skills de LLM: llm-models (Claude, Gemini, Kimi, GLM)
- [x] Skills de web search: web-search (Tavily, Exa)
- [x] Skills de guias: prompting-guide, design-guide, video-guide, writing-guide, social-guide, product-guide, content-guide

### Active

- [ ] Todas as 85+ skills validadas e testadas com API keys reais (validação manual via smoke tests)
- [ ] Hospedagem no GitHub com distribuição via marketplace de skills (Vercel/skills.sh)

### Out of Scope

- Criar um serviço proxy/gateway próprio — o objetivo é chamada direta às APIs dos provedores
- Cobrar pelo uso — projeto é 100% open source e gratuito
- Recriar a plataforma inference.sh — apenas as skills, não o backend
- Suporte a provedores que não têm API pública acessível com chave própria

## Current State (v1.0 shipped 2026-03-27)

- 38 SKILL.md files across 9 categories (image, audio, video, llm, search, social, sdk, ui, guides)
- 6,417 LOC (markdown + bash + JS), 104 files, 73 commits
- 7 provedores: Google (Gemini/Imagen/Veo), ElevenLabs (9 skills), fal.ai (FLUX/Kling/Wan/Seedance), DashScope (Qwen), Tavily, Exa, X/Twitter
- CLI: `npx pocket-knife init` (ESM Node.js, @inquirer/prompts, chalk, dotenv, fs-extra)
- Plugin: `.claude-plugin/plugin.json` com namespace `pocket-knife`, SessionStart hook para env loading
- Licença MIT, compatível com inference.sh original

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
*Last updated: 2026-03-27 after v1.0 milestone*
