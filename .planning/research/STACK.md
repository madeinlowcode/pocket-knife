# Stack Research

**Domain:** Claude Code skills plugin — open-source replacement for inference.sh proxy
**Researched:** 2026-03-25
**Confidence:** HIGH (verified against official Claude Code docs and agentskills.io spec)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| SKILL.md (Agent Skills spec) | agentskills.io open standard | Skill definition format | Official open standard adopted by Anthropic, OpenAI Codex, OpenCode, Cursor and 40+ agents; Claude Code's native format since late 2025 |
| YAML frontmatter | — | Skill metadata (name, description, allowed-tools) | Required by the Agent Skills spec; parsed by all compliant agents |
| Bash (sh-compatible) | POSIX sh + bash 4+ | API call implementation inside skills | Claude Code's `Bash` tool executes bash; no extra runtime needed; `curl` is universally available |
| curl | system-bundled (7.x+) | HTTP calls to provider APIs | Zero dependency — ships on every macOS/Linux/WSL target; sufficient for all REST + multipart providers in scope |
| plugin.json manifest | Claude Code 1.0.33+ | Plugin identity and distribution | Required to register as a Claude Code plugin; enables `/plugin install` and marketplace distribution |
| marketplace.json | Claude Code 1.0.33+ | Listing and distribution catalog | Required to publish to skills.sh / any Claude Code marketplace |

### Supporting Libraries (CLI Installer only)

These are needed only for the `npx pocket-knife init` installer — not for the skills themselves.

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @inquirer/prompts | ^7.x (latest stable) | Interactive prompts for API key collection | Preferred over legacy `inquirer` — modular, ESM-native, actively maintained by same author |
| chalk | ^5.x | Terminal color output in CLI | ESM-only since v5; matches modern Node.js ESM projects |
| dotenv | ^16.x | Read/write `.env` files | For the setup CLI to read existing `~/.claude/.env` before appending new keys |
| fs-extra | ^11.x | Reliable file/dir creation with mkdirp | Handles `~/.claude/` directory creation cross-platform without extra checks |
| Node.js | 18+ (22 LTS recommended) | CLI runtime for `npx pocket-knife init` | Claude Code itself requires Node 18+; targeting 22 LTS gives 12% faster startup |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| skills-ref (agentskills CLI) | Validate SKILL.md frontmatter | `npx skills-ref validate ./my-skill`; catches name/description schema violations early |
| `claude --plugin-dir ./pocket-knife` | Local plugin testing | Loads plugin without installing; use during development |
| `/reload-plugins` (in-session) | Live-reload after SKILL.md edits | No restart needed; edit and reload in same session |
| `claude plugin validate .` | Validate plugin.json + all frontmatter | Catches JSON/YAML errors before publishing |
| npx skills | Install/distribute via skills.sh | `npx skills add your-org/pocket-knife` — the community standard for skill collection install |
| git + GitHub | Version control + marketplace source | marketplace.json uses `"source": "github"` pointing to the repo |

---

## Installation

