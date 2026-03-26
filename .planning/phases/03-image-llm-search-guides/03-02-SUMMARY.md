---
phase: 03-image-llm-search-guides
plan: "02"
subsystem: image-generation
tags: [fal-ai, dashscope, qwen, async-polling, bearer-token, image-api]

# Dependency graph
requires:
  - phase: 02-validation-batch
    provides: Script loader, error handling patterns, curl --fail-with-body pattern
provides:
  - 3 image generation skills: p-image (fal.ai/Pruna), qwen-image-2 (DashScope), qwen-image-2-pro (DashScope)
affects:
  - phase: 03 (image-llm-search-guides) - completes IMG-07, IMG-08, IMG-09
  - setup skill - requires DASHSCOPE_API_KEY question addition

# Tech tracking
tech-stack:
  added: [DASHSCOPE_API_KEY env var]
  patterns:
    - fal.ai async polling queue pattern (Key auth, request_id extraction, status polling)
    - DashScope synchronous generation (Bearer auth, output.choices extraction)
    - Size format with asterisk for DashScope (1024*1024)

key-files:
  created:
    - skills/image/p-image/SKILL.md - Pruna P-Image via fal.ai async queue
    - skills/image/qwen-image-2/SKILL.md - Qwen Image 2.0 via DashScope
    - skills/image/qwen-image-2-pro/SKILL.md - Qwen Image 2.0 Pro via DashScope
  modified: []

key-decisions:
  - "fal.ai uses Authorization: Key (not Bearer) - distinct from other providers"
  - "DashScope synchronous (no polling) vs fal.ai async (polling) - different workflows"
  - "DASHSCOPE_API_KEY introduced as new env var not used in prior phases"
  - "p-image model ID provisional - note added to verify at fal.ai/models on 404"

patterns-established:
  - "Pattern: fal.ai async queue with Key auth, MAX_WAIT=120, POLL_INTERVAL=3"
  - "Pattern: DashScope synchronous with Bearer auth, output.choices extraction"

requirements-completed: [IMG-07, IMG-08, IMG-09]

# Metrics
duration: 5min
completed: 2026-03-26
---

# Phase 03 Plan 02: Image Skills (p-image, qwen-image-2, qwen-image-2-pro) Summary

**3 image generation skills via fal.ai Pruna (async) and Alibaba DashScope Qwen (synchronous), introducing DASHSCOPE_API_KEY**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-26T14:30:00Z
- **Completed:** 2026-03-26T14:35:00Z
- **Tasks:** 2
- **Files created:** 3 SKILL.md files

## Accomplishments

- p-image skill via fal.ai Pruna async queue with provisional model ID note
- qwen-image-2 skill via DashScope International synchronous API
- qwen-image-2-pro skill (same DashScope, higher quality model)
- DASHSCOPE_API_KEY env var introduced (not used in prior phases)

## Task Commits

Each task was committed atomically:

1. **Task 1: p-image via fal.ai Pruna** - `69c7396` (feat)
2. **Task 2: qwen-image-2 and qwen-image-2-pro via DashScope** - `42fd328` (feat)

## Files Created/Modified

- `skills/image/p-image/SKILL.md` - Pruna P-Image via fal.ai async queue, 148 lines
- `skills/image/qwen-image-2/SKILL.md` - Qwen Image 2.0 via DashScope, 121 lines
- `skills/image/qwen-image-2-pro/SKILL.md` - Qwen Image 2.0 Pro via DashScope, 121 lines

## Decisions Made

- fal.ai uses `Authorization: Key $FAL_KEY` (not Bearer like other providers)
- DashScope uses `Authorization: Bearer $DASHSCOPE_API_KEY` with synchronous response
- Size format uses asterisk: `1024*1024` (not x or /)
- p-image model ID `fal-ai/pruna/p-image` is provisional - 404 error handling with verification link added
- Both Qwen skills extract image URL via `output.choices[N].message.content[N].image`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed malformed JSON in p-image curl request**
- **Found during:** Task 1 (p-image creation)
- **Issue:** JSON payload had unclosed quote: `{"prompt": "$PROMPT}` instead of `{"prompt": "$PROMPT"}`
- **Fix:** Added missing `\"` to close the prompt string value
- **Files modified:** skills/image/p-image/SKILL.md
- **Verification:** Grep confirmed proper JSON structure
- **Committed in:** 69c7396 (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Bug fix necessary for skill to function correctly. No scope change.

## Issues Encountered

None - plan executed as specified with one auto-fix.

## User Setup Required

**DASHSCOPE_API_KEY required for qwen-image-2 and qwen-image-2-pro.** Add to `/pocket-knife:setup` when configuring Alibaba DashScope skills:
- Get key at: https://dashscope.aliyuncs.com
- Add `DASHSCOPE_API_KEY=your_key` to `~/.claude/.env`

## Next Phase Readiness

- Phase 03-03 (guide skills) can proceed independently - no image skill dependencies
- IMG-07, IMG-08, IMG-09 requirements marked complete
- Skills ready for manual validation with real API keys

---
*Phase: 03-image-llm-search-guides*
*Plan: 03-02*
*Completed: 2026-03-26*