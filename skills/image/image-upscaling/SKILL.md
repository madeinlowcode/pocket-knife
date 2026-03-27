---
name: image-upscaling
description: "Upscale images with Topaz via fal.ai. 2x-4x resolution boost. Requires: FAL_KEY"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Upscale an image using Topaz Image Upscaler via fal.ai async queue.

Ask the user for:
- IMAGE_URL: public URL of the image to upscale
- SCALE (optional): upscale factor — 2 (default), 4
- OUTPUT_FILE (optional): path to save the result (default: ~/Downloads/upscaled_[timestamp].jpg)

Then run the following steps:

**Step 1 — Check API key:**

```bash
if [ -z "$FAL_KEY" ]; then
  echo "ERROR: FAL_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi
```

**Step 2 — Submit upscaling job:**

```bash
IMAGE_URL="[USER_IMAGE_URL_HERE]"
SCALE="${SCALE:-2}"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/upscaled_$(date +%s).jpg}"
MODEL_ID="fal-ai/topaz/upscale/image"
MAX_WAIT=180
POLL_INTERVAL=5

SUBMIT_RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://queue.fal.run/${MODEL_ID}" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"image_url\": \"$IMAGE_URL\", \"scale\": $SCALE}" \
  2>&1)

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  if echo "$SUBMIT_RESPONSE" | grep -qi "401\|unauthorized"; then
    echo "ERROR: Invalid FAL_KEY. Check your key in ~/.claude/.env"
  else
    echo "ERROR: fal.ai job submission failed (code $EXIT_CODE)."
    echo "$SUBMIT_RESPONSE"
  fi
  exit 1
fi

REQUEST_ID=$(echo "$SUBMIT_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data['request_id'])
except Exception as e:
    print('', end='')
" 2>/dev/null)

if [ -z "$REQUEST_ID" ]; then
  echo "ERROR: Could not extract request_id from fal.ai response."
  echo "$SUBMIT_RESPONSE"
  exit 1
fi

echo "Job submitted. Request ID: $REQUEST_ID"
echo "Waiting for upscaling to complete (max ${MAX_WAIT}s)..."
```

**Step 3 — Poll for completion:**

```bash
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
  STATUS_RESPONSE=$(curl -s \
    "https://queue.fal.run/${MODEL_ID}/requests/${REQUEST_ID}/status" \
    -H "Authorization: Key $FAL_KEY")

  STATUS=$(echo "$STATUS_RESPONSE" | python3 -c "
import sys, json
try:
    print(json.load(sys.stdin).get('status',''))
except:
    print('')
" 2>/dev/null)

  if [ "$STATUS" = "COMPLETED" ]; then
    echo "Upscaling completed."
    break
  elif [ "$STATUS" = "FAILED" ]; then
    echo "ERROR: fal.ai upscaling job failed."
    echo "$STATUS_RESPONSE"
    exit 1
  fi

  echo "Status: $STATUS (${ELAPSED}s elapsed)"
  sleep $POLL_INTERVAL
  ELAPSED=$((ELAPSED + POLL_INTERVAL))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
  echo "ERROR: Job timed out after ${MAX_WAIT}s."
  exit 1
fi
```

**Step 4 — Fetch result and download image:**

```bash
RESULT=$(curl -s \
  "https://queue.fal.run/${MODEL_ID}/requests/${REQUEST_ID}" \
  -H "Authorization: Key $FAL_KEY")

IMAGE_URL_OUT=$(echo "$RESULT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    image = data.get('image', {})
    if image:
        print(image.get('url',''))
    else:
        images = data.get('images', [])
        if images:
            print(images[0]['url'])
        else:
            print('')
except:
    print('')
" 2>/dev/null)

if [ -z "$IMAGE_URL_OUT" ]; then
  echo "ERROR: Could not extract result image URL."
  echo "$RESULT"
  exit 1
fi

curl -s "$IMAGE_URL_OUT" --output "$OUTPUT_FILE"
echo "Upscaled image saved: $OUTPUT_FILE"
```

Report to the user:
- The path where the upscaled image was saved
- The scale factor used
- If any error occurred, explain what went wrong and how to fix it