```bash
# Skills themselves have no dependencies — no npm install needed.
# The only install is for the npx CLI setup tool:

# Core CLI dependencies (in /cli sub-package):
npm install @inquirer/prompts chalk dotenv fs-extra

# Dev dependencies for CLI:
npm install -D @types/node typescript

# Validation tool (no install, run ad-hoc):
npx skills-ref validate ./skills/elevenlabs-tts
npx claude plugin validate .
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| curl (bash) | Python `requests` or Node.js `fetch` | Only if a provider lacks a REST API and requires an official SDK with complex auth flows (not the case for any provider in scope) |
| @inquirer/prompts | `enquirer` | Either is fine; inquirer has larger ecosystem and is officially recommended in Vercel's skills CLI tooling |
| Bash scripts in `scripts/` | Python scripts | Python if a skill needs binary data manipulation (e.g., audio file conversion); otherwise bash is simpler |
| plugin.json + marketplace.json | Standalone `.claude/skills/` only | Use standalone-only if skipping marketplace distribution; loses `/plugin install` capability |
| `npx skills add` (community) | manual `git clone` | Manual clone for users who distrust npx; both should be documented |
| dotenv (Node.js) | Python `python-dotenv` | Python only if you build a Python CLI; stick to Node.js for ecosystem consistency with the skills package |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `infsh app run` calls | Defeats the entire purpose; requires paid inference.sh subscription | Direct `curl` calls to provider REST APIs |
| Any proxy or gateway layer | Out of scope by design; adds latency and cost, removes user key ownership | Direct API calls from skill scripts |
| Project-level `.env` (e.g., `./project/.env`) | Conflicts with project dotenv; leaks keys into git repos | `~/.claude/.env` (global, gitignored by design) |
| Hardcoding API keys in SKILL.md | Massive security risk; skills live in git repos | Read from `~/.claude/.env` via bash `source` or `export $(cat ~/.claude/.env)` |
| `inquirer` (legacy, pre-v9) | Unmaintained CJS-only package; replaced by `@inquirer/prompts` | `@inquirer/prompts` ^7.x |
| NPM-published `.env` files | Any `.env` in a published package exposes keys | .gitignore + .npmignore everything under `~/.claude/` |
| `context: fork` + `agent: general-purpose` for API calls | Unnecessary subagent overhead for simple curl calls | Inline Bash tool with `allowed-tools: Bash` |
| commands/ directory (legacy) | Deprecated in favor of `skills/` with SKILL.md; still works but misses advanced features | `skills/<name>/SKILL.md` structure |

---

## Stack Patterns by Variant

**If a skill only calls a REST API (most skills — Gemini, xAI, Tavily, Exa, fal.ai):**
- Use a `scripts/call.sh` bash script that sources `~/.claude/.env` and calls `curl`
- `allowed-tools: Bash` in frontmatter
- No npm install, no runtime dependency
- Because: zero overhead, universally available, easiest to audit and fork

**If a skill receives binary output (ElevenLabs TTS audio, image generation):**
- Add `--output "$HOME/Downloads/output.mp3"` to the curl call
- Instruct Claude to report the output path
- Because: Claude's Bash tool can run curl with file output; no SDK needed

**If a skill needs multipart/form-data (file upload for STT, image editing):**
- Use `curl -F "file=@$filepath"` pattern
- Because: curl handles multipart natively; no library needed

**If the CLI installer needs to write `~/.claude/.env`:**
- Use Node.js `fs.appendFileSync` + `os.homedir()` pattern
- Do NOT use shell `echo >>` (platform quoting issues on Windows/WSL)
- Because: the installer runs on Node.js where fs is reliable cross-platform

**If distributing via marketplace:**
- Create `.claude-plugin/marketplace.json` at repo root with `"source": "github"` entries
- Keep all plugins in `plugins/<skill-name>/` subdirectories
- Because: enables `claude plugin install pocket-knife@marketplace-name` one-liner

---

## Authentication Patterns by Provider

These are the patterns skills use to authenticate. All keys come from `~/.claude/.env`.

| Provider | Env Var | Header Pattern | Endpoint Base |
|----------|---------|----------------|---------------|
| Google Gemini | `GOOGLE_API_KEY` | `?key=${GOOGLE_API_KEY}` (query param) or `x-goog-api-key:` header | `https://generativelanguage.googleapis.com/v1beta/` |
| ElevenLabs | `ELEVENLABS_API_KEY` | `xi-api-key: ${ELEVENLABS_API_KEY}` | `https://api.elevenlabs.io/v1/` |
| fal.ai | `FAL_KEY` | `Authorization: Key ${FAL_KEY}` | `https://fal.run/` |
| xAI (Grok) | `XAI_API_KEY` | `Authorization: Bearer ${XAI_API_KEY}` | `https://api.x.ai/v1/` |
| Tavily | `TAVILY_API_KEY` | `Authorization: Bearer ${TAVILY_API_KEY}` | `https://api.tavily.com/` |
| Exa | `EXA_API_KEY` | `x-api-key: ${EXA_API_KEY}` | `https://api.exa.ai/` |

---

## Plugin Structure (canonical layout for this project)

```
pocket-knife/
├── .claude-plugin/
│   ├── plugin.json           # Plugin identity (name, version, description)
│   └── marketplace.json      # Marketplace catalog pointing to ./plugins/*
├── skills/
│   ├── elevenlabs-tts/
│   │   ├── SKILL.md          # Frontmatter + instructions
│   │   └── scripts/
│   │       └── call.sh       # curl wrapper sourcing ~/.claude/.env
│   ├── gemini-generate/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── call.sh
│   └── ...                   # One directory per skill
├── cli/
│   ├── package.json          # npx pocket-knife init entry point
│   ├── index.js              # Interactive setup using @inquirer/prompts
│   └── ...
├── scripts/
│   └── load-env.sh           # Shared env loader: source ~/.claude/.env
└── README.md
```

