# Feature Research

**Domain:** Open-source Claude Code skill plugin with direct API key management
**Researched:** 2026-03-25
**Confidence:** HIGH (core skill structure from official docs), MEDIUM (ecosystem patterns from community research)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Valid `SKILL.md` per skill with YAML frontmatter | Every Claude Code skill requires this structure to register as a `/slash-command`. Name + description fields drive Claude's invocation logic | LOW | Fields: `name`, `description`, optionally `allowed-tools`, `disable-model-invocation`, `argument-hint` |
| `.claude-plugin/plugin.json` manifest | Required for plugin registration. Without it, skills are standalone files, not an installable plugin. Drives namespace (`/pocket-knife:skill-name`) | LOW | Fields: `name`, `version`, `description`, `author`, `license`, `repository` |
| `~/.claude/.env` as centralised key store | The entire value prop is "own keys, no proxy". Users expect a single place to configure all provider credentials. Must not conflict with project-level `.env` files | LOW | Loaded once via a shared loader script; global path avoids repo contamination |
| Skill correctly calls the provider API | Each ported skill must actually work — replace `infsh app run` with a direct `curl` / SDK call. Broken skills = immediate abandonment | HIGH | 85+ skills across 7+ providers. Each provider has different auth headers, payload shape, response schema |
| Clear setup step before first use | Users need to know which env vars to set before running any skill. Onboarding friction is the #1 drop-off point for API-key tools | MEDIUM | Two channels: `npx pocket-knife init` CLI and `/pocket-knife:setup` in-session skill |
| Namespace isolation | Plugin skills appear as `/pocket-knife:flux-image`, not `/flux-image`. Prevents conflicts with other installed plugins | LOW | Enforced automatically by Claude Code plugin system via `plugin.json` `name` field |
| MIT licence | inference.sh/skills is MIT. Downstream forks must preserve this to stay legally compatible | LOW | Already decided in PROJECT.md |
| README with installation instructions | Users install from GitHub. No README = no installs | LOW | Not a skill feature; project meta requirement |
| Skills work across all Claude Code versions ≥ 1.0.33 | Plugin system requires Claude Code 1.0.33+. Skills must not use version-specific APIs that break on older installs | MEDIUM | Verify frontmatter fields against stable spec; avoid preview features |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Interactive setup CLI (`npx pocket-knife init`) | Lowers barrier for non-technical users. Asks which skills the user wants, then prompts only the relevant API keys. Comparable to `create-react-app` first-run UX | MEDIUM | Node.js script; reads required env vars per skill category from a manifest; writes `~/.claude/.env` atomically |
| In-session setup skill (`/pocket-knife:setup`) | Lets users configure keys without leaving Claude Code. Reachable by users who skipped CLI setup or added a new skill category later | MEDIUM | SKILL.md that guides Claude to check existing `~/.claude/.env`, identify missing keys, and prompt user to add them conversationally |
| Hybrid key resolution in each skill | Skills attempt env vars first, then `~/.claude/.env`, then offer to guide setup. Graceful degradation prevents cryptic errors when a key is missing | MEDIUM | Shell logic at top of Bash snippets: `source ~/.claude/.env 2>/dev/null; [[ -z "$SOME_KEY" ]] && echo "Run /pocket-knife:setup" && exit 1` |
| Shared loader script sourced by all skills | Single `~/.claude/.env` is read once by a `load-env.sh` sourced at the top of each skill's Bash block. Prevents code duplication and ensures uniform key availability | LOW | Skill SKILL.md references the loader; loader script ships as `scripts/load-env.sh` inside plugin |
| `$CLAUDE_SKILL_DIR` for bundled scripts | Skills reference their own bundled scripts using `${CLAUDE_SKILL_DIR}/scripts/…` — portable regardless of where the plugin is installed | LOW | Native Claude Code variable; eliminates hardcoded paths |
| Per-skill `allowed-tools` declarations | Explicitly scoping tools (e.g., `allowed-tools: Bash(curl *)`) reduces permission prompts and signals trust boundaries to power users | LOW | One line of frontmatter per skill; requires review of each skill's actual tool needs |
| `disable-model-invocation: true` for side-effect skills | Skills that send API requests (generate image, send tweet) should only fire when explicitly invoked. Prevents Claude from autonomously spending user API credits | LOW | Critical for `twitter-automation`, `elevenlabs-*`, video generation skills |
| Provider-organised skill categories | Following inference.sh directory structure (`tools/image/`, `tools/audio/`, etc.) makes it easy for users familiar with the original to navigate | LOW | Maps 1:1 to existing structure; maintain symmetry for ease of diffing with upstream |
| Marketplace distribution via GitHub + `/plugin marketplace add` | Users can add the plugin from GitHub in one command. No separate registry needed. Auto-update support via Claude Code plugin system | LOW | Requires `marketplace.json` in `.claude-plugin/`; GitHub acts as the host |
| Skill-level `argument-hint` for discoverability | Autocomplete hints like `[prompt] [size]` appear in the `/` menu, reducing "what arguments does this take?" friction | LOW | One line of frontmatter; high UX value, minimal cost |
| Guide skills as reference knowledge | Non-executable skills (`user-invocable: false`, `disable-model-invocation` not set) auto-load when Claude detects relevant context — e.g., the prompting guide activates when a user asks about prompt engineering | LOW | Follows the "reference content" pattern from Claude Code docs; no API key required |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Proxy / gateway layer | "Centralise API calls, add logging, rate limiting" | Defeats the entire value prop (direct API, no vendor lock-in). Adds infrastructure to maintain. Becomes indistinguishable from inference.sh | Keep all calls direct from skill SKILL.md via `curl` or SDK. Let providers' own dashboards handle usage tracking |
| Paying-tier features or usage quotas | "Monetise to fund maintenance" | Violates the open-source, free promise. Introduces billing complexity. Fragments the user base | Sustain via GitHub Sponsors or donations; keep MIT licence |
| GUI / dashboard for key management | "Easier than editing `.env`" | Out of scope for a Claude Code plugin. Requires separate web app. High maintenance surface | The `npx pocket-knife init` CLI and `/pocket-knife:setup` skill cover the same ground inside the tools users already have |
| Auto-detecting and patching inference.sh installs | "Migrate existing users automatically" | Risk of corrupting existing configurations; unpredictable environment states | Provide a migration guide in README; the setup CLI handles fresh installs |
| Skills that bundle AI model weights locally | "Offline capability" | Contradicts "direct API" architecture; multi-GB downloads per skill | Explicitly out of scope. All providers used (Google, ElevenLabs, fal.ai) require network |
| Plugin auto-installing on first `claude` session | "Zero friction" | Requires elevated permissions; violates principle of least privilege; users should consciously add plugins | Use `/plugin install` with clear README instructions; offer `npx pocket-knife init` as guided alternative |
| Storing API keys inside plugin directory | "Simpler path resolution" | Keys committed to version control = security breach | Keys live exclusively in `~/.claude/.env` (global, outside repos). Plugin never writes to its own directory |
| Skills for providers without public API key auth | "More coverage" | If a provider requires OAuth, service accounts, or has no API, the skill cannot work without a proxy — which is out of scope | Only include providers listed in PROJECT.md (`Google`, `ElevenLabs`, `xAI`, `fal.ai`, `Tavily`, `Exa`, `ByteDance`). Document unsupported providers clearly |

