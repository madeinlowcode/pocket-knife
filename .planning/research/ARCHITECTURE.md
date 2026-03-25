# Architecture Research

**Domain:** Claude Code Skills Plugin (open-source, direct-API)
**Researched:** 2026-03-25
**Confidence:** HIGH (sourced from official Claude Code docs + verified inference-sh repo structure)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DISTRIBUTION LAYER                               │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────────┐    │
│  │  GitHub Repo  │  │  npx pocket-knife│  │  /plugin install   │    │
│  │  (source)     │  │  init (CLI)      │  │  (marketplace)     │    │
│  └──────┬───────┘  └────────┬─────────┘  └─────────┬──────────┘    │
└─────────┼──────────────────┼─────────────────────────┼──────────────┘
          │                  │                         │
┌─────────▼──────────────────▼─────────────────────────▼──────────────┐
│                     PLUGIN PACKAGE                                    │
│                                                                       │
│  pocket-knife/                                                        │
│  ├── .claude-plugin/plugin.json    ← Plugin manifest (metadata)      │
│  ├── skills/                       ← 85+ skill directories           │
│  │   ├── [category]/[skill]/SKILL.md                                 │
│  │   └── ...                                                         │
│  ├── hooks/hooks.json              ← SessionStart env loader hook    │
│  ├── scripts/load-env.sh           ← ~/.claude/.env loader           │
│  └── commands/pocket-knife:setup   ← Setup wizard command            │
│                                                                       │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │  (installed to ~/.claude/plugins/)
┌──────────────────────────────────▼──────────────────────────────────┐
│                    CLAUDE CODE RUNTIME                                │
│                                                                       │
│  SessionStart hook fires → scripts/load-env.sh runs                 │
│  ↓                                                                    │
│  ~/.claude/.env variables become available as $ENV_VARs              │
│  ↓                                                                    │
│  Skill descriptions loaded into context                               │
│  ↓                                                                    │
│  User invokes /pocket-knife:[skill] or Claude auto-invokes           │
│  ↓                                                                    │
│  SKILL.md body executes → Bash tool calls provider API via curl      │
│                                                                       │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│                   EXTERNAL PROVIDERS (direct API)                     │
│  ┌──────────┐ ┌───────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐ │
│  │ Google   │ │ElevenLabs │ │  xAI   │ │ fal.ai │ │ Tavily/Exa   │ │
│  │ (Gemini) │ │ (audio)   │ │ (Grok) │ │(FLUX)  │ │ (web search) │ │
│  └──────────┘ └───────────┘ └────────┘ └────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `plugin.json` | Plugin identity, namespace (`pocket-knife`), version, metadata | JSON file at `.claude-plugin/plugin.json` |
| `hooks/hooks.json` | SessionStart hook that sources `~/.claude/.env` before any skill runs | JSON hook config pointing to `scripts/load-env.sh` |
| `scripts/load-env.sh` | Read `~/.claude/.env` once per session, export all key=value pairs as env vars | Bash script; runs via hook command |
| `skills/[cat]/[name]/SKILL.md` | One skill per directory — frontmatter metadata + markdown instructions for Claude | SKILL.md with YAML frontmatter |
| `commands/pocket-knife:setup` | Conversational setup wizard inside Claude Code to create/update `~/.claude/.env` | Markdown command (slash command) |
| `npx pocket-knife init` | Interactive terminal CLI to scaffold `~/.claude/.env` by asking which providers the user wants | Node.js CLI via `bin/` entry in `package.json` |
| `~/.claude/.env` | Central API key store, outside any repo, never committed | Plain text key=value file on user's machine |

## Recommended Project Structure

