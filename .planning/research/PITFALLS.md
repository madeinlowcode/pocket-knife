# Pitfalls Research

**Domain:** Claude Code Plugin — Direct-API-Call Skill Collection (85+ skills, multi-provider)
**Researched:** 2026-03-25
**Confidence:** HIGH (verified against official Claude Code docs, ElevenLabs changelog, fal.ai docs, community reports)

---

## Critical Pitfalls

### Pitfall 1: Skills Budget Overflow — 85 Skills Silently Disappear

**What goes wrong:**
Claude Code enforces an invisible character budget for skill metadata at startup: 2% of the context window with a 16,000-character fallback. When the collective descriptions of all registered skills exceed this budget, later skills are silently excluded. The UI shows a comment like `<!-- Showing 42 of 63 skills -->` but Claude gives no error. Skills past the cutoff become completely inaccessible — they do not appear in `/` autocomplete and Claude cannot trigger them.

With 85+ skills, this is near-certain to happen if descriptions are not aggressively trimmed. At ~263 characters per description, only ~42 skills fit. At ~130 characters per description, ~67 skills fit. 85 skills requires descriptions under 80 characters each on average.

**Why it happens:**
Developers port skills from inference.sh with verbose descriptions (often 200-400 characters) and do not test total budget consumption. The failure is silent — there is no warning during skill authoring.

**How to avoid:**
- Set `SLASH_COMMAND_TOOL_CHAR_BUDGET` to a higher value (e.g., `export SLASH_COMMAND_TOOL_CHAR_BUDGET=40000`) in the plugin setup instructions
- Cap every skill description at 100 characters maximum
- Organize skills into category plugins (image, video, audio, LLM) rather than one mega-plugin, so users install only what they need
- Test with `/context` command after install to check for the skills-excluded warning

**Warning signs:**
- Users report a skill "not working" but the skill file is correctly structured
- `/` autocomplete shows fewer skills than expected
- Claude improvises behavior instead of following SKILL.md instructions

**Phase to address:** Phase 1 (foundation/architecture) — design the plugin structure to avoid this before porting any skills.

---

### Pitfall 2: API Key Leakage via Bash Script Patterns

**What goes wrong:**
A developer trying to "help" users may embed a fallback key, log the `.env` file contents for debugging, or write a skill that echoes environment variables for diagnostics. Any script that touches `~/.claude/.env` and logs output risks exposing keys in Claude's response, in session logs, or in shell history (`~/.bash_history`).

More critically, if the `.env` loader script is written to source the file with `set -x` (verbose mode), every exported variable including keys gets printed to stderr — and Claude captures stderr.

**Why it happens:**
Bash debugging habits (`set -x`, `echo $VAR`) that are safe in isolated dev environments become dangerous when the output is visible in a conversational AI interface. Developers underestimate that Claude's context window is effectively a log.

**How to avoid:**
- Never use `set -x` in the `.env` loader script
- Never echo, print, or log any variable that comes from `.env`
- Validate key presence with `[ -z "$VAR" ]` tests, not by printing the value
- Add `~/.claude/.env` to a global `~/.gitignore_global` in setup instructions
- The skill installer (`/pocket-knife:setup`) must never display partial key values — mask with `****`

**Warning signs:**
- Any skill that does diagnostics by printing environment variables
- Setup skill that shows "your key is: $GOOGLE_API_KEY" as confirmation
- Loader script that has `echo "Loaded: $ELEVENLABS_API_KEY"` style debug lines

**Phase to address:** Phase 1 (loader/setup) — establish the security contract of the loader before any other skill is written.

---

### Pitfall 3: CRLF Line Endings Break Bash Scripts on Windows

**What goes wrong:**
When a developer on Windows clones the repository or creates skill files with a Windows editor, files get CRLF (`\r\n`) line endings instead of LF (`\n`). In bash, a CRLF shebang line becomes `#!/bin/bash\r`, which the kernel cannot find, producing the cryptic error: `bash: /bin/bash^M: bad interpreter: No such file or directory`. Scripts in the `scripts/` directory of each skill silently fail or produce malformed output.

