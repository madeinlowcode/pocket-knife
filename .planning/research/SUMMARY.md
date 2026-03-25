# Project Research Summary

**Project:** pocket-knife — Open-source Claude Code Skills Plugin (inference.sh replacement)
**Domain:** Claude Code plugin development — direct-API skill collection (85+ skills, multi-provider)
**Researched:** 2026-03-25
**Confidence:** HIGH

## Executive Summary

Pocket-knife is an open-source replacement for the inference.sh Claude Code plugin. Where inference.sh routes all API calls through a paid proxy (`infsh app run`), pocket-knife ports every skill to call provider REST APIs directly via `curl`, with API keys stored in `~/.claude/.env` on the user's machine. The plugin is distributed as a standard Claude Code plugin via GitHub + marketplace, with an optional `npx pocket-knife init` CLI for guided first-time setup. The approach is well-supported by Claude Code's official plugin and skills specifications, and all six target providers (Google Gemini, ElevenLabs, xAI, fal.ai, Tavily, Exa) expose REST APIs that are accessible via simple `curl` calls without SDKs.

The recommended architecture centres on three pillars: (1) a `SessionStart` hook that sources `~/.claude/.env` once per session, making API keys available to all 85+ skills without per-skill boilerplate; (2) individual `SKILL.md` files with restrictive `allowed-tools: Bash(curl *)` frontmatter and `disable-model-invocation: true` on all side-effect skills; and (3) a category-based directory split (`skills/image/`, `skills/audio/`, etc.) to stay within Claude Code's 16,000-character skills description budget. The setup experience is delivered through two complementary channels: an `npx pocket-knife init` terminal CLI for first-time users and a `/pocket-knife:setup` in-session slash command for users already inside Claude Code.

The primary risks are technical and addressable in Phase 1: skills description budget overflow (silent failure when 85 verbose descriptions collectively exceed the 16K budget), API key leakage via bash debug patterns, CRLF line-ending failures on Windows, and provider API drift causing silent breakages over time. All eight critical pitfalls identified have concrete prevention strategies that must be established in the repository scaffold before any skills are ported.

---

## Key Findings

### Recommended Stack

The plugin itself has zero runtime dependencies — all skill logic is bash + curl, universally available on every Claude Code target (macOS, Linux, WSL). The only npm package is the optional setup CLI (`npx pocket-knife init`), which uses `@inquirer/prompts ^7` (ESM-native, Node 18+), `chalk ^5`, `dotenv ^16`, and `fs-extra ^11`. Skills use the Agent Skills open standard (`SKILL.md` with YAML frontmatter), the `plugin.json` + `marketplace.json` manifests for Claude Code plugin registration, and a `hooks/hooks.json` SessionStart hook for environment loading.

**Core technologies:**
- `SKILL.md` (agentskills.io spec): Skill definition format — official open standard adopted by Claude Code, OpenCode, Cursor, Codex CLI and 40+ agents; cross-agent portable
- `curl` (system-bundled): Provider API calls — zero dependency, ships on every target platform, handles REST + multipart + binary output
- `plugin.json` + `marketplace.json`: Plugin identity and distribution — required for `/plugin install` and marketplace listing
- `hooks/hooks.json` (SessionStart): Environment loader — the only mechanism to inject env vars before any skill runs, avoids per-skill boilerplate
- `@inquirer/prompts ^7`: Interactive CLI prompts — ESM-native, actively maintained, recommended over legacy `inquirer`
- Node.js 22 LTS: CLI runtime — required by Claude Code itself; 22 LTS gives 12% faster startup than 18

**Critical version requirements:**
- Claude Code 1.0.33+ for plugin system support
- Node.js 18+ minimum, 22 LTS recommended
- All npm packages must be ESM-compatible (chalk v5, @inquirer/prompts v7)

### Expected Features

The plugin must achieve full feature parity with inference.sh (85+ skills, 7+ providers) while delivering a superior user experience through direct API ownership.

**Must have (table stakes):**
- Valid `SKILL.md` per skill with YAML frontmatter (name, description, allowed-tools) — required for plugin registration and Claude invocation
- `.claude-plugin/plugin.json` manifest — required for `/plugin install` and namespace isolation (`/pocket-knife:skill-name`)
- `~/.claude/.env` as centralised key store — the core value proposition; must not conflict with project-level `.env` files
- Direct `curl` calls replacing all `infsh app run` proxy calls — every skill must actually work end-to-end
- Clear setup experience before first use — `npx pocket-knife init` CLI + `/pocket-knife:setup` slash command
- `disable-model-invocation: true` on all side-effect skills — prevents Claude from autonomously spending user API credits
- Guide skills (20+, no API keys) — zero-risk content; makes the plugin useful before any key is configured