---

## Feature Dependencies

```
[~/.claude/.env key store]
    └──required by──> [load-env.sh loader script]
                           └──required by──> [All API-calling skills (image, video, audio, LLM, search)]

[load-env.sh loader script]
    └──enhances──> [Hybrid key resolution pattern]
                       └──enhances──> [/pocket-knife:setup skill]

[plugin.json manifest]
    └──required by──> [Marketplace distribution]
                           └──required by──> [/plugin marketplace add & /plugin install]

[npx pocket-knife init CLI]
    └──enhances──> [/pocket-knife:setup skill]
    (both write to ~/.claude/.env — complementary, not competing)

[disable-model-invocation: true]
    └──required by──> [Side-effect skills: twitter-automation, elevenlabs-*, video generation]

[allowed-tools declaration]
    └──enhances──> [All Bash-heavy skills]

[Guide skills (no API key)]
    └──independent of──> [API-key skills]
    (can ship and be useful before any API key is configured)
```

### Dependency Notes

- **API-calling skills require `~/.claude/.env`**: All 85+ non-guide skills depend on provider API keys being present. The loader script must be implemented first.
- **Marketplace distribution requires `plugin.json`**: The manifest must be correct before any user can `/plugin install`. Get this right in Phase 1.
- **Setup experience enhances all skills**: `npx init` and `/pocket-knife:setup` are not prerequisites for skills to work, but they dramatically reduce first-run failure rate. Should ship alongside the first batch of skills.
- **Guide skills are independent**: The 20+ guide SKILL.md files (writing, prompting, design, etc.) need no API keys and can be verified and shipped without touching provider integration at all.
- **`disable-model-invocation` conflicts with auto-loading**: Skills with side effects should never auto-load. This is a one-line frontmatter decision but must be applied intentionally during skill porting.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] `plugin.json` manifest with correct metadata — without this the plugin cannot be installed
- [ ] `~/.claude/.env` pattern documented and enforced — the security and architecture foundation
- [ ] `load-env.sh` shared loader script — DRY key loading across all skills
- [ ] `/pocket-knife:setup` setup skill — in-session onboarding without external tools
- [ ] `npx pocket-knife init` CLI — guided key configuration for first-time setup
- [ ] Image skills (5–9 skills: `flux-image`, `ai-image-generation`, `background-removal`, `image-upscaling`, `nano-banana`, `nano-banana-2`, `p-image`, `qwen-image-2`, `qwen-image-2-pro`) — highest-demand category; validates the direct-API pattern with fal.ai and Google
- [ ] LLM skills (`llm-models`) — validates multi-provider LLM routing (Claude, Gemini, Kimi, GLM)
- [ ] Web search skills (`web-search` via Tavily + Exa) — short, easy to validate, high utility
- [ ] Guide skills (all, no API keys needed) — zero-risk content; makes the plugin immediately useful even before API keys are configured