Claude Code runs on Windows via WSL or Git Bash — both encounter this issue when cloning with Git's default `core.autocrlf=true` setting.

**Why it happens:**
Git for Windows defaults to converting LF to CRLF on checkout (`core.autocrlf=true`). This is the git default on most Windows installations. Developers working on Mac/Linux never see the problem, so it goes undetected until a Windows user reports it.

**How to avoid:**
- Add a `.gitattributes` file at the repository root with:
  ```
  * text=auto
  *.sh text eol=lf
  *.md text eol=lf
  ```
- Use `#!/usr/bin/env bash` (not `#!/bin/bash`) as the shebang line in all scripts
- Add a CI check that verifies LF line endings on all `.sh` files
- Document in README that Windows users should run `git config --global core.autocrlf input`

**Warning signs:**
- Scripts fail on Windows with `bad interpreter` or `No such file or directory`
- `file script.sh` reports `CRLF line terminators` on Windows-cloned copy
- Script runs perfectly on Mac/Linux but produces no output on Windows WSL

**Phase to address:** Phase 1 (repository setup/CI) — add `.gitattributes` before any scripts are written.

---

### Pitfall 4: Skill Triggers Too Broadly — Claude Hijacks Unrelated Tasks

**What goes wrong:**
A skill description that says "Use for image generation or when user wants to create images" will trigger not just on `/ai-image-generation` but also when a user says "create an image of X" in an unrelated context, when a user asks about CSS background images, or when discussing image file handling. With 85+ skills loaded, broad descriptions cause a "thundering herd" of conflicting skill triggers.

The reverse also happens: skills with vague descriptions like "Generates audio" never trigger because Claude cannot confidently distinguish them from its own built-in capabilities.

**Why it happens:**
Inference.sh skill descriptions were designed for a different triggering mechanism (the `infsh` CLI with explicit commands). Direct porting of those descriptions into SKILL.md without revision creates mismatch between description intent and Claude Code's automatic invocation logic.

**How to avoid:**
- Write descriptions in third person with explicit "Use when user invokes `/skill-name`" language for skills that should only be manually triggered — or set `disable-model-invocation: true`
- For side-effect skills (image generation, video creation, audio) use `disable-model-invocation: true` universally — these should never be auto-triggered
- Use `disable-model-invocation: true` for all 85 skills initially, then selectively enable auto-trigger only for informational/guide skills

**Warning signs:**
- Claude starts an image generation workflow when user asked a question about images
- Two skills for similar providers (e.g., `flux-image` and `ai-image-generation`) both trigger on the same request
- Users report Claude "doing things I didn't ask for"

**Phase to address:** Phase 2 (first skill port) — establish the `disable-model-invocation` policy before porting any skills with side effects.

---

### Pitfall 5: Provider API Changes Break Skills Without Detection

**What goes wrong:**
ElevenLabs deprecated their v1 TTS models with a removal deadline of 2025-12-15. fal.ai changed parameter naming from snake_case (`image_url`) to camelCase (`imageUrl`). Google Gemini renamed model identifiers between releases. A skill ported today from inference.sh that hardcodes `model: eleven_monolingual_v1` or `model: gemini-pro` will silently produce errors or unexpected results months after launch, with no automated detection.

With 85+ skills across 7+ providers, at least 3-5 provider-level breaking changes per year are statistically likely.

**Why it happens:**
The project has no monitoring layer — it is pure static skill files. There is no automated check that API calls in skill scripts still work. Community maintenance relies on users reporting failures, which has a long delay.

**How to avoid:**
- Add a `VERSIONS.md` file per skill that records: provider, model/endpoint used, date verified, and source documentation URL
- Build a lightweight smoke-test script (`pocket-knife-verify.sh`) that runs one minimal API call per provider and reports pass/fail
- In the skill file, comment every hardcoded model name with `# Verify: <URL to provider changelog>`
- Subscribe to provider changelogs (ElevenLabs, fal.ai, Google Gemini, xAI) as part of project maintenance
- Pin model names to stable versioned identifiers wherever providers offer them (e.g., `gemini-1.5-flash-002` not `gemini-flash`)