**Should have (competitive differentiators):**
- Hybrid key resolution in each skill (env var → `~/.claude/.env` → guide to setup) — graceful degradation with human-readable errors instead of cryptic JSON
- Shared `scripts/load-env.sh` sourced via SessionStart hook — eliminates per-skill boilerplate across 85+ files
- `argument-hint` frontmatter per skill — autocomplete hints in `/` menu reduce friction
- `$CLAUDE_SKILL_DIR` for bundled scripts — portable path references regardless of install location
- Category-organised directory structure — mirrors inference.sh layout for easy diffs and contributor navigation
- Marketplace distribution via GitHub + `marketplace.json` — one-command install for users
- Per-skill `allowed-tools: Bash(curl *)` scoping — restricts blast radius, signals trust boundaries to power users

**Defer to v2+:**
- Marketplace auto-update configuration — defer until plugin is stable for 1-2 release cycles
- Per-skill key validation command ("test your key") — defer until error patterns from v1 are known
- CONTRIBUTING.md with skill porting template — prioritise shipping skills over contribution tooling in v1
- UI skills (agent-ui, chat-ui, tools-ui, widgets-ui) — require React environment, more complex setup
- SDK skills (javascript-sdk, python-sdk) — low demand, complex validation needs

### Architecture Approach

The plugin follows a three-layer architecture: a distribution layer (GitHub repo + `npx` CLI + marketplace), a plugin package layer (manifests + skill directories + hooks + scripts), and the Claude Code runtime layer (SessionStart hook fires → env vars exported → skills loaded → user invokes → `Bash(curl)` hits provider). The key architectural decision is that `~/.claude/.env` is sourced exactly once per session via a `hooks/hooks.json` SessionStart hook, making all API keys available as shell environment variables to every skill's `Bash(curl *)` call without any per-skill sourcing. The npm CLI is architecturally separate from the plugin runtime — it runs outside Claude Code and is purely a setup helper.

**Major components:**
1. `.claude-plugin/plugin.json` — Plugin identity, namespace (`pocket-knife`), version, metadata; required for plugin system registration
2. `hooks/hooks.json` + `scripts/load-env.sh` — SessionStart env loader; sources `~/.claude/.env` once, exports all key=value pairs to shell env for the entire session
3. `skills/[category]/[name]/SKILL.md` — One skill per directory; YAML frontmatter + markdown instructions; Claude reads and constructs `curl` commands from it
4. `commands/setup.md` — `/pocket-knife:setup` slash command; conversational wizard inside Claude Code to create/update `~/.claude/.env`
5. `bin/pocket-knife.js` + `package.json` — `npx pocket-knife init` CLI; interactive terminal setup for first-time users; runs outside Claude Code; writes `~/.claude/.env` via Node.js `fs` (not shell echo, for Windows compatibility)

**Recommended build order (from architecture research):**
Plugin scaffold → Env loader → Setup command → First skill batch (one per provider) → Remaining 80+ skills → npx CLI

### Critical Pitfalls

1. **Skills description budget overflow (silent, near-certain at 85 skills)** — Cap descriptions at 100 chars max; set `SLASH_COMMAND_TOOL_CHAR_BUDGET=40000`; split into category sub-plugins; verify with `/context` after install. Must be addressed in Phase 1 architecture decisions.

2. **API key leakage via bash debug patterns** — Never use `set -x` in loader or skill scripts; validate key presence with `[ -z "$VAR" ]`, never by printing values; mask keys as `****` in setup skill output. Establish security contract in Phase 1 before any skill is written.

3. **CRLF line endings breaking bash scripts on Windows** — Add `.gitattributes` with `*.sh text eol=lf` before writing any scripts; use `#!/usr/bin/env bash` shebangs; add CI check. Must be done in Phase 1 repository setup.

4. **Skill auto-triggering unintended behavior (broad descriptions)** — Apply `disable-model-invocation: true` to all 85 side-effect skills universally; selectively enable auto-trigger only for guide/informational skills. Establish policy in Phase 2 before bulk porting.

5. **curl exit code 0 masking HTTP errors** — Use `curl -f` flag; capture HTTP status code with `-w "%{http_code}"`; check file size for binary outputs; implement retry on 429. Establish shared script template in Phase 2; enforce across all skills.

6. **Provider API breaking changes (model names, endpoints, parameter casing)** — Create `VERSIONS.md` per skill recording model/endpoint/date/source URL; pin to versioned model identifiers (e.g., `gemini-1.5-flash-002` not `gemini-pro`); build a smoke-test script in Phase 5.