### Add After Validation (v1.x)

Features to add once core pattern is working and first users report issues.

- [ ] Audio skills (all 8 ElevenLabs skills) — trigger: image skills confirmed stable, provider pattern established for ElevenLabs
- [ ] Video skills (Veo, image-to-video, ai-video-generation) — trigger: pattern stable; video APIs have more complex payloads and async polling needs
- [ ] Twitter automation — trigger: user demand confirmed; add `disable-model-invocation: true` and explicit rate-limit guidance
- [ ] UI skills (agent-ui, chat-ui, tools-ui, widgets-ui) — trigger: needs React environment; more complex setup
- [ ] SDK skills (javascript-sdk, python-sdk) — trigger: validate that Claude Code correctly handles code generation with SDK context

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Marketplace auto-update configuration — defer: core plugin must first be stable for 1–2 release cycles
- [ ] Per-skill key validation command — nice to have; adds a "test your key" check before first real call; defer until error patterns from v1 are known
- [ ] Contributor guide and CONTRIBUTING.md with skill porting template — defer: prioritise shipping skills over contribution tooling in v1

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| `plugin.json` manifest | HIGH | LOW | P1 |
| `~/.claude/.env` loader script | HIGH | LOW | P1 |
| `/pocket-knife:setup` skill | HIGH | MEDIUM | P1 |
| `npx pocket-knife init` CLI | HIGH | MEDIUM | P1 |
| Image skills (9 skills) | HIGH | HIGH | P1 |
| LLM skills | HIGH | MEDIUM | P1 |
| Web search skills | HIGH | LOW | P1 |
| Guide skills (20+) | MEDIUM | LOW | P1 |
| `disable-model-invocation` on side-effect skills | HIGH | LOW | P1 |
| `allowed-tools` per skill | MEDIUM | LOW | P1 |
| `argument-hint` frontmatter | MEDIUM | LOW | P2 |
| Audio skills — ElevenLabs | HIGH | HIGH | P2 |
| Video skills | HIGH | HIGH | P2 |
| Twitter automation | MEDIUM | MEDIUM | P2 |
| Hybrid key resolution (env → file → prompt guide) | HIGH | MEDIUM | P2 |
| UI skills | MEDIUM | HIGH | P2 |
| SDK skills | LOW | MEDIUM | P3 |
| Marketplace auto-update config | LOW | LOW | P3 |
| Per-skill key validation command | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | inference.sh (original) | Other open-source skill packs | Pocket-Knife (our approach) |
|---------|--------------------------|-------------------------------|------------------------------|
| API calls | Via `infsh app run` proxy CLI | Varies; many use curl directly | Direct `curl` / SDK; no proxy |
| Key management | inference.sh account + paid credits | Manual env var export | `~/.claude/.env` + guided setup |
| Setup experience | `infsh login` + subscription | Manual README instructions | `npx init` CLI + in-session skill |
| Distribution | `/plugin install inference-sh` | GitHub manual copy | GitHub + marketplace add |
| Skill count | 85+ (image, video, audio, LLM, search) | Typically 5–30 specialised skills | 85+ (full parity with inference.sh) |
| Cost | Paid per API call (via proxy) | Free | Free (direct to provider) |
| Licence | MIT | Varies | MIT (compatible with upstream) |
| Error handling | Opaque (proxy absorbs errors) | None / best-effort | Explicit missing-key guidance |
| Guide / reference skills | Yes (20+) | Rare | Yes (full parity) |

---

## Sources

- [Claude Code Skills docs](https://code.claude.com/docs/en/skills) — official, HIGH confidence
- [Claude Code Plugins docs](https://code.claude.com/docs/en/plugins) — official, HIGH confidence
- [Claude Code Discover Plugins docs](https://code.claude.com/docs/en/discover-plugins) — official, HIGH confidence
- [inference.sh skills README](https://github.com/inference-sh/skills/blob/main/README.md) — official repo, HIGH confidence
- [inference.sh plugin.json](https://raw.githubusercontent.com/inference-sh/skills/main/.claude-plugin/plugin.json) — official, HIGH confidence
- [The Credential Conundrum — Medium/Ducky AI](https://medium.com/ducky-ai/the-credential-conundrum-managing-api-keys-in-claude-skills-430c41b21aa8) — community analysis, MEDIUM confidence
- [Managing API key environment variables in Claude Code](https://support.claude.com/en/articles/12304248-managing-api-key-environment-variables-in-claude-code) — official support, HIGH confidence

---

*Feature research for: Claude Code skill plugin with direct provider API key management (Pocket-Knife)*
*Researched: 2026-03-25*