**Warning signs:**
- A provider changelog entry mentions "deprecated" for an endpoint used in a skill
- Skill produces HTTP 404 or model-not-found errors
- Skills that worked last month silently return different output format

**Phase to address:** Phase 2 (first skill port) — establish VERSIONS.md pattern; Phase 5 (all 85 skills ported) — build smoke-test script.

---

### Pitfall 6: curl Exit Code 0 Masks API Errors

**What goes wrong:**
`curl` returns exit code `0` (success) even when the server responds with HTTP 4xx or 5xx errors. A skill script that does `curl ... && echo "Done"` will print "Done" when the API returns a 429 Rate Limited, 401 Unauthorized (wrong key), or 500 Internal Server Error. The user sees no error, the skill appears to complete, and the output file is either empty or contains an HTML error page instead of the expected result.

This is particularly damaging for binary outputs (image, audio, video files) — an empty file or an HTML error page saved as `output.mp3` will confuse users silently.

**Why it happens:**
Developers test the happy path with a valid key and do not test failure modes. `curl`'s default behavior prioritizes network success over HTTP semantic success.

**How to avoid:**
- Always use `curl -f` (or `--fail`) flag in skill scripts — this causes curl to exit with code 22 on HTTP 4xx/5xx
- Capture HTTP status code separately: `HTTP_STATUS=$(curl -o output.file -w "%{http_code}" ...)`
- Add explicit checks: `if [ "$HTTP_STATUS" != "200" ]; then echo "ERROR: API returned $HTTP_STATUS" >&2; exit 1; fi`
- For binary output files, check file size after download: `if [ ! -s output.file ]; then echo "ERROR: Empty response" >&2; exit 1; fi`
- Handle 429 (rate limit) with a retry-after sleep

**Warning signs:**
- Skill "succeeds" but output file is empty or 0 bytes
- Skill output contains `{"error": "..."}` JSON instead of expected content
- Users report generated files are corrupted

**Phase to address:** Phase 2 (first skill port) — establish a shared error-handling pattern/template all skills inherit.

---

### Pitfall 7: Skills Exceed 500 Lines — Context Bloat Per Invocation

**What goes wrong:**
The official recommendation is to keep SKILL.md under 500 lines. Porting an inference.sh skill that embeds extensive provider documentation, multiple example payloads, and API reference tables directly into SKILL.md produces files of 600-1200 lines. Every time the skill is invoked, the full content is loaded into context, consuming 8,000-15,000 tokens per invocation. With 85 skills potentially all loaded in a heavy session, this degrades Claude's performance and increases API costs dramatically.

**Why it happens:**
Inference.sh skills are comprehensive documentation files designed to be read by both humans and AI. Direct port without restructuring brings excessive verbosity into the runtime context.

**How to avoid:**
- Apply progressive disclosure: keep SKILL.md body under 300 lines, move API reference into `reference.md`, examples into `examples.md`
- SKILL.md should contain only: what the skill does, required inputs, the API call, and output format
- Never embed large JSON example payloads in SKILL.md — put them in `examples/` directory
- Verify file length before committing: `wc -l skills/*/SKILL.md | sort -n`

**Warning signs:**
- Any SKILL.md over 400 lines
- SKILL.md contains complete API documentation inline
- SKILL.md embeds base64-encoded content or large JSON structures

**Phase to address:** Phase 2 (first skill port) — establish the template structure; enforce in Phase 3+ (bulk porting).

---

### Pitfall 8: `.env` Loader Runs Every Shell — Performance and Side-Effect Problems

**What goes wrong:**
If the `.env` loader is implemented as a shell alias or added to `~/.bashrc` / `~/.zshrc`, it runs on every shell startup, even when not using Pocket-Knife. This slows down terminal startup time, potentially conflicts with project-level `.env` files from other tools (Direnv, dotenv-cli), and can cause `unset` warnings if the file does not exist yet.