---

## SKILL.md Frontmatter Reference (confirmed fields)

```yaml
---
name: elevenlabs-tts              # kebab-case, max 64 chars, matches directory name
description: >                    # max 1024 chars; keyword-rich for auto-invocation
  Converts text to speech using ElevenLabs. Use when the user wants audio,
  voice synthesis, TTS, or to hear text read aloud.
allowed-tools: Bash               # pre-approved tools — no per-call permission dialog
disable-model-invocation: false   # true = only /slash invocation, no auto-trigger
compatibility: Requires ElevenLabs API key in ~/.claude/.env as ELEVENLABS_API_KEY
license: MIT
metadata:
  author: pocket-knife
  version: "1.0"
---
```

Source: [agentskills.io specification](https://agentskills.io/specification) (HIGH confidence — official spec)
Source: [Claude Code skills docs](https://code.claude.com/docs/en/skills) (HIGH confidence — official docs)

---

## Version Compatibility

| Component | Compatible With | Notes |
|-----------|-----------------|-------|
| Claude Code 1.0.33+ | plugin.json, `/plugin install` | Minimum version for plugin system; check with `claude --version` |
| Agent Skills spec (agentskills.io) | Claude Code, OpenCode, Codex CLI, Cursor, 40+ agents | Open standard; SKILL.md format is cross-agent |
| Node.js 18+ | `npx pocket-knife init` CLI | Required by Claude Code itself; 22 LTS recommended |
| @inquirer/prompts ^7 | Node.js 18+ | ESM-only; incompatible with CJS-only Node.js setups |
| chalk ^5 | Node.js 18+ (ESM) | ESM-only since v5; do not use v4 in an ESM package |
| dotenv ^16 | Node.js 18+ | v16 is the current stable; supports `DOTENV_KEY` encryption |

---

## Sources

- [agentskills.io/specification](https://agentskills.io/specification) — SKILL.md format, frontmatter fields, directory structure (HIGH confidence — official open standard spec)
- [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) — SKILL.md frontmatter reference, all fields, invocation control, dynamic context (HIGH confidence — official Anthropic docs)
- [code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins) — plugin.json schema, plugin directory structure, `--plugin-dir` flag (HIGH confidence — official Anthropic docs)
- [code.claude.com/docs/en/plugins-reference](https://code.claude.com/docs/en/plugins-reference) — complete plugin manifest schema, environment variables, caching behavior (HIGH confidence — official Anthropic docs)
- [code.claude.com/docs/en/plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) — marketplace.json format, GitHub distribution, npm distribution (HIGH confidence — official Anthropic docs)
- [github.com/vercel-labs/skills](https://github.com/vercel-labs/skills) — `npx skills add` CLI, skills.sh marketplace, install paths (MEDIUM confidence — official Vercel tooling, verified via fetch)
- [ai.google.dev/gemini-api/docs/api-key](https://ai.google.dev/gemini-api/docs/api-key) — Gemini API key pattern and endpoint (HIGH confidence — official Google docs)
- [elevenlabs.io/docs/api-reference/authentication](https://elevenlabs.io/docs/api-reference/authentication) — ElevenLabs xi-api-key header pattern (HIGH confidence — official docs)
- [docs.fal.ai/model-apis/quickstart](https://docs.fal.ai/model-apis/quickstart) — fal.ai `Authorization: Key` pattern, FAL_KEY env var (HIGH confidence — official docs)
- [docs.x.ai/docs/tutorial](https://docs.x.ai/docs/tutorial) — xAI Bearer auth, XAI_API_KEY, endpoint base URL (HIGH confidence — official xAI docs)
- [docs.tavily.com/documentation/api-reference/endpoint/search](https://docs.tavily.com/documentation/api-reference/endpoint/search) — Tavily Bearer auth pattern (HIGH confidence — official docs)
- [exa.ai/docs/reference/search-api-guide](https://exa.ai/docs/reference/search-api-guide) — Exa x-api-key header pattern (HIGH confidence — official docs)
- [npmjs.com/@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts) — modern inquirer, v7 current, ESM-native (HIGH confidence — npm registry)

---

*Stack research for: Claude Code skills plugin replacing inference.sh proxy*
*Researched: 2026-03-25*
