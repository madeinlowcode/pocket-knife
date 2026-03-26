---
name: p-video
description: "Generate video via fal.ai Seedance 1.0 Lite. Fast and economical. Requires: FAL_KEY"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Generate video from text using fal.ai Seedance 1.0 Lite (ByteDance). Fast and economical
alternative to Kling for quick video generation. Typically completes in 1-2 minutes.

Ask the user for:
- PROMPT: description of the video to generate
- DURATION (optional): duration in seconds — default: 5
- OUTPUT_FILE (optional): where to save — default: ~/Downloads/pvideo_[timestamp].mp4

Then run the following steps:

**Step 1 — Check API key:**

(bash)
if [ -z "$FAL_KEY" ]; then
  echo "ERROR: FAL_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi

PROMPT="[USER_PROMPT_HERE]"
DURATION="${DURATION:-5}"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/pvideo_$(date +%Y%m%d_%H%M%S).mp4}"

MODEL="fal-ai/bytedance/seedance/v1/lite/text-to-video"
(end bash)

**Step 2 — Submit video generation job:**

(bash)
# Source: https://fal.ai/models/fal-ai/bytedance/seedance/v1/lite/text-to-video/api
# Seedance 1.0 Lite — fast and economical; same queue pattern as Kling
# Auth: "Authorization: Key $FAL_KEY" (NOT Bearer)
echo "Submitting video generation job (Seedance 1.0 Lite)..."
SUBMIT=$(curl --fail-with-body -s \
  -X POST "https://queue.fal.run/${MODEL}" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"${PROMPT}\", \"duration\": \"${DURATION}\"}")

if [ $? -ne 0 ]; then
  echo "ERROR: Failed to submit video generation job."
  echo "Response: $SUBMIT"
  echo "Check FAL_KEY in ~/.claude/.env and run /pocket-knife:setup to reconfigure."
  exit 1
fi

REQUEST_ID=$(echo "$SUBMIT" | python3 -c "import sys,json; print(json.load(sys.stdin)['request_id'])" 2>/dev/null)

if [ -z "$REQUEST_ID" ]; then
  echo "ERROR: Could not extract request_id."
  echo "Response: $SUBMIT"
  exit 1
fi

echo "Job submitted. request_id: $REQUEST_ID"
echo "Polling for completion (typically 1-2 minutes)..."
(end bash)

**Step 3 — Poll for completion:**

(bash)
MAX_WAIT=300
ELAPSED=0
POLL_INTERVAL=10

while [ $ELAPSED -lt $MAX_WAIT ]; do
  sleep $POLL_INTERVAL
  ELAPSED=$((ELAPSED + POLL_INTERVAL))

  STATUS_RESP=$(curl -f -s \
    "https://queue.fal.run/${MODEL}/requests/${REQUEST_ID}/status" \
    -H "Authorization: Key $FAL_KEY")

  if [ $? -ne 0 ]; then
    echo "WARNING: Status poll failed. Retrying... (${ELAPSED}/${MAX_WAIT}s)"
    continue
  fi

  STATUS=$(echo "$STATUS_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)
  HAS_ERROR=$(echo "$STATUS_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if d.get('error') else 'no')" 2>/dev/null)

  if [ "$HAS_ERROR" = "yes" ]; then
    echo "ERROR: Video generation failed."
    echo "$STATUS_RESP"
    exit 1
  fi

  echo "Status: $STATUS — ${ELAPSED}/${MAX_WAIT}s elapsed"

  if [ "$STATUS" = "COMPLETED" ]; then
    echo "Video generation complete!"
    break
  fi
done

if [ $ELAPSED -ge $MAX_WAIT ] && [ "$STATUS" != "COMPLETED" ]; then
  echo "ERROR: Video generation timed out after ${MAX_WAIT} seconds."
  echo "request_id: $REQUEST_ID"
  exit 1
fi
(end bash)

**Step 4 — Fetch result and download video:**

(bash)
RESULT=$(curl --fail-with-body -s \
  "https://queue.fal.run/${MODEL}/requests/${REQUEST_ID}/response" \
  -H "Authorization: Key $FAL_KEY")

if [ $? -ne 0 ]; then
  echo "ERROR: Failed to fetch result."
  exit 1
fi

VIDEO_URL=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['video']['url'])" 2>/dev/null)

if [ -z "$VIDEO_URL" ]; then
  echo "ERROR: Could not extract video URL."
  echo "Result: $RESULT"
  exit 1
fi

curl -f -s "$VIDEO_URL" --output "$OUTPUT_FILE"

if [ $? -ne 0 ] || [ ! -s "$OUTPUT_FILE" ]; then
  echo "ERROR: Video download failed or file is empty."
  rm -f "$OUTPUT_FILE"
  exit 1
fi

echo "Video saved to: $OUTPUT_FILE"
(end bash)

Report to the user:
- The path where the video was saved
- The prompt and duration used
- Total time taken
- Suggest /pocket-knife:ai-video-generation for higher quality (Kling 1.6) if needed