A poorly scoped loader that uses `export` for all variables makes the keys available to all child processes in the shell session — including unrelated tools that should not have access.

**Why it happens:**
The simplest implementation of "load once" is a shell RC file hook, which is a globally-scoped solution to a locally-scoped problem.

**How to avoid:**
- Implement the loader as a lazy-sourced function that Claude Code triggers via `!`\`` syntax in each skill's dynamic context injection, not in `.bashrc`
- Alternatively, use `context: fork` with the skill and source the `.env` only within the forked subagent context
- Never modify the user's `.bashrc` or `.zshrc` automatically — document it as an opt-in
- Check for `.env` existence before sourcing: `[ -f ~/.claude/.env ] && source ~/.claude/.env`

**Warning signs:**
- CLI installation script that appends to `.bashrc` without user confirmation
- Setup instructions that say "add to your shell profile"
- Users report slow terminal startup after installing Pocket-Knife

**Phase to address:** Phase 1 (loader design) — decide the sourcing strategy before writing any skill.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode model names without version pinning | Fast to port | Skills break when providers rename models | Never — always pin to versioned model identifiers |
| Copy inference.sh SKILL.md verbatim | Fast porting | Context bloat, wrong triggering, outdated patterns | Never for production — always restructure |
| Single monolithic plugin with all 85 skills | Simpler install | Skills budget overflow, slow discovery, all-or-nothing install | Never — split by category |
| No error handling in curl calls | Simpler scripts | Silent failures, users see empty outputs | Never for production skills |
| Skip `disable-model-invocation: true` | Skills auto-trigger conveniently | Claude runs API calls user didn't request (costs money) | Only for guide/informational skills with no side effects |
| Embed API docs in SKILL.md | Self-contained | Exceeds 500-line limit, context bloat | Move to reference.md instead |
| Use `source ~/.claude/.env` in global shell config | Easy key access | Slows terminal, exposes keys to unrelated processes | Only as opt-in, documented clearly |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| ElevenLabs TTS | Using deprecated `eleven_monolingual_v1` model | Use `eleven_turbo_v2_5` or `eleven_multilingual_v2` — check changelog |
| ElevenLabs API | Using `api-global-preview.elevenlabs.io` base URL | Use `api.elevenlabs.io` — preview URL is deprecated |
| fal.ai FLUX | Using snake_case params (`image_url`, `guidance_scale`) | Use camelCase (`imageUrl`, `guidanceScale`) per current API |
| Google Gemini | Using `gemini-pro` unversioned alias | Pin to explicit version like `gemini-1.5-flash-002` |
| xAI Grok | Assuming OpenAI-compatible SDK works 1:1 | Test each endpoint independently — partial compatibility only |
| Tavily Search | Not handling empty results array | Always check `results.length > 0` before parsing |
| ElevenLabs Audio | Saving audio without checking file is non-empty | Check Content-Type and file size before saving to disk |
| fal.ai async jobs | Not polling for completion | fal.ai uses async job model — must poll `GET /requests/{id}` |
| All providers | Not handling 429 rate limit | Implement exponential backoff with `Retry-After` header |
| Windows (Git Bash) | `curl` is a PowerShell alias, not real curl | Document that Windows users need WSL or Git Bash with real curl |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| 85 skills loaded in one plugin | Skills over budget silently hidden; slow `/` autocomplete | Split into category plugins (4-6 skills each) | At ~42+ skills with average descriptions |
| Heavy SKILL.md files invoked multiple times per session | Context window fills rapidly; Claude degrades | Keep SKILL.md under 300 lines; use progressive disclosure | First invocation already costs 8K+ tokens |
| No timeout on curl calls | Skill hangs indefinitely on slow API | Add `--max-time 30` and `--connect-timeout 10` to all curl calls | Immediately on any slow provider response |
| Synchronous polling for async APIs (fal.ai) | Script blocks for 60+ seconds; Claude times out | Implement proper async polling with reasonable max-wait | fal.ai video generation takes 60-120s |
| Sourcing `.env` on every shell startup | Terminal startup takes 2-3 seconds instead of <1s | Lazy-source via skill dynamic context injection | Immediately visible to user |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Logging or echoing `$PROVIDER_API_KEY` in skill scripts | Key appears in Claude's response and potentially in session logs | Use `[ -z "$VAR" ]` to check presence; never print values |
| Using `set -x` in loader or skill scripts | All variable expansions including keys printed to stderr (captured by Claude) | Never use `set -x` in any skill script |
| Including `.env` in the plugin repository | Keys committed accidentally to public GitHub repo | Add `.env` to `.gitignore`, add `~/.claude/.env` to global gitignore |
| Storing keys in SKILL.md as examples | Hardcoded keys in version-controlled file | Use placeholder `YOUR_API_KEY_HERE` in all documentation |
| `npx pocket-knife init` piping to bash without verification | Classic curl-pipe-bash attack vector — script executes before fully downloaded | Host init script on GitHub with checksum verification; document manual install alternative |
| Skills that accept user-provided URLs and pass them to curl | SSRF if user provides internal/localhost URLs | Validate URL scheme and host before curl; reject non-https |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Setup skill asks for all 85 API keys upfront | Overwhelming — users abandon setup | Ask only for keys relevant to skills user selects; others can be added later |
| No feedback during long API operations (video: 60-120s) | User thinks Claude is frozen; they interrupt | Add progress messages: "Generating video... this typically takes 60-120 seconds" |
| Error messages leak API internals ("HTTP 401 Unauthorized from ElevenLabs v1 endpoint") | Confusing for non-technical users | Translate to: "ElevenLabs API key is missing or invalid. Run /pocket-knife:setup to configure." |
| Skills work differently on different providers for "same" operation | User expects `/ai-image-generation` and `/flux-image` to behave identically | Document provider differences explicitly in each skill's output format section |
| CLI init (`npx pocket-knife init`) requires Node.js | Blocks users who only have bash | Provide a bash-only fallback: `curl -s ... | bash` or manual instructions |
| No confirmation before overwriting existing `~/.claude/.env` | User loses existing keys if they run init twice | Always ask "Key already exists, overwrite? [y/N]" before replacing any value |

