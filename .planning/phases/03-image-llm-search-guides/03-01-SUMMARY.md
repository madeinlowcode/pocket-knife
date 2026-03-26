---
phase: 03-image-llm-search-guides
plan: 01
subsystem: image-skills
tags: [gemini, fal-ai, async-polling, image-generation]
dependency_graph:
  requires: []
  provides: [IMG-02, IMG-03, IMG-04, IMG-05, IMG-06]
  affects: []
tech_stack:
  added: []
  patterns: [Gemini generateContent + inline_data extractor, fal.ai queue async polling + Authorization Key]
key_files:
  created:
    - skills/image/nano-banana/SKILL.md (114 lines)
    - skills/image/nano-banana-2/SKILL.md (113 lines)
    - skills/image/flux-image/SKILL.md (144 lines)
    - skills/image/image-upscaling/SKILL.md (147 lines)
    - skills/image/background-removal/SKILL.md (144 lines)
  modified: []
decisions:
  - "Gemini native image uses inline_data extractor (candidates[].content.parts[].inline_data.data), NOT bytesBase64Encoded used by Imagen 4"
  - "fal.ai queue uses Authorization: Key $FAL_KEY header, NOT Bearer token (common pitfall)"
  - "fal.ai async jobs require polling loop with request_id extraction and empty-check guard"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-26T14:36:00Z"
---

# Phase 03 Plan 01: 5 Image Skills — Summary

## One-liner

5 image generation skills created: 2 Gemini native (nano-banana, nano-banana-2) with inline_data extractor, and 3 fal.ai async polling (flux-image, image-upscaling, background-removal) with Key auth.

## What Was Built

### Skills Created (5 total)

| Skill | Model ID | Lines | Key Pattern |
|-------|----------|-------|-------------|
| `nano-banana` | `gemini-3-pro-image-preview` | 114 | Gemini native + inline_data |
| `nano-banana-2` | `gemini-3.1-flash-image-preview` | 113 | Gemini native + inline_data |
| `flux-image` | `fal-ai/flux/schnell` | 144 | fal.ai async + prompt input |
| `image-upscaling` | `fal-ai/topaz/upscale/image` | 147 | fal.ai async + image_url input |
| `background-removal` | `fal-ai/birefnet` | 144 | fal.ai async + image_url + model param |

## Patterns Established

### Pattern 1: Gemini Native Image (inline_data extractor)

Both nano-banana skills use the `generateContent` endpoint with `responseModalities: ["TEXT", "IMAGE"]`. Critical difference from Imagen 4 (Phase 2):
- Imagen 4 returns: `data['predictions'][0]['bytesBase64Encoded']`
- Gemini native returns: `data['candidates'][0]['content']['parts'][N]['inline_data']['data']`

The inline_data extractor loops through `parts` array checking for `'inline_data' in part`, then extracts `part['inline_data']['data']`.

### Pattern 2: fal.ai Async Queue Polling

All 3 fal.ai skills follow the same 4-step pattern:
1. **Submit** POST to `https://queue.fal.run/${MODEL_ID}` with `Authorization: Key $FAL_KEY`
2. **Extract** `request_id` via python3 JSON parsing with empty-check guard (`if [ -z "$REQUEST_ID" ]`)
3. **Poll** GET to status endpoint every `POLL_INTERVAL` seconds up to `MAX_WAIT`
4. **Download** GET result endpoint, extract image URL, curl to output file

Critical auth detail: `Authorization: Key $FAL_KEY` (not `Bearer`).

### Parameters by Skill

- **flux-image**: `prompt` + `image_size` (square_hd default) + `num_inference_steps: 4`
- **image-upscaling**: `image_url` + `scale` (2 default); uses `image.image.url` in result extraction
- **background-removal**: `image_url` + `model: "General Use (Light)"`

## Pitfalls Confirmed

- **inline_data vs bytesBase64Encoded**: Both nano-banana skills have explicit comment in Python extractor explaining the correct path
- **Authorization: Key vs Bearer**: All 3 fal.ai skills use `Authorization: Key $FAL_KEY` with explicit Key prefix (not Bearer)
- **request_id extraction guard**: All fal.ai skills check `if [ -z "$REQUEST_ID" ]` after python3 extraction before proceeding to polling

## Verification Results

```
All 5 files exist in skills/image/ subdirectories
All 5 files have allowed-tools: Bash(curl *)
All 5 files under 300 lines (total 662 lines)
nano-banana/nano-banana-2: inline_data extractor confirmed
All 3 fal.ai: Authorization: Key confirmed
```

## Deviations from Plan

None — plan executed exactly as written.

## Commits

- `447c868` feat(03-01): add nano-banana and nano-banana-2 skills with Gemini native inline_data extractor
- `8b387a1` feat(03-01): add fal.ai async polling skills — flux-image, image-upscaling, background-removal

## Self-Check

All 5 SKILL.md files exist at correct paths with correct content and line counts. Git log shows both commits present.