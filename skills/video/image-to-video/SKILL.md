---
name: image-to-video
description: "Animate an image into video via fal.ai Wan 2.2. Async queue. Requires: FAL_KEY"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Animate a static image into a video using fal.ai Wan 2.2 5B image-to-video model.
The image must be a publicly accessible URL. Generation typically takes 1-3 minutes.

Ask the user for:
- IMAGE_URL: public URL of the image to animate (HTTPS URL required)
- PROMPT: description of the motion/animation to apply (e.g. "gentle waves in the background, leaves swaying")
- OUTPUT_FILE (optional): where to save — default: ~/Downloads/i2v_[timestamp].mp4

Then run the following steps:

**Step 1 — Check API key:**

(bash)
if [ -z "$FAL_KEY" ]; then
  echo "ERROR: FAL_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi

IMAGE_URL="[PUBLIC_IMAGE_URL_HERE]"
PROMPT="[ANIMATION_DESCRIPTION_HERE]"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/i2v_$(date +%Y%m%d_%H%M%S).mp4}"

MODEL="fal-ai/wan/v2.2-5b/image-to-video"

if [ -z "$IMAGE_URL" ]; then
  echo "ERROR: IMAGE_URL is required. Provide a public HTTPS URL to the source image."
  exit 1
fi
(end bash)

**Step 2 — Submit image-to-video job:**

(bash)
# Source: https://fal.ai/models/fal-ai/wan/v2.2-5b/image-to-video/api
# Key difference from text-to-video: body includes both "prompt" AND "image_url"
# image_url must be a publicly accessible HTTPS URL
# Auth: "Authorization: Key $FAL_KEY" (NOT Bearer)
echo "Submitting image-to-video job..."
SUBMIT=$(curl --fail-with-body -s \
  -X POST "https://queue.fal.run/${MODEL}" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"${PROMPT}\", \"image_url\": \"${IMAGE_URL}\"}")

if [ $? -ne 0 ]; then
  echo "ERROR: Failed to submit image-to-video job."
  echo "Response: $SUBMIT"
  echo "Check FAL_KEY in ~/.claude/.env and ensure image_url is a public HTTPS URL."
  exit 1
fi

REQUEST_ID=$(echo "$SUBMIT" | python3 -c "import sys,json; print(json.load(sys.stdin)['request_id'])" 2>/dev/null)

if [ -z "$REQUEST_ID" ]; then
  echo "ERROR: Could not extract request_id from response."
  echo "Response: $SUBMIT"
  exit 1
fi

echo "Job submitted. request_id: $REQUEST_ID"
echo "Polling for completion (typically 1-3 minutes)..."
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
    echo "ERROR: Image-to-video generation failed."
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
  echo "ERROR: Image-to-video timed out after ${MAX_WAIT} seconds."
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
  echo "ERROR: Could not extract video URL from result."
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
- The source image URL and animation prompt used
- Total time taken
