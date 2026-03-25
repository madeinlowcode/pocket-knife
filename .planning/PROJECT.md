# Pocket-Knife

## What This Is

Pocket-Knife é um projeto open source que oferece as mesmas 85+ skills do inference.sh, porém sem depender da plataforma paga da Inference. Em vez de usar o CLI `infsh` que cobra pelo uso das APIs, o usuário configura suas próprias API keys (Google, ElevenLabs, xAI, fal.ai, etc.) num arquivo `~/.claude/.env` centralizado. Cada skill chama diretamente a API do provedor usando as chaves do usuário. Distribuído via GitHub e marketplace de skills do Claude Code.

## Core Value

O usuário usa 85+ skills de IA (imagem, vídeo, áudio, LLM, web search) com suas próprias API keys, sem intermediário pago.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Script loader centralizado que lê `~/.claude/.env` uma vez e disponibiliza as variáveis de ambiente para as skills
- [ ] 85+ skills portadas do inference.sh, substituindo chamadas `infsh app run` por chamadas diretas às APIs dos provedores
- [ ] Skills de imagem: ai-image-generation, background-removal, flux-image, image-upscaling, nano-banana, nano-banana-2, p-image, qwen-image-2, qwen-image-2-pro
- [ ] Skills de vídeo: ai-video-generation, google-veo, image-to-video + demais modelos de vídeo
- [ ] Skills de áudio: elevenlabs-tts, elevenlabs-stt, elevenlabs-dialogue, elevenlabs-sound-effects, elevenlabs-voice-cloner, elevenlabs-voice-changer, elevenlabs-music, elevenlabs-dubbing
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
| Usar `~/.claude/.env` para chaves | Centralizado, fora de repos, não conflita com `.env` de projetos | — Pending |
| Script loader executado uma vez | Evita leitura repetida do `.env` em cada skill | — Pending |
| Chamadas diretas às APIs (sem proxy) | Elimina intermediário, custo direto ao provedor, sem vendor lock-in | — Pending |
| CLI + Skill de setup (duas abordagens) | CLI para devs técnicos, skill para leigos — momentos diferentes de uso | — Pending |
| Manter estrutura de diretórios do Inference | Facilita portabilidade e comparação com o original | — Pending |

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
*Last updated: 2026-03-25 after initialization*
