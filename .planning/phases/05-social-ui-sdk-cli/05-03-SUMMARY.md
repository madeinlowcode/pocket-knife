---
phase: 05-social-ui-sdk-cli
plan: 03
subsystem: infra
tags: [nodejs, esm, cli, inquirer, chalk, dotenv, fs-extra, api-keys, setup]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: ~/.claude/.env structure and SessionStart hook for env loading
provides:
  - cli/package.json (ESM package with bin field for npx pocket-knife)
  - cli/bin/init.js (entry point with shebang, interactive flow)
  - cli/lib/prompts.js (selectCategories, promptKeys using @inquirer/prompts)
  - cli/lib/validate.js (validateKey for Google, ElevenLabs, Tavily, Exa, DashScope)
  - cli/lib/env-writer.js (mergeEnv for safe ~/.claude/.env updates)
  - cli/lib/categories.json (6 categories with provider env var manifests)
affects:
  - Phase 5 completion (SETUP-01, SETUP-04 requirements)
  - Any future skill that needs API key configuration

# Tech tracking
tech-stack:
  added:
    - "@inquirer/prompts@^8.3.2" (ESM-native interactive prompts)
    - "chalk@^5.6.2" (terminal color output)
    - "dotenv@^17.3.1" (env file parsing)
    - "fs-extra@^11.3.4" (cross-platform file operations)
  patterns:
    - ESM CLI package with shebang #!/usr/bin/env node on line 1
    - Merge-only .env writes (append, never overwrite existing keys)
    - Per-provider API key validation with timeout and save-anyway fallback
    - Category-driven key collection (select categories first, then prompt per-provider)

key-files:
  created:
    - cli/package.json - ESM module with bin: {"pocket-knife": "./bin/init.js"}
    - cli/bin/init.js - Entry point: shebang line 1, Node 18+ check, existing keys read, category select, key prompt, validation, merge, summary
    - cli/lib/prompts.js - selectCategories() (checkbox), promptKeys() (password with validate)
    - cli/lib/validate.js - validateKey(envVarName, key) with 8s timeout via AbortController
    - cli/lib/env-writer.js - mergeEnv(newKeys) reads existing, skips present keys, appends new
    - cli/lib/categories.json - 6 categories (image, audio, video, llm, search, social)

key-decisions:
  - "ESM type:module in package.json required for @inquirer/prompts (ESM-only) and shebang imports"
  - "FAL_KEY and X_* keys skipped during validation (no free endpoint for FAL, OAuth complexity for X)"
  - "appendFileSync used instead of shell echo — avoids special character escaping failures on Windows/Git Bash"
  - "mergeEnv only appends missing keys — existing ~/.claude/.env values preserved"

patterns-established:
  - "ESM CLI pattern: package.json type:module + bin field + #!/usr/bin/env node shebang on line 1"
  - "Safe .env mutation: read -> parse -> filter existing -> append new (never overwrite)"
  - "Validation with graceful degradation: valid -> save, invalid -> confirm save, skipped -> note"

requirements-completed: [SETUP-01, SETUP-04]

# Metrics
duration: 3min
completed: 2026-03-26
---

# Phase 05 Plan 03: CLI npx pocket-knife init — Interactive API Key Setup

**ESM Node.js CLI with interactive category selection, per-provider key validation, and safe ~/.claude/.env merge**

## Performance

- **Duration:** 3 min (189 seconds)
- **Started:** 2026-03-26T18:34:32Z
- **Completed:** 2026-03-26T18:37:41Z
- **Tasks:** 2
- **Files created:** 6

## Accomplishments

- Created complete `npx pocket-knife init` CLI as ESM Node.js package with `cli/` subdirectory
- Interactive flow: category checkbox selection -> per-provider key prompts -> validation with 8s timeout -> safe merge to `~/.claude/.env`
- Validates keys for Google (models endpoint), ElevenLabs (user endpoint), Tavily (search), Exa (search), DashScope (models); skips FAL and X_*
- Never overwrites existing keys in `~/.claude/.env` — only appends new keys

## Task Commits

Each task was committed atomically:

1. **Task 1: CLI package.json + categories.json + env-writer.js** - `404890c` (feat)
2. **Task 2: CLI prompts.js + validate.js + bin/init.js** - `6ed32d9` (feat)

**Plan metadata:** `e0739c0` (docs: phase 5 plans)

## Files Created/Modified

- `cli/package.json` - ESM package with bin field and dependencies (@inquirer/prompts, chalk, dotenv, fs-extra)
- `cli/bin/init.js` - Entry point with #!/usr/bin/env node shebang (line 1), full interactive flow
- `cli/lib/prompts.js` - selectCategories() (checkbox) and promptKeys() (password with validation)
- `cli/lib/validate.js` - validateKey() covering Google, ElevenLabs, Tavily, Exa, DashScope; skips FAL_KEY and X_*
- `cli/lib/env-writer.js` - mergeEnv() reads existing ~/.claude/.env, skips present keys, appends new keys safely
- `cli/lib/categories.json` - 6 categories (image, audio, video, llm, search, social) with provider manifest

## Decisions Made

- Used `appendFileSync` instead of shell echo to avoid special character escaping failures on Windows/Git Bash (per RESEARCH pitfall 3)
- Skipped FAL_KEY and X_* validation — FAL has no free validation endpoint, X OAuth requires 4-credential HMAC-SHA1 signing
- Graceful degradation on validation failure: warns user, offers "Save anyway?" instead of blocking

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

**External services require manual configuration:**
- npm publish required for `npx pocket-knife init` to work globally
- Until published: run locally with `node cli/bin/init.js`
- Verify with: `node --check cli/bin/init.js` (syntax smoke test)

## Next Phase Readiness

- CLI is complete (SETUP-01, SETUP-04 requirements fulfilled)
- Phase 05 has 1 remaining plan (05-02: UI skills)
- All Phase 5 plans will complete the social, UI, SDK, and CLI requirements

---
*Phase: 05-social-ui-sdk-cli*
*Completed: 2026-03-26*
