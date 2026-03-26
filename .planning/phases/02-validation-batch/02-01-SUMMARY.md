---
phase: 02-validation-batch
plan: 01
subsystem: api-skills
tags: [google-api, imagen4, llm-routing, tavily, exa, curl, error-handling]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "scripts/load-env.sh (SessionStart hook), commands/setup.md (/pocket-knife:setup), skills/ structure"
provides:
  - "skills/image/ai-image-generation/SKILL.md — Imagen 4 generation via x-goog-api-key"
  - "skills/llm/llm-models/SKILL.md — Multi-provider LLM routing (Anthropic, Gemini, Kimi, GLM)"
  - "skills/search/web-search/SKILL.md — Dual-provider search (Tavily + Exa)"
affects:
  - "Phase 02-02 (elevenlabs-tts, google-veo skills)"
  - "Phase 03 (all image, LLM, search skills that will reuse these patterns)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pattern 1: Image generation with base64 temp file (avoids line-length issues)"
    - "Pattern 2: Multi-provider routing via case statement with first-available key"
    - "Pattern 3: Dual-provider fallback (Tavily primary, Exa fallback)"
    - "QUAL-03: curl --fail-with-body with case \$EXIT_CODE (0, 22, 6, 7) for all skills"

key-files:
  created:
    - "skills/image/ai-image-generation/SKILL.md"
    - "skills/llm/llm-models/SKILL.md"
    - "skills/search/web-search/SKILL.md"

key-decisions:
  - "Used temp file (/tmp/imagen_response_$$.json) for base64 response to avoid line-length issues (Pitfall 6)"
  - "Multi-provider routing uses first-available key with explicit fallback order (Anthropic > Gemini > Kimi > GLM)"
  - "disable-model-invocation: false on all three skills — user invokes explicitly for content generation"

patterns-established:
  - "Pattern: Image API skill (IMG-01) — curl + python3 base64 decode with temp file"
  - "Pattern: LLM multi-provider routing — case-based routing with key availability check"
  - "Pattern: Search dual-provider — Tavily with Exa fallback, distinct auth headers"
  - "QUAL-03 error handling: --fail-with-body, case \$EXIT_CODE, categorized error messages"

requirements-completed: [IMG-01, LLM-01, SRCH-01, QUAL-03]

# Metrics
duration: 4min
completed: 2026-03-26
---

# Phase 02 Plan 01: Validation Batch (Wave 1) Summary

**Three validation skills established round-trip env loader -> curl -> API for distinct auth patterns: x-goog-api-key (Imagen 4), multi-provider LLM routing, and Tavily+Exa dual-provider search.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-26T14:08:49Z
- **Completed:** 2026-03-26T14:12:36Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Established Imagen 4 (imagen-4.0-generate-001) skill with x-goog-api-key authentication and python3 base64 decoding via temp file
- Established LLM multi-provider routing skill with 4 providers (Anthropic, Gemini, Kimi, GLM) and explicit error categorization
- Established Tavily+Exa dual-provider search skill with Bearer and x-api-key distinct auth patterns
- All three skills follow QUAL-03 error handling pattern with --fail-with-body and case-based exit code handling

## Task Commits

Each task was committed atomically:

1. **Task 1: Criar skill ai-image-generation (IMG-01)** - `9d37b74` (feat)
2. **Task 2: Criar skill llm-models (LLM-01)** - `3d0b00e` (feat)
3. **Task 3: Criar skill web-search (SRCH-01)** - `23df806` (feat)

## Files Created/Modified

- `skills/image/ai-image-generation/SKILL.md` — Image generation via Google Imagen 4 with x-goog-api-key, temp file base64 decode
- `skills/llm/llm-models/SKILL.md` — Multi-provider LLM routing with 4 providers (Anthropic, Gemini, Kimi, GLM)
- `skills/search/web-search/SKILL.md` — Tavily primary + Exa fallback search with distinct auth headers

## Decisions Made

- Used python3 inline script for base64 decode instead of shell piping to avoid line-length issues (Pitfall 6 from RESEARCH.md)
- disable-model-invocation: false on all three skills — user explicitly invokes for content generation (unlike setup/guidance skills)
- No disable-model-invocation on llm-models despite API call — user expects direct invocation for chat

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Phase 02-02 skills (elevenlabs-tts, google-veo) can reuse the established patterns:
  - elevenlabs-tts: binary output pattern via -f and --output (Pattern 2 from RESEARCH.md)
  - google-veo: async polling with operation-name tracking (more complex, needs gcloud auth)
- QUAL-03 pattern established here should be copied verbatim to all future skills

---
*Phase: 02-validation-batch*
*Plan: 02-01*
*Completed: 2026-03-26*
