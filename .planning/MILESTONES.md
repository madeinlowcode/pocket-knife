# Milestones

## v1.0 MVP (Shipped: 2026-03-27)

**Phases completed:** 5 phases, 14 plans, 23 tasks

**Key accomplishments:**

- Plugin scaffold with pocket-knife namespace, marketplace distribution, and 9-category skills directory structure ready for Phase 2+
- SessionStart hook that loads ~/.claude/.env securely via set -o allexport, with contract preventing key leakage
- commands/setup.md — conversational wizard skill for configuring ~/.claude/.env with hybrid key resolution
- Three validation skills established round-trip env loader -> curl -> API for distinct auth patterns: x-goog-api-key (Imagen 4), multi-provider LLM routing, and Tavily+Exa dual-provider search.
- Two validation skills shipped: ElevenLabs TTS with binary MP3 output (AUD-01) and Google Veo with Vertex AI async polling (VID-02)
- 3 image generation skills via fal.ai Pruna (async) and Alibaba DashScope Qwen (synchronous), introducing DASHSCOPE_API_KEY
- 7 guide skills created covering prompting, design, video, writing, social, product, and content — all zero-API-key reference documents with actionable frameworks
- Pattern 1 (JSON -> binary):
- 5 ElevenLabs audio skills with 4 distinct API patterns: multipart/JSON uploads, multipart/binary output, JSON/binary, and async 3-step dubbing with polling
- One-liner:
- 4 UI guide skills (agent-ui, chat-ui, tools-ui, widgets-ui) with provider-agnostic React/Next.js patterns for building AI interfaces
- ESM Node.js CLI with interactive category selection, per-provider key validation, and safe ~/.claude/.env merge

---