```
pocket-knife/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest (name, version, description, author, license)
│
├── skills/                      # 85+ skill directories, organized by category
│   ├── image/
│   │   ├── ai-image-generation/
│   │   │   └── SKILL.md
│   │   ├── flux-image/
│   │   │   └── SKILL.md
│   │   ├── background-removal/
│   │   │   └── SKILL.md
│   │   ├── image-upscaling/
│   │   │   └── SKILL.md
│   │   ├── nano-banana/
│   │   │   └── SKILL.md
│   │   ├── nano-banana-2/
│   │   │   └── SKILL.md
│   │   ├── p-image/
│   │   │   └── SKILL.md
│   │   ├── qwen-image-2/
│   │   │   └── SKILL.md
│   │   └── qwen-image-2-pro/
│   │       └── SKILL.md
│   ├── video/
│   │   ├── ai-video-generation/
│   │   │   └── SKILL.md
│   │   ├── google-veo/
│   │   │   └── SKILL.md
│   │   └── image-to-video/
│   │       └── SKILL.md
│   ├── audio/
│   │   ├── elevenlabs-tts/
│   │   │   └── SKILL.md
│   │   ├── elevenlabs-stt/
│   │   │   └── SKILL.md
│   │   ├── elevenlabs-dialogue/
│   │   │   └── SKILL.md
│   │   ├── elevenlabs-sound-effects/
│   │   │   └── SKILL.md
│   │   ├── elevenlabs-voice-cloner/
│   │   │   └── SKILL.md
│   │   ├── elevenlabs-voice-changer/
│   │   │   └── SKILL.md
│   │   ├── elevenlabs-music/
│   │   │   └── SKILL.md
│   │   └── elevenlabs-dubbing/
│   │       └── SKILL.md
│   ├── llm/
│   │   └── llm-models/
│   │       └── SKILL.md
│   ├── search/
│   │   └── web-search/
│   │       └── SKILL.md
│   ├── social/
│   │   └── twitter-automation/
│   │       └── SKILL.md
│   ├── sdk/
│   │   ├── javascript-sdk/
│   │   │   └── SKILL.md
│   │   └── python-sdk/
│   │       └── SKILL.md
│   ├── ui/
│   │   ├── agent-ui/
│   │   │   └── SKILL.md
│   │   ├── chat-ui/
│   │   │   └── SKILL.md
│   │   ├── tools-ui/
│   │   │   └── SKILL.md
│   │   └── widgets-ui/
│   │       └── SKILL.md
│   └── guides/
│       ├── prompting-guide/
│       │   └── SKILL.md
│       ├── design-guide/
│       │   └── SKILL.md
│       └── ...
│
├── hooks/
│   └── hooks.json               # SessionStart hook → runs load-env.sh
│
├── scripts/
│   └── load-env.sh              # Sources ~/.claude/.env into shell env
│
├── commands/
│   └── setup.md                 # /pocket-knife:setup conversational wizard
│
├── bin/
│   └── pocket-knife.js          # npx pocket-knife init entry point
│
├── package.json                 # npm package for npx CLI distribution
├── README.md
└── LICENSE                      # MIT
```

### Structure Rationale

- **`skills/` at plugin root (not inside `.claude-plugin/`):** Required by Claude Code — only `plugin.json` goes in `.claude-plugin/`. Everything else lives at plugin root.
- **Category subdirectories inside `skills/`:** Mirrors inference-sh's `tools/[category]/[skill-name]/` structure, easing port work and allowing maintainers to compare diffs.
- **`hooks/hooks.json` + `scripts/load-env.sh`:** The only way to inject env vars before any skill runs is via a SessionStart hook. A separate script keeps hook JSON clean.
- **`commands/setup.md`:** Slash commands (`.md` in `commands/`) are simpler than skills for a guided wizard — no `SKILL.md` directory nesting needed.
- **`bin/pocket-knife.js` + `package.json`:** Enables `npx pocket-knife init` without a global install. The CLI is purely a setup helper; it writes to `~/.claude/.env` and is not part of the runtime plugin.

## Architectural Patterns

### Pattern 1: SessionStart Hook as Env Loader

**What:** A `hooks/hooks.json` entry on the `SessionStart` event runs `scripts/load-env.sh`, which reads `~/.claude/.env` and exports all key=value pairs into the shell environment. From that point, every `Bash(curl *)` call inside any skill can reference `$FAL_API_KEY`, `$ELEVENLABS_API_KEY`, etc.

**When to use:** The only approach that makes env vars available to all 85+ skills without each skill re-sourcing the file. Runs once per Claude Code session.

**Trade-offs:** + Single source of truth, no per-skill boilerplate. - Requires hook setup; `load-env.sh` must be executable (`chmod +x`). Variable scoping is shell-level, so Claude cannot read key values — only bash subprocesses can.

**Example:**

