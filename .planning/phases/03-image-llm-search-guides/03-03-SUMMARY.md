---
phase: 03-image-llm-search-guides
plan: 03
subsystem: guides
tags: [guides, prompting, design, video, writing, social-media, product, content]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Plugin structure, skills directory layout, SessionStart hook
  - phase: 02-validation-batch
    provides: Standard skill patterns, allowed-tools convention
provides:
  - 7 guide skills (prompting-guide, design-guide, video-guide, writing-guide, social-guide, product-guide, content-guide)
affects:
  - Phase 4 (audio/video guides if needed)
  - Phase 5 (social/SDK/CLI guides if needed)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Guide skill pattern: allowed-tools: [], disable-model-invocation: false, description < 100 chars, body < 300 lines
    - Content consolidation: Multiple sub-guides merged into single guide skill with key frameworks and tables

key-files:
  created:
    - skills/guides/prompting-guide/SKILL.md
    - skills/guides/design-guide/SKILL.md
    - skills/guides/video-guide/SKILL.md
    - skills/guides/writing-guide/SKILL.md
    - skills/guides/social-guide/SKILL.md
    - skills/guides/product-guide/SKILL.md
    - skills/guides/content-guide/SKILL.md
  modified: []

key-decisions:
  - "Guide skills use allowed-tools: [] (no curl, no Bash) - pure reference content"
  - "Consolidated 30+ inference.sh sub-guides into 7 comprehensive guide skills"
  - "Each guide includes actionable frameworks, tables, and examples without CLI commands"

patterns-established:
  - "Guide skill pattern: allowed-tools: [] + disable-model-invocation: false + description < 100 chars + body < 300 lines"
  - "Content consolidation pattern: extract best frameworks/tables from multiple sub-guides into single SKILL.md"

requirements-completed: [GUIDE-01, GUIDE-02, GUIDE-03, GUIDE-04, GUIDE-05, GUIDE-06, GUIDE-07]

# Metrics
duration: 4min
completed: 2026-03-26
---

# Phase 03 Plan 03 Summary

**7 guide skills created covering prompting, design, video, writing, social, product, and content — all zero-API-key reference documents with actionable frameworks**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-26T14:35:58Z
- **Completed:** 2026-03-26T14:40:15Z
- **Tasks:** 2
- **Files modified:** 7 (all created)

## Accomplishments

- 7 guide skills created in skills/guides/ with consolidated content from 30+ inference.sh sub-guides
- All guides follow zero-API-key pattern (allowed-tools: [], no curl, no Bash)
- All descriptions under 100 chars (max: 84 chars for prompting-guide)
- All bodies under 100 lines (max: 95 lines for product-guide)
- Guides contain actionable frameworks, tables, and examples without infsh commands

## Task Commits

Each task was committed atomically:

1. **Task 1: Create prompting-guide, design-guide, video-guide** - `3713c6d` (feat)
2. **Task 2: Create writing-guide, social-guide, product-guide, content-guide** - `b4b41d6` (feat)

## Files Created

| File | Description | Lines | Chars (desc) |
|------|-------------|-------|--------------|
| skills/guides/prompting-guide/SKILL.md | LLM/image/video prompting frameworks | 89 | 84 |
| skills/guides/design-guide/SKILL.md | Logo, OG image, landing page, thumbnail guides | 89 | 71 |
| skills/guides/video-guide/SKILL.md | Shot types, storyboard, ad specs reference | 87 | 72 |
| skills/guides/writing-guide/SKILL.md | Blog, case study, newsletter, press release, SEO | 93 | 74 |
| skills/guides/social-guide/SKILL.md | LinkedIn, Twitter threads, carousels, batch workflow | 85 | 72 |
| skills/guides/product-guide/SKILL.md | Competitor teardown, personas, changelog, Product Hunt | 95 | 76 |
| skills/guides/content-guide/SKILL.md | AI content pipeline, podcast, product photography | 79 | 75 |

## Guide Content Summary

| Guide | Key Content |
|-------|-------------|
| prompting-guide | Role+Task+Constraints+Output formula, chain-of-thought, few-shot, image/video prompt formulas |
| design-guide | Color psychology, OG image layout, landing page sections, YouTube thumbnail formula, app store strategy |
| video-guide | 9 shot types, AI video prompt formula, 5-scene storyboard, talking head checklist, ad specs by platform |
| writing-guide | Headline formulas, case study template, newsletter format, press release structure, SEO brief |
| social-guide | LinkedIn post format, hook formulas, Twitter thread structure, 10-slide carousel formula, repurposing matrix |
| product-guide | Competitor teardown framework, persona template, changelog format, Product Hunt launch timeline |
| content-guide | 6-step AI content pipeline, repurposing automation flow, podcast episode structure, product photography prompts |

## Decisions Made

- Guide skills use allowed-tools: [] (no curl, no Bash) - pure reference content
- Consolidated 30+ inference.sh sub-guides into 7 comprehensive guide skills
- Each guide includes actionable frameworks, tables, and examples without infsh commands
- skills/guides/ directory already existed with .gitkeep - no structural changes needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - guide skills are zero-API-key documents. No external configuration required.

## Next Phase Readiness

- 7/7 guide skills complete and verified
- Ready for Phase 3 completion (03-01 and 03-02 image skills already completed)
- All GUIDE-* requirements (GUIDE-01 through GUIDE-07) satisfied

---
*Phase: 03-image-llm-search-guides*
*Plan: 03*
*Completed: 2026-03-26*