7. **SKILL.md exceeding 500 lines causing context bloat** — Apply progressive disclosure: SKILL.md under 300 lines, API reference in `reference.md`, examples in `examples/`; enforce with `wc -l` CI check.

8. **`.env` loader running in global shell config** — Use SessionStart hook (not `.bashrc`); never modify shell RC files automatically; check file existence before sourcing.

---

## Implications for Roadmap

Based on combined research, the following 5-phase structure is recommended. Dependencies are strict: each phase unlocks the next.

### Phase 1: Repository Scaffold and Foundation
**Rationale:** Architecture decisions made here affect all 85 skills. Skills budget strategy, security contract, Windows compatibility, and env loading mechanism must be locked before a single skill is written. Mistakes here require restructuring the entire plugin.
**Delivers:** A working, installable (but empty) plugin skeleton that Claude Code recognises; a functioning env loader that passes API keys to bash subprocesses; setup wizard for first-time users; all repository hygiene in place.
**Addresses features:** `plugin.json` manifest, `~/.claude/.env` pattern, `load-env.sh` shared loader, `/pocket-knife:setup` command, namespace isolation, MIT licence, README with install instructions.
**Avoids pitfalls:** Skills budget overflow (design category split before any skills exist); API key leakage (establish loader security contract); CRLF line endings (add `.gitattributes` now); env loader scope issues (SessionStart hook, not `.bashrc`).
**Research flag:** Standard patterns — well-documented by official Claude Code plugin docs. Skip research-phase.

### Phase 2: First Skill Batch and Pattern Validation (One Per Provider)
**Rationale:** Port one skill per major provider category before bulk porting. This validates the env loader → curl → provider round-trip for each provider's auth scheme and establishes templates that all remaining skills will follow. Bugs discovered here are fixed in one place, not 85.
**Delivers:** 6-8 working skills (one per provider: `ai-image-generation`, `elevenlabs-tts`, `web-search`, `llm-models`, `google-veo`, `twitter-automation`); validated curl templates per provider; error-handling pattern established; `disable-model-invocation` policy locked; `VERSIONS.md` pattern established.
**Uses:** Bash + curl, `allowed-tools: Bash(curl *)`, `disable-model-invocation: true`, `ELEVENLABS_API_KEY`, `FAL_KEY`, `GOOGLE_API_KEY`, `XAI_API_KEY`, `TAVILY_API_KEY`, `EXA_API_KEY`.
**Avoids pitfalls:** Broad skill triggering (disable-model-invocation policy); curl masking HTTP errors (shared template with `-f` flag and status check); SKILL.md over 500 lines (enforce 300-line template); provider API breaking changes (VERSIONS.md established).
**Research flag:** Provider-specific API details may need spot-checking during implementation. ElevenLabs async audio, fal.ai async polling, and xAI partial OpenAI compatibility need explicit testing.

### Phase 3: Guide Skills and High-Demand Image/LLM/Search Skills
**Rationale:** Guide skills (20+) require no API keys and can be verified immediately — zero risk, immediate utility. Image and LLM skills are the highest-demand category, validating the pattern at scale for the most-used providers. Web search and LLM skills are short and high-utility.
**Delivers:** All 20+ guide skills (writing, prompting, design — no API key required); full image skill set (9 skills: `flux-image`, `ai-image-generation`, `background-removal`, `image-upscaling`, `nano-banana`, `nano-banana-2`, `p-image`, `qwen-image-2`, `qwen-image-2-pro`); `llm-models` multi-provider skill; `web-search` (Tavily + Exa).
**Implements:** Category directory structure at scale (`skills/image/`, `skills/guides/`, `skills/llm/`, `skills/search/`); argument-hint frontmatter across all skills.
**Avoids pitfalls:** Context budget (descriptions trimmed to ≤100 chars, category split enforced); SKILL.md line count (progressive disclosure; reference.md for provider docs).
**Research flag:** Standard patterns for this phase — curl + provider REST APIs are well-documented. No research-phase needed.

### Phase 4: Audio and Video Skills
**Rationale:** ElevenLabs audio skills (8 skills) and video skills (Google Veo, image-to-video, ai-video-generation) are deferred until the core pattern is confirmed stable. Video skills are complex: long generation times (60-120s), async polling for fal.ai, and binary output handling. These categories carry higher implementation risk.
**Delivers:** All 8 ElevenLabs audio skills (TTS, STT, dialogue, sound effects, voice cloner, voice changer, music, dubbing); 3 video skills; async polling helper pattern for fal.ai.
**Avoids pitfalls:** fal.ai async polling (must poll `GET /requests/{id}` — not fire-and-forget); ElevenLabs deprecated models (use `eleven_turbo_v2_5` / `eleven_multilingual_v2`, not deprecated `eleven_monolingual_v1`); binary output validation (check Content-Type and file size before saving); long-running operations UX (add progress messages "this typically takes 60-120 seconds").
**Research flag:** fal.ai async job model and ElevenLabs multipart audio upload patterns may need API reference validation during implementation.