```json
// hooks/hooks.json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/load-env.sh"
          }
        ]
      }
    ]
  }
}
```

```bash
#!/usr/bin/env bash
# scripts/load-env.sh
ENV_FILE="$HOME/.claude/.env"
if [ -f "$ENV_FILE" ]; then
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
fi
```

### Pattern 2: SKILL.md Direct-API Replacement

**What:** Each SKILL.md replaces `infsh app run [provider/model] --input '{...}'` with a direct `curl` call to the provider's REST API, using env vars for authentication. Claude reads the SKILL.md instructions and constructs the curl command with user-provided parameters.

**When to use:** Every skill port follows this pattern. The `allowed-tools: Bash(curl *)` frontmatter restricts Claude to only use curl (and no other tools) when this skill is active.

**Trade-offs:** + No intermediary, no vendor lock-in, cost goes straight to user's provider account. - Each skill maintainer must track provider API changes independently. Providers with binary-only SDKs (no REST) cannot be supported.

**Example (elevenlabs-tts):**

```yaml
---
name: elevenlabs-tts
description: |
  Generate speech audio using ElevenLabs. 22+ voices, 32 languages.
  Use for: narration, character voices, accessibility audio.
  Requires: ELEVENLABS_API_KEY in ~/.claude/.env
allowed-tools: Bash(curl *)
---

Generate audio using the ElevenLabs API.

Available voices: aria, roger, sarah, laura, charlie, george, callum, river, liam...

To generate speech, run:
```bash
curl -s -X POST "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "$ARGUMENTS", "model_id": "eleven_multilingual_v2"}' \
  --output output.mp3
```
```

### Pattern 3: CLI Init as Setup Wizard (Separate from Plugin)

**What:** `npx pocket-knife init` is a standalone Node.js CLI that is distributed via npm but is NOT part of the Claude Code plugin itself. It asks the user which provider categories they want, then prompts only for those API keys, writes `~/.claude/.env`, and prints instructions for installing the plugin.

**When to use:** First-time setup. The CLI runs outside Claude Code, in a regular terminal.

**Trade-offs:** + Friendly onboarding for non-technical users. Separating CLI from plugin avoids mixing Node.js runtime concerns into the bash/markdown skill layer. - Two distribution artifacts to maintain (plugin on GitHub + package on npm).

**Example package.json fragment:**

```json
{
  "name": "pocket-knife",
  "bin": {
    "pocket-knife": "./bin/pocket-knife.js"
  },
  "scripts": {},
  "dependencies": {}
}
```

### Pattern 4: /pocket-knife:setup as In-Session Wizard

**What:** A `commands/setup.md` file creates the `/pocket-knife:setup` slash command. When invoked inside Claude Code, Claude guides the user conversationally through setting up `~/.claude/.env` — asking which skills they want and writing the file using the Write tool.

**When to use:** Users already inside Claude Code who skipped the CLI, or want to update their API keys without leaving the editor.

**Trade-offs:** + Zero extra tooling required, works inside the same session. - Claude Code must have Write permission to `~/.claude/.env`; the user sees a permission prompt.

## Data Flow

### Session Startup Flow

```
Claude Code starts
    ↓
SessionStart event fires
    ↓
hooks/hooks.json triggers → ${CLAUDE_PLUGIN_ROOT}/scripts/load-env.sh
    ↓
load-env.sh reads ~/.claude/.env
    ↓
Variables exported to shell environment
  (GOOGLE_API_KEY, ELEVENLABS_API_KEY, FAL_API_KEY, XAI_API_KEY, ...)
    ↓
Claude Code session is ready
    ↓
Skill descriptions loaded into context window
```

### Skill Invocation Flow

```
User: "/pocket-knife:elevenlabs-tts Make me say hello"
    ↓
Claude Code loads skills/audio/elevenlabs-tts/SKILL.md into context
    ↓
Claude reads instructions + constructs curl command with $ARGUMENTS = "Make me say hello"
    ↓
Bash(curl ...) executes with $ELEVENLABS_API_KEY already in shell env
    ↓
HTTP POST → api.elevenlabs.io/v1/text-to-speech
    ↓
Provider returns audio binary → saved to output.mp3
    ↓
Claude reports result to user
```

### First-Time Setup Flow (CLI path)

