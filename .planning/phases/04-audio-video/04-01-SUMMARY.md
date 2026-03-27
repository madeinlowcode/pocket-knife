---
phase: 04-audio-video
plan: 01
subsystem: audio
tags: [elevenlabs, stt, dialogue, sound-effects, audio, pattern-1, pattern-3]
dependency_graph:
  requires: []
  provides:
    - skill: elevenlabs-stt
      pattern: Pattern 3 (multipart -> JSON)
      endpoint: POST /v1/speech-to-text
      model: scribe_v2
    - skill: elevenlabs-dialogue
      pattern: Pattern 1 (JSON -> binary)
      endpoint: POST /v1/text-to-dialogue
      model: eleven_v3
    - skill: elevenlabs-sound-effects
      pattern: Pattern 1 (JSON -> binary)
      endpoint: POST /v1/sound-generation
tech_stack:
  added:
    - curl (--fail-with-body for JSON responses)
    - curl (-f --output for binary responses)
    - python3 JSON parsing
  patterns:
    - Pattern 1: JSON body -> binary output (curl -f --output)
    - Pattern 3: multipart upload -> JSON response (curl --fail-with-body)
key_files:
  created:
    - skills/audio/elevenlabs-stt/SKILL.md (87 lines)
    - skills/audio/elevenlabs-dialogue/SKILL.md (82 lines)
    - skills/audio/elevenlabs-sound-effects/SKILL.md (70 lines)
decisions:
  - id: "1"
    decision: "STT uses --fail-with-body (not -f) because response is JSON, not binary"
    rationale: "JSON responses need --fail-with-body to capture error body on failure; -f would hide the JSON error message"
  - id: "2"
    decision: "Dialogue and Sound Effects use -f (not --fail-with-body) because response is binary MP3"
    rationale: "Binary responses use -f with --output; --fail-with-body would corrupt the binary stream with error body"
  - id: "3"
    decision: "Model eleven_v3 for dialogue (not deprecated eleven_monolingual_v1)"
    rationale: "eleven_monolingual_v1 is deprecated per ElevenLabs docs; eleven_v3 is current model"
  - id: "4"
    decision: "STT sends file OR source_url, never both"
    rationale: "Pitfall 6 from research: API returns 422 if both fields are sent simultaneously"
metrics:
  duration: "~3 minutes"
  completed_date: "2026-03-26T15:36:00Z"
  tasks_completed: 3
  files_created: 3
---

# Phase 04 Plan 01 Summary: ElevenLabs STT, Dialogue, and Sound Effects Skills

## One-liner

Three ElevenLabs audio skills established: STT (multipart->JSON), Dialogue (JSON->binary), and Sound Effects (JSON->binary) — implementing Pattern 1 and Pattern 3 from Phase 4 research.

## What Was Built

### Skills Created

| Skill | Pattern | Endpoint | Model |
|-------|---------|----------|-------|
| elevenlabs-stt | Pattern 3: multipart -> JSON | `/v1/speech-to-text` | scribe_v2 |
| elevenlabs-dialogue | Pattern 1: JSON -> binary | `/v1/text-to-dialogue` | eleven_v3 |
| elevenlabs-sound-effects | Pattern 1: JSON -> binary | `/v1/sound-generation` | N/A (prompt-based) |

### Implementation Patterns Established

**Pattern 1 (JSON -> binary):** Used by dialogue and sound-effects
- `curl -f -s -X POST` with `-H "Content-Type: application/json"` and `-d '{...}'`
- `--output "$FILE"` to save binary response
- `[ ! -s "$FILE" ]` check after curl to verify non-empty output

**Pattern 3 (multipart -> JSON):** Used by STT
- `curl --fail-with-body -s -X POST` (NOT `-f` because response is JSON)
- `-F "file=@${AUDIO_FILE}"` for multipart upload
- `RESPONSE=$(...)` captures JSON output for python3 parsing

### Key Decisions

1. **STT uses `--fail-with-body` (not `-f`)** — Response is JSON, need to see error body on failure
2. **Dialogue/Sound-Effects use `-f` (not `--fail-with-body`)** — Response is binary MP3, error body would corrupt file
3. **Model `eleven_v3` for dialogue** — Replaces deprecated `eleven_monolingual_v1`
4. **STT sends file OR source_url, never both** — API returns 422 on simultaneous submission

### Error Handling

All 3 skills include:
- API key check with message pointing to `/pocket-knife:setup`
- File existence validation (elevenlabs-stt)
- Non-empty output file verification after curl
- Human-readable error messages for common failure modes

## Verification Results

All static checks passed:

```
grep "disable-model-invocation: true" skills/audio/elevenlabs-*/SKILL.md
  -> 3 files (stt, dialogue, sound-effects)

grep "curl -f" skills/audio/elevenlabs-dialogue/SKILL.md
  -> Found (binary response)

grep "curl -f" skills/audio/elevenlabs-sound-effects/SKILL.md
  -> Found (binary response)

grep "eleven_monolingual_v1" skills/audio/elevenlabs-*/SKILL.md | wc -l
  -> 0 (no deprecated models)
```

## Deviations from Plan

None — plan executed exactly as written.

## Commits

- `cdddad6` feat(04-01): add elevenlabs-stt skill with Pattern 3 multipart->JSON
- `c69db09` feat(04-01): add elevenlabs-dialogue skill with Pattern 1 JSON->binary
- `df11d7f` feat(04-01): add elevenlabs-sound-effects skill with Pattern 1 JSON->binary

## Requirements Satisfied

| Requirement | Status |
|-------------|--------|
| AUD-02 (elevenlabs-stt) | Complete — Pattern 3, multipart->JSON, scribe_v2 |
| AUD-03 (elevenlabs-dialogue) | Complete — Pattern 1, JSON->binary, eleven_v3 |
| AUD-04 (elevenlabs-sound-effects) | Complete — Pattern 1, JSON->binary |
| AUD-10 (disable-model-invocation on all ElevenLabs) | Complete — all 3 skills have `disable-model-invocation: true` |

## Self-Check: PASSED

- [x] All 3 SKILL.md files created in correct directories
- [x] All files contain `disable-model-invocation: true`
- [x] elevenlabs-stt uses `--fail-with-body` (Pattern 3)
- [x] elevenlabs-dialogue uses `-f` with `eleven_v3` model (Pattern 1)
- [x] elevenlabs-sound-effects uses `-f` with `/v1/sound-generation` (Pattern 1)
- [x] No deprecated `eleven_monolingual_v1` model present
- [x] All 3 commits created with proper feat(04-01) prefix
- [x] No deviations from plan
