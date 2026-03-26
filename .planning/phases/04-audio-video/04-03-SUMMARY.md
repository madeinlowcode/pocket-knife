---
phase: 04-audio-video
plan: 03
subsystem: video
tags: [video, fal-ai, kling, wan, seedance, async-queue]
dependency_graph:
  requires:
    - 04-RESEARCH.md (fal.ai queue pattern research)
    - skills/video/google-veo/SKILL.md (reference for polling pattern)
  provides:
    - skills/video/ai-video-generation/SKILL.md
    - skills/video/image-to-video/SKILL.md
    - skills/video/p-video/SKILL.md
tech_stack:
  added:
    - fal.ai Kling 1.6 Standard text-to-video queue
    - fal.ai Wan 2.2 5B image-to-video queue
    - fal.ai ByteDance Seedance 1.0 Lite text-to-video queue
  patterns:
    - Async polling queue pattern (POST submit, GET status loop, GET response)
    - Authorization: Key header (not Bearer)
    - MAX_WAIT=300, POLL_INTERVAL=10 for video
    - curl -f --output for binary MP4 download
key_files:
  created:
    - skills/video/ai-video-generation/SKILL.md
    - skills/video/image-to-video/SKILL.md
    - skills/video/p-video/SKILL.md
decisions:
  - "fal.ai uses Authorization: Key $FAL_KEY (not Bearer) — distinct from other providers"
  - "MAX_WAIT=300 (5 min) for video vs 120s for image — video takes 60-180s typically"
  - "Polling interval 10s to avoid rate limiting on queue.fal.run"
  - "image-to-video adds image_url field to submit body; image must be public HTTPS URL"
  - "Seedance 1.0 Lite as economical alternative to Kling 1.6"
metrics:
  duration_minutes: ~
  completed_date: "2026-03-26"
---

# Phase 04 Plan 03: Video Skills via fal.ai Queue

## Summary

Created 3 video generation skills using fal.ai async queue pattern (Pattern 5 from research), completing all video skills for Phase 4.

## What Was Built

### ai-video-generation (Kling 1.6)
Text-to-video via `fal-ai/kling-video/v1.6/standard/text-to-video`. Accepts PROMPT, DURATION (5 or 10s), ASPECT_RATIO (16:9, 9:16, 1:1). Full polling loop waits for COMPLETED before fetching result.

### image-to-video (Wan 2.2 5B)
Image-to-video via `fal-ai/wan/v2.2-5b/image-to-video`. Key difference: submit body includes both `prompt` AND `image_url` (public HTTPS URL required). Animates static image into video clip.

### p-video (Seedance 1.0 Lite)
Text-to-video via `fal-ai/bytedance/seedance/v1/lite/text-to-video`. Fast and economical alternative to Kling. Same queue pattern, different model only.

## Pattern Used (fal.ai Video Async Queue)

Identical across all 3 skills:
1. **POST** `https://queue.fal.run/{MODEL}` with JSON body (prompt + model-specific params)
2. Extract `request_id` from response
3. **GET** `https://queue.fal.run/{MODEL}/requests/{REQUEST_ID}/status` in loop every 10s
4. Break when STATUS = "COMPLETED" or HAS_ERROR
5. **GET** `https://queue.fal.run/{MODEL}/requests/{REQUEST_ID}/response` to get video URL
6. `curl -f --output` to download MP4 binary

Auth: `Authorization: Key $FAL_KEY` (not Bearer token)

## Total Video Skills in Project

| Skill | Model | Type | Provider |
|-------|-------|------|----------|
| google-veo | Veo 3.1 | text-to-video | Google Vertex AI |
| ai-video-generation | Kling 1.6 Standard | text-to-video | fal.ai |
| image-to-video | Wan 2.2 5B | image-to-video | fal.ai |
| p-video | Seedance 1.0 Lite | text-to-video | fal.ai |

## Deviations from Plan

None — plan executed exactly as written.

## Requirements Coverage

| ID | Requirement | Status |
|----|-------------|--------|
| VID-01 | ai-video-generation (fal.ai queue, text-to-video) | Done |
| VID-03 | image-to-video (Wan 2.2, accepts image_url) | Done |
| VID-04 | p-video / additional video skills (Seedance) | Done |
