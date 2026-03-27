---
name: ai-automation-workflows
description: "AI workflow design. Chaining skills, batch processing, error handling in multi-step pipelines."
allowed-tools: []
disable-model-invocation: false
---

# AI Automation Workflow Guide

This guide covers how to chain multiple Pocket-Knife skills together into reliable multi-step pipelines.

## Core Principles

**1. Each skill produces a file or structured output** — the output of one skill becomes the input of the next.

**2. Use absolute paths throughout** — skills that write files need absolute paths; skills that read images need public URLs (upload intermediate files to a public host when required).

**3. Fail fast at each step** — verify each output before passing it to the next skill. An empty or corrupt file passed forward causes confusing errors later.

**4. Name outputs descriptively** — use timestamps or meaningful names to avoid overwriting files during batch runs.

## Common Pipeline Patterns

### Pattern 1: Image → Animated Video

**Use case:** Turn a product photo or portrait into a short video clip.

```
Step 1: /pocket-knife:background-removal
  Input:  IMAGE_URL = public URL of source image
  Output: ~/Downloads/bg_removed_[timestamp].png

Step 2: Upload the PNG to a public host → get new public URL

Step 3: /pocket-knife:image-to-video
  Input:  IMAGE_URL = public URL from step 2
          PROMPT    = motion description
  Output: ~/Downloads/i2v_[timestamp].mp4
```

**Verify at each step:** Check that the PNG is not empty before uploading; check the MP4 exists and has nonzero size before considering the pipeline complete.

---

### Pattern 2: Script → Voiced Audio + Music

**Use case:** Produce a narrated audio piece with background music.

```
Step 1: /pocket-knife:elevenlabs-tts
  Input:  TEXT = narration script
          VOICE = george
  Output: ~/Downloads/tts_narration.mp3

Step 2: /pocket-knife:elevenlabs-music
  Input:  PROMPT   = background music description
          DURATION = same duration as narration + 5 seconds
  Output: ~/Downloads/music_background.mp3

Step 3: Layer in audio editor (Audacity, DaVinci Resolve)
  - Import both MP3 files
  - Lower music volume to -18dB under voice
  - Export as final mix
```

---

### Pattern 3: Image Generation → Product Photography

**Use case:** Generate e-commerce product images at scale.

```
Step 1: /pocket-knife:ai-image-generation
  Input:  PROMPT = product description + background
  Output: ~/Downloads/product_raw_[timestamp].png

Step 2: /pocket-knife:background-removal
  Input:  IMAGE_URL = public URL of generated image
  Output: ~/Downloads/product_nobg_[timestamp].png

Step 3: /pocket-knife:ai-image-generation (composite prompt)
  Input:  PROMPT = product + new studio background description
  Output: ~/Downloads/product_final_[timestamp].png
```

---

### Pattern 4: Audio Transcription → Dialogue Re-voice

**Use case:** Transcribe an existing recording and re-produce it with different voices.

```
Step 1: /pocket-knife:elevenlabs-stt
  Input:  AUDIO_FILE = ~/recordings/interview.mp3
          DIARIZE    = true
  Output: Transcript with speaker labels

Step 2: Edit transcript (remove fillers, assign voice names to speaker labels)

Step 3: /pocket-knife:elevenlabs-dialogue
  Input:  SEGMENTS = formatted dialogue lines
  Output: ~/Downloads/dialogue_revoiced.mp3
```

## Batch Processing

To process multiple files with the same skill, loop and vary the output filenames:

```bash
# Example: transcribe all MP3s in a folder
for FILE in ~/recordings/*.mp3; do
  BASENAME=$(basename "$FILE" .mp3)
  # Run /pocket-knife:elevenlabs-stt with AUDIO_FILE=$FILE
  # Save transcript to ~/transcripts/${BASENAME}.txt
done
```

**Batch tips:**
- Add a 2–3 second delay between API calls to avoid rate limiting
- Log each step's output file path to a manifest file for later processing
- Process in groups of 5–10 items; do not queue hundreds simultaneously

## Error Handling in Pipelines

| Error scenario | Detection method | Recovery |
|---------------|------------------|----------|
| Empty output file | `[ ! -s "$OUTPUT_FILE" ]` | Stop pipeline; log the step that failed |
| Missing API key | Check `$?` after skill run | Run `/pocket-knife:setup` and restart |
| Public URL expired | HTTP 403/404 on image-to-video | Re-upload to a fresh public URL |
| API rate limit | HTTP 429 response | Wait 30–60 seconds; retry once |
| Corrupt output | File size far below expected | Delete file; re-run that step only |

## Pipeline Design Checklist

Before running a multi-step pipeline:

- [ ] All required API keys are set (`ELEVENLABS_API_KEY`, `FAL_KEY`, `GOOGLE_API_KEY`)
- [ ] Intermediate output directories exist and are writable
- [ ] Images that will be passed to video skills have public HTTPS URLs
- [ ] Output filenames include timestamps to prevent collisions
- [ ] Each step's success condition is verified before proceeding to the next

## Tips for Reliable Pipelines

- **Test each skill individually** before chaining — confirm each one works end-to-end alone first
- **Use descriptive filenames** — `product_bg_removed_20260327.png` is easier to debug than `output2.png`
- **Keep intermediate files** during development — delete them only after the full pipeline succeeds
- **Log everything** — print step name, input, output path, and file size at each stage
