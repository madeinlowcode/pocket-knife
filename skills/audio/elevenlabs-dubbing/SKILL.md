---
name: elevenlabs-dubbing
description: "Dub video/audio to another language via ElevenLabs. Async job. Requires: ELEVENLABS_API_KEY"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Dub a video or audio file to another language using ElevenLabs dubbing API.
This skill uses async processing - dubbing typically takes 1-10 minutes depending on duration.

Ask the user for:
- SOURCE_URL: public URL of the video/audio to dub (preferred) OR LOCAL_FILE: absolute path to local file
- TARGET_LANG: target language code (e.g. "pt", "es", "fr", "de", "ja", "zh")
- SOURCE_LANG (optional): source language code - default: auto-detect
- OUTPUT_FILE (optional): where to save - default: ~/Downloads/dubbed_[lang]_[timestamp].mp4

**Supported language codes:** en, pt, es, fr, de, it, ja, ko, zh, ar, hi, pl, nl, ru, tr, sv, id

Then run the following steps:

**Step 1 - Check API key:**

```bash
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "ERROR: ELEVENLABS_API_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi

TARGET_LANG="[TARGET_LANGUAGE_CODE]"
SOURCE_LANG="${SOURCE_LANG:-auto}"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/dubbed_${TARGET_LANG}_$(date +%Y%m%d_%H%M%S).mp4}"

# Use source_url (preferred) or local file upload
SOURCE_URL="${SOURCE_URL:-}"
LOCAL_FILE="${LOCAL_FILE:-}"

if [ -z "$SOURCE_URL" ] && [ -z "$LOCAL_FILE" ]; then
  echo "ERROR: Provide either SOURCE_URL (public URL) or LOCAL_FILE (absolute path)."
  exit 1
fi
```

**Step 2 - Create dubbing job:**

```bash
# Source: https://elevenlabs.io/docs/api-reference/dubbing/create
# Step 1 of 3: POST multipart to create async dubbing job
# Use --fail-with-body (response is JSON with dubbing_id)
# Prefer source_url (no upload bandwidth limit); fallback to local file
if [ -n "$SOURCE_URL" ]; then
  SOURCE_FLAG="-F source_url=${SOURCE_URL}"
else
  SOURCE_FLAG="-F file=@${LOCAL_FILE}"
fi

RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://api.elevenlabs.io/v1/dubbing" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "target_lang=${TARGET_LANG}" \
  -F "source_lang=${SOURCE_LANG}" \
  -F "num_speakers=0" \
  $SOURCE_FLAG)

if [ $? -ne 0 ]; then
  echo "ERROR: Failed to create dubbing job."
  echo "Response: $RESPONSE"
  echo "Check ELEVENLABS_API_KEY and that the source URL is publicly accessible."
  exit 1
fi

DUBBING_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['dubbing_id'])" 2>/dev/null)

if [ -z "$DUBBING_ID" ]; then
  echo "ERROR: Could not extract dubbing_id from response."
  echo "Response: $RESPONSE"
  exit 1
fi

echo "Dubbing job created. ID: $DUBBING_ID"
echo "Target language: $TARGET_LANG"
echo "Polling for completion (this may take 1-10 minutes)..."
```

**Step 3 - Poll for dubbing completion:**

```bash
# Source: https://elevenlabs.io/docs/api-reference/dubbing/get
# Status values: "dubbing" (in progress), "dubbed" (complete), "failed" (error)
# CRITICAL: check for exactly "dubbed" - do NOT use negation of "dubbing" (other states possible)
MAX_WAIT=600   # 10 minutes max
ELAPSED=0
POLL_INTERVAL=15

while [ $ELAPSED -lt $MAX_WAIT ]; do
  STATUS_RESP=$(curl -f -s \
    "https://api.elevenlabs.io/v1/dubbing/${DUBBING_ID}" \
    -H "xi-api-key: $ELEVENLABS_API_KEY")

  if [ $? -ne 0 ]; then
    echo "WARNING: Status poll failed. Retrying in ${POLL_INTERVAL}s..."
    sleep $POLL_INTERVAL
    ELAPSED=$((ELAPSED + POLL_INTERVAL))
    continue
  fi

  STATUS=$(echo "$STATUS_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)

  if [ "$STATUS" = "dubbed" ]; then
    echo "Dubbing complete!"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "ERROR: Dubbing job failed."
    echo "Status response: $STATUS_RESP"
    exit 1
  fi

  echo "Status: $STATUS - waiting ${POLL_INTERVAL}s... (${ELAPSED}/${MAX_WAIT}s elapsed)"
  sleep $POLL_INTERVAL
  ELAPSED=$((ELAPSED + POLL_INTERVAL))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
  echo "ERROR: Dubbing timed out after ${MAX_WAIT} seconds."
  echo "The job may still be running. Check status manually:"
  echo "  curl -H 'xi-api-key: \$ELEVENLABS_API_KEY' https://api.elevenlabs.io/v1/dubbing/${DUBBING_ID}"
  exit 1
fi
```

**Step 4 - Download dubbed audio:**

```bash
# Source: https://elevenlabs.io/docs/api-reference/dubbing/audio/get
# Use -f (NOT --fail-with-body) for binary output - error body corrupts the MP4/audio file
curl -f -s \
  "https://api.elevenlabs.io/v1/dubbing/${DUBBING_ID}/audio/${TARGET_LANG}" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  --output "$OUTPUT_FILE"

if [ $? -ne 0 ]; then
  echo "ERROR: Failed to download dubbed audio."
  echo "Try manually: curl -H 'xi-api-key: \$ELEVENLABS_API_KEY' https://api.elevenlabs.io/v1/dubbing/${DUBBING_ID}/audio/${TARGET_LANG} --output dubbed.mp4"
  exit 1
fi

if [ ! -s "$OUTPUT_FILE" ]; then
  echo "ERROR: Downloaded file is empty."
  rm -f "$OUTPUT_FILE"
  exit 1
fi

echo "Dubbed file saved to: $OUTPUT_FILE"
```

Report to the user:
- The path where the dubbed file was saved
- Source and target languages
- Total time taken for the dubbing job
- If any error: missing key run /pocket-knife:setup; timeout check if job still running via manual curl