### Phase 5: Social, UI, SDK Skills and Quality Infrastructure
**Rationale:** Twitter automation, UI skills, and SDK skills are lower demand and higher complexity. Quality infrastructure (smoke-test script, VERSIONS.md review, `npx pocket-knife init` CLI) is built last because it depends on knowing the final provider/key set from all 85 skills.
**Delivers:** `twitter-automation` skill with `disable-model-invocation: true` and rate-limit guidance; UI skills (agent-ui, chat-ui, tools-ui, widgets-ui); SDK skills (javascript-sdk, python-sdk); `pocket-knife-verify.sh` smoke-test script covering all providers; `npx pocket-knife init` CLI (`package.json` + `bin/pocket-knife.js`).
**Avoids pitfalls:** Provider API breaking changes at scale (smoke-test script covers all providers); setup CLI key overwrite (always prompt "Key exists, overwrite? [y/N]"); Windows users without real curl (document WSL requirement in README).
**Research flag:** Twitter/X OAuth Bearer token pattern and UI skills React environment requirements may need additional research during planning.

### Phase Ordering Rationale

- Foundation before skills (Phase 1 before Phases 2-5): The env loader, security contract, and skills budget strategy affect all 85 skills. Changing these after bulk porting costs 85x the effort.
- Pattern validation before bulk porting (Phase 2 before Phase 3): One skill per provider exposes all auth and payload quirks. Mistakes in the template are fixed in 6 places, not 85.
- Zero-dependency content before complex integrations (guide skills in Phase 3 before audio/video in Phase 4): Guide skills ship immediately useful value while higher-risk integrations are built carefully.
- Quality infrastructure last (Phase 5): The smoke-test script and CLI can only be complete once all providers are known. Building them first would mean rebuilding them after Phase 3 and 4 additions.

### Research Flags

**Needs deeper research during planning:**
- **Phase 2 (fal.ai async polling):** fal.ai uses a two-step async job model (`POST` to enqueue, `GET /requests/{id}` to poll). Polling interval, max-wait, and timeout handling need explicit implementation design.
- **Phase 4 (ElevenLabs multipart audio for STT):** Speech-to-text requires multipart/form-data file upload. The `curl -F "file=@$filepath"` pattern must be validated against current ElevenLabs API spec.
- **Phase 5 (Twitter/X OAuth):** OAuth Bearer token setup for `twitter-automation` differs from simple API key auth; needs explicit research on current X API v2 auth flow.