```
User runs: npx pocket-knife init
    ↓
CLI prompts: "Which categories do you want? [image/video/audio/llm/search]"
    ↓
For each selected category → prompt for required API key(s)
    ↓
Write ~/.claude/.env with collected keys
    ↓
Print: "Now install the plugin with: claude plugin install pocket-knife@[marketplace]"
```

### First-Time Setup Flow (in-session path)

```
User runs: /pocket-knife:setup
    ↓
commands/setup.md loaded into context
    ↓
Claude asks: which skills do you want to use?
    ↓
Claude asks for each required API key interactively
    ↓
Claude uses Write tool to create/update ~/.claude/.env
    ↓
Claude suggests /reload-plugins to activate
```

### Key Data Flows

1. **API keys:** Written once to `~/.claude/.env` → sourced by `load-env.sh` on SessionStart → available as shell env vars to every `Bash(curl *)` call throughout the session.
2. **Skill instructions:** Stored as markdown in `SKILL.md` → descriptions always in context window → full skill content loaded only when invoked (or by Claude's relevance detection).
3. **User arguments:** Passed via `$ARGUMENTS` substitution in SKILL.md body → replace placeholder before Claude sees the content → forwarded to curl commands.

## Scaling Considerations

This is a local developer tool installed per-user — traditional scaling dimensions do not apply. Relevant growth axes are skill count and provider diversity.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 10-30 skills | Flat `skills/` directory is fine |
| 85+ skills | Category subdirectories required to keep structure navigable. Context budget becomes a concern — skills with `user-invocable: false` can be marked for auto-only invocation |
| 200+ skills | Consider splitting into multiple focused plugins (e.g. `pocket-knife-audio`, `pocket-knife-image`) to keep context window overhead manageable per use-case |

### Scaling Priorities

1. **First bottleneck — context budget:** 85+ skill descriptions all loaded at session start. Each description takes space. Budget is ~2% of context window (~16K chars fallback). Keep descriptions concise and use `user-invocable: false` for guide-type skills that Claude should load automatically but users rarely invoke directly.
2. **Second bottleneck — provider API changes:** With 85+ skills each calling a different endpoint, any provider API change breaks one skill. Mitigation: keep skills as thin as possible (minimal curl, no complex logic), so updates are trivial diffs in one SKILL.md.

## Anti-Patterns

### Anti-Pattern 1: Putting Skills Inside `.claude-plugin/`

**What people do:** Create `.claude-plugin/skills/` thinking it is the plugin's skill folder.
**Why it's wrong:** Claude Code only looks for `plugin.json` inside `.claude-plugin/`. Any directories placed there are invisible to the runtime. Skills simply will not load.
**Do this instead:** Place `skills/` at the plugin root level, alongside `.claude-plugin/`.

### Anti-Pattern 2: Sourcing `.env` Inside Each SKILL.md

**What people do:** Add `. ~/.claude/.env` or `source ~/.claude/.env` at the top of every skill's bash block.
**Why it's wrong:** Duplicates boilerplate across 85+ files. Any change to the loading logic requires editing every skill. Also adds noise to the context Claude must read.
**Do this instead:** Source once via the SessionStart hook in `hooks/hooks.json`. All skills inherit the environment automatically.

### Anti-Pattern 3: Hardcoding API Keys in SKILL.md

**What people do:** Embed `API_KEY=sk-abc123` directly in a SKILL.md file.
**Why it's wrong:** `SKILL.md` files live in the GitHub repo. Keys get committed and exposed publicly.
**Do this instead:** Always reference `$PROVIDER_API_KEY` in skill content. The actual value lives only in `~/.claude/.env` on the user's machine, never in the repo.

### Anti-Pattern 4: Using the Plugin npm Package as Runtime

**What people do:** Bundle all skill logic in a Node.js npm package and call it from skills.
**Why it's wrong:** Skills are markdown + curl. Adding a Node.js runtime dependency contradicts the "minimize external dependencies" constraint, creates install-step friction, and breaks on machines without Node.
**Do this instead:** Skills call provider REST APIs directly via `curl`. Reserve the npm package (`pocket-knife`) exclusively for the `npx pocket-knife init` setup CLI — never as a runtime dependency.

### Anti-Pattern 5: `allowed-tools: Bash(*)` (Unrestricted)

**What people do:** Set `allowed-tools: Bash(*)` to give skills unrestricted bash access.
**Why it's wrong:** Removes the safety boundary. Claude could run arbitrary commands if it misinterprets skill instructions.
**Do this instead:** Restrict to the minimum needed. For API-calling skills: `Bash(curl *)`. For skills that also write files: `Bash(curl *), Write`. Never allow unrestricted `Bash(*)`.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Gemini | REST API via curl, `Authorization: Bearer $GOOGLE_API_KEY` | Used by image (Gemini Image), video (Veo), LLM skills |
| ElevenLabs | REST API via curl, `xi-api-key: $ELEVENLABS_API_KEY` | All 8 audio skills |
| xAI (Grok) | REST API via curl, OpenAI-compatible endpoint, `Bearer $XAI_API_KEY` | LLM + image (Grok Imagine) skills |
| fal.ai | REST API via curl, `Authorization: Key $FAL_API_KEY` | FLUX, Reve, and other image/video models |
| Tavily | REST API via curl, `Authorization: Bearer $TAVILY_API_KEY` | web-search skill |
| Exa | REST API via curl, `x-api-key: $EXA_API_KEY` | web-search skill (alternative) |
| Twitter/X | REST API via curl, OAuth bearer token | twitter-automation skill |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `hooks/hooks.json` → `scripts/load-env.sh` | Shell command via `${CLAUDE_PLUGIN_ROOT}/scripts/load-env.sh` | Hook fires at SessionStart; script must be executable |
| `skills/*/SKILL.md` → provider APIs | Claude reads SKILL.md, constructs Bash(curl) call | Claude is the orchestrator; env vars are in shell env |
| `commands/setup.md` → `~/.claude/.env` | Claude uses Write tool to create/update the file | User confirms Write permission prompt |
| `bin/pocket-knife.js` (CLI) → `~/.claude/.env` | Node.js `fs.writeFileSync` | CLI runs outside Claude Code; totally separate from plugin runtime |
| Plugin manifest → Claude Code registry | `plugin.json` discovery at plugin root | Claude Code reads manifest on install/enable |

## Suggested Build Order

Based on component dependencies, build in this sequence:

1. **Plugin scaffold** — `plugin.json` + directory structure. No code, just the container. Tests that Claude Code recognizes the plugin with `/plugin validate`.
2. **Env loader** — `scripts/load-env.sh` + `hooks/hooks.json`. Foundational. All skills depend on this working. Verify with a test session that `$TEST_KEY` set in `~/.claude/.env` is available to a Bash call.
3. **Setup command** — `commands/setup.md`. Enables early users to configure their `.env` without the CLI. Unblocks testing of real skills.
4. **First skill batch (one per major provider)** — Port one skill from each provider category (e.g. `elevenlabs-tts`, `ai-image-generation`, `web-search`, `llm-models`). Validates the env loader → curl → provider round-trip for each provider's auth scheme.
5. **Remaining skills** — Port remaining 80+ skills. Each is a mechanical replacement of `infsh app run` → `curl`. Parallelizable once the first batch proves the pattern.
6. **npx CLI** — `package.json` + `bin/pocket-knife.js`. Built last because it depends on knowing which providers/keys the final skill set requires. Can be deferred to a post-MVP phase.

## Sources

- [Claude Code Plugins documentation](https://code.claude.com/docs/en/plugins) — official, HIGH confidence
- [Claude Code Plugins reference](https://code.claude.com/docs/en/plugins-reference) — official, HIGH confidence, covers `plugin.json` full schema, `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}`, hooks format
- [Claude Code Skills (extend Claude with skills)](https://code.claude.com/docs/en/skills) — official, HIGH confidence, covers all SKILL.md frontmatter fields
- [inference-sh/skills repository](https://github.com/inference-sh/skills) — MEDIUM confidence, structure confirmed via tree listing and SKILL.md file inspection
- [vercel-labs/skills (npx skills CLI)](https://github.com/vercel-labs/skills) — MEDIUM confidence, independent skills ecosystem CLI

---
*Architecture research for: Claude Code Skills Plugin (Pocket-Knife)*
*Researched: 2026-03-25*