---

## "Looks Done But Isn't" Checklist

- [ ] **Skills budget:** Verify total description length with `wc -c skills/*/SKILL.md | sort -n` — if descriptions are over 100 chars average, budget overflow is likely with 85 skills
- [ ] **Windows compatibility:** Clone the repo on a Windows machine (or with `core.autocrlf=true`) and run all `.sh` scripts — CRLF failures only appear on Windows
- [ ] **Error paths:** Test every skill with an invalid/missing API key — the error message should be human-readable, not a raw JSON dump
- [ ] **Binary output:** Download a generated image/audio/video file and verify it opens correctly — a 200 OK with an error JSON body saved as `.mp3` is a silent failure
- [ ] **Provider deprecation:** Check each hardcoded model name against the provider's changelog for the last 6 months
- [ ] **disable-model-invocation:** Verify that all skills with API side effects have `disable-model-invocation: true` set — test by asking Claude "generate an image of X" without the slash command
- [ ] **Setup idempotency:** Run `/pocket-knife:setup` twice in a row and verify it does not duplicate entries or overwrite existing valid keys
- [ ] **Skills visibility:** After installing with all 85 skills, type `/` in Claude Code and count visible skills — missing skills indicate budget overflow

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Skills budget overflow with 85 monolithic skills | HIGH | Restructure into category sub-plugins (image, video, audio, etc.) — requires plugin.json redesign and all skill directory moves |
| CRLF line endings affecting all scripts | LOW | Run `git add --renormalize .` after adding `.gitattributes`; scripts fixed without content changes |
| Provider API breaking change (one skill) | LOW | Update model name or endpoint in one SKILL.md; test; release patch |
| Provider API breaking change (all skills for one provider) | MEDIUM | Update all skills for that provider; test; release minor version |
| API key leaked via skill output | HIGH | User must rotate all exposed keys immediately; audit skill for the logging pattern; patch and release |
| `.env` loader causes shell conflicts | MEDIUM | Remove shell RC hook from setup instructions; document manual approach; release patch |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Skills budget overflow | Phase 1: Architecture — design category-split plugin structure | Count skills per plugin; verify none exceeds 25 skills; test `/` autocomplete shows all skills |
| API key leakage | Phase 1: Loader — write loader with security contract | Test with `set -x` in debug mode; grep all scripts for echo/print of env variables |
| CRLF line endings | Phase 1: Repository setup — add `.gitattributes` | Clone on Windows, run all `.sh` files; CI check for CRLF in `.sh` files |
| Over-broad skill triggering | Phase 2: First skill port — establish invocation policy | Test each skill: ask Claude a natural-language variant without slash command; verify it does NOT auto-trigger for side-effect skills |
| Provider API breaking changes | Phase 2: First port — establish VERSIONS.md; Phase 5: Smoke tests | VERSIONS.md present for each skill; smoke-test script covers all providers |
| curl masking HTTP errors | Phase 2: First port — establish script template with `-f` flag | Test each script with invalid key; verify non-zero exit code and human-readable error |
| SKILL.md over 500 lines | Phase 2: First port — enforce template | `wc -l` check in CI; pre-commit hook blocking files over 500 lines |
| `.env` loader scope issues | Phase 1: Loader design — lazy-source strategy | Test terminal startup time before/after install; verify keys not visible in `env` from unrelated shells |