**Standard patterns (skip research-phase):**
- **Phase 1 (plugin scaffold):** Fully documented by official Claude Code plugin reference. `plugin.json` schema, `hooks/hooks.json` format, and `plugin.json` discovery are stable and official.
- **Phase 3 (image + search + LLM skills):** Google Gemini, Tavily, Exa, and fal.ai REST APIs are well-documented. Auth patterns confirmed in STACK.md research. Standard `curl` + JSON pattern.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies sourced from official Anthropic docs (Claude Code plugin/skills reference), official provider docs (Gemini, ElevenLabs, fal.ai, xAI, Tavily, Exa), and npm registry. No speculative choices. |
| Features | HIGH | Core feature set derived from official Claude Code skills docs and direct inspection of inference.sh repo (the target for parity). Community analysis of API key management patterns is MEDIUM but secondary. |
| Architecture | HIGH | Sourced from official Claude Code plugins-reference docs (plugin.json schema, `${CLAUDE_PLUGIN_ROOT}`, hooks format, `${CLAUDE_SKILL_DIR}`) and verified against inference-sh/skills repo structure. |
| Pitfalls | HIGH | Critical pitfalls sourced from official GitHub issue tracker (anthropics/claude-code #16616), official Anthropic skill authoring best practices, and verified provider changelogs (ElevenLabs Dec 2025 deprecation). |

**Overall confidence:** HIGH

### Gaps to Address

- **Skills budget ceiling in practice:** The 16K character budget and `SLASH_COMMAND_TOOL_CHAR_BUDGET` override are documented but the exact per-category skill count that fits within each budget level needs empirical testing after Phase 1 is structured. Plan to test with `/context` command immediately after scaffold.
- **fal.ai async polling max-wait:** No official maximum wait time is documented for fal.ai video generation jobs. The 60-120s estimate is community-sourced. Add a configurable `MAX_WAIT` variable to the fal.ai skill templates.
- **Windows curl vs PowerShell alias:** Windows users running Git Bash may have `curl` aliased to PowerShell's `Invoke-WebRequest`. Document the requirement for real curl (WSL or Git Bash with curl.exe) in README and setup CLI.
- **`CLAUDE_PLUGIN_ROOT` variable availability:** The `${CLAUDE_PLUGIN_ROOT}` variable used in hooks is documented in official reference but version availability must be confirmed with `claude --version` check during Phase 1 testing.

---

## Sources

### Primary (HIGH confidence)
- [agentskills.io/specification](https://agentskills.io/specification) — SKILL.md format, frontmatter fields, directory structure
- [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) — All SKILL.md frontmatter fields, invocation control, dynamic context, skills budget
- [code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins) — plugin.json schema, `--plugin-dir` flag, plugin directory structure
- [code.claude.com/docs/en/plugins-reference](https://code.claude.com/docs/en/plugins-reference) — Complete plugin manifest schema, `${CLAUDE_PLUGIN_ROOT}`, hooks format, caching
- [code.claude.com/docs/en/plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) — marketplace.json format, GitHub distribution
- [platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) — Skill authoring best practices, invocation policy
- [github.com/anthropics/claude-code/issues/16616](https://github.com/anthropics/claude-code/issues/16616) — Skills budget overflow, `SLASH_COMMAND_TOOL_CHAR_BUDGET` workaround
- [ai.google.dev/gemini-api/docs/api-key](https://ai.google.dev/gemini-api/docs/api-key) — Gemini API key pattern and endpoint
- [elevenlabs.io/docs/api-reference/authentication](https://elevenlabs.io/docs/api-reference/authentication) — ElevenLabs `xi-api-key` header
- [elevenlabs.io/docs/changelog/2025/12/8](https://elevenlabs.io/docs/changelog/2025/12/8) — v1 TTS model deprecation (removal 2025-12-15)
- [docs.fal.ai/model-apis/quickstart](https://docs.fal.ai/model-apis/quickstart) — fal.ai `Authorization: Key` pattern, FAL_KEY env var
- [docs.x.ai/docs/tutorial](https://docs.x.ai/docs/tutorial) — xAI Bearer auth, XAI_API_KEY, endpoint base URL
- [docs.tavily.com/documentation/api-reference/endpoint/search](https://docs.tavily.com/documentation/api-reference/endpoint/search) — Tavily Bearer auth pattern
- [exa.ai/docs/reference/search-api-guide](https://exa.ai/docs/reference/search-api-guide) — Exa `x-api-key` header pattern
- [support.claude.com/en/articles/12304248-managing-api-key-environment-variables-in-claude-code](https://support.claude.com/en/articles/12304248-managing-api-key-environment-variables-in-claude-code) — Official API key management in Claude Code
- [support.claude.com/en/articles/9767949-api-key-best-practices-keeping-your-keys-safe-and-secure](https://support.claude.com/en/articles/9767949-api-key-best-practices-keeping-your-keys-safe-and-secure) — API key security best practices
- [github.com/inference-sh/skills](https://github.com/inference-sh/skills) — Original inference.sh plugin structure, MIT licence, skill count and categories

### Secondary (MEDIUM confidence)
- [github.com/vercel-labs/skills](https://github.com/vercel-labs/skills) — `npx skills add` CLI, skills.sh marketplace install paths
- [medium.com/ducky-ai/the-credential-conundrum-managing-api-keys-in-claude-skills](https://medium.com/ducky-ai/the-credential-conundrum-managing-api-keys-in-claude-skills-430c41b21aa8) — Community analysis of API key management patterns in Claude skills
- [medium.com/@cheparsky/ai-in-testing-9-the-invisible-limitations-of-claude-code-skills](https://medium.com/@cheparsky/ai-in-testing-9-the-invisible-limitations-of-claude-code-skills-you-didnt-know-f3adbdcf3680) — Skills budget invisible limitations, community testing
- [docs.fal.ai/changelog](https://docs.fal.ai/changelog) — fal.ai camelCase parameter migration
- [npmjs.com/@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts) — v7 current, ESM-native
- [www.morphllm.com/claude-code-skills-mcp-plugins](https://www.morphllm.com/claude-code-skills-mcp-plugins) — Claude Code Skills vs MCP vs Plugins guide 2026

---

*Research completed: 2026-03-25*
*Ready for roadmap: yes*