---

## Sources

- [Extend Claude with skills — Claude Code official docs](https://code.claude.com/docs/en/skills) (HIGH confidence)
- [Skill authoring best practices — Claude API platform docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) (HIGH confidence)
- [The Invisible Limitations of Claude Code Skills — AI in Testing #9, Medium](https://medium.com/@cheparsky/ai-in-testing-9-the-invisible-limitations-of-claude-code-skills-you-didnt-know-f3adbdcf3680) (MEDIUM confidence)
- [User skills fully loaded into context issue — anthropics/claude-code GitHub Issues #16616](https://github.com/anthropics/claude-code/issues/16616) (HIGH confidence — official issue tracker)
- [ElevenLabs Changelog — breaking changes and deprecations](https://elevenlabs.io/docs/changelog) (HIGH confidence)
- [ElevenLabs December 8 2025 changelog — v1 TTS deprecation](https://elevenlabs.io/docs/changelog/2025/12/8) (HIGH confidence)
- [fal.ai changelog — camelCase parameter migration](https://docs.fal.ai/changelog) (MEDIUM confidence)
- [GitHub Secret Leaks — 13M credentials in public repos, Medium](https://medium.com/@instatunnel/github-secret-leaks-the-13-million-api-credentials-sitting-in-public-repos-1a3babfb68b1) (MEDIUM confidence)
- [API Key Best Practices — Anthropic Help Center](https://support.claude.com/en/articles/9767949-api-key-best-practices-keeping-your-keys-safe-and-secure) (HIGH confidence)
- [Shell script line endings — WSL GitHub Discussion](https://github.com/Vampire/setup-wsl/discussions/20) (HIGH confidence)
- [How to Handle API Rate Limits — Truto Blog](https://truto.one/blog/best-practices-for-handling-api-rate-limits-and-retries-across-multiple-third-party-apis) (MEDIUM confidence)
- [inference.sh skills repository — MIT license, original skill structure](https://github.com/inference-sh/skills) (HIGH confidence)
- [How to Build Claude Code Plugins — DataCamp tutorial](https://www.datacamp.com/tutorial/how-to-build-claude-code-plugins) (MEDIUM confidence)
- [Claude Code Skills vs MCP vs Plugins guide 2026 — Morphllm](https://www.morphllm.com/claude-code-skills-mcp-plugins) (MEDIUM confidence)

---
*Pitfalls research for: Claude Code Plugin — Direct-API-Call Skill Collection*
*Researched: 2026-03-25*
