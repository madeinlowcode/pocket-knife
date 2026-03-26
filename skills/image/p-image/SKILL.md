---
name: p-image
description: "Generate images with Pruna P-Image via fal.ai. Requires: FAL_KEY"
allowed-tools: Bash(curl *)
disable-model-invocation: false
---

Generate an image using the Pruna P-Image model via fal.ai async queue.

> **Note:** Model ID `fal-ai/pruna/p-image` is provisional. If this skill returns a 404 error, verify the current model ID at https://fal.ai/models (search "pruna") and update MODEL_ID in the script below.

Ask the user for:
- PROMPT: description of the image to generate
- OUTPUT_FILE (optional): path to save the image (default: ~/Downloads/p_image_[timestamp].jpg)

Then run the following steps:

**Step 1 - Check API key:**

```bash
if [ -z "$FAL_KEY" ]; then
  echo "ERROR: FAL_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi
```

**Step 2 - Submit job to fal.ai queue:**

```bash
PROMPT="[USER_PROMPT_HERE]"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/p_image_$(date +%s).jpg}"
MODEL_ID="fal-ai/pruna/p-image"
MAX_WAIT=120
POLL_INTERVAL=3

SUBMIT_RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://queue.fal.run/${MODEL_ID}" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"$PROMPT\"}" \
  2>&1)

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  if echo "$SUBMIT_RESPONSE" | grep -qi "401\|unauthorized"; then
    echo "ERROR: Invalid FAL_KEY. Check your key in ~/.claude/.env"
  elif echo "$SUBMIT_RESPONSE" | grep -qi "404\|not found"; then
    echo "ERROR: Model ${MODEL_ID} not found on fal.ai."
    echo "Verify the model ID at https://fal.ai/models (search 'pruna') and update this skill."
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
echo "Waiting for completion (max ${MAX_WAIT}s)..."
```

**Step 3 - Poll for completion:**

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
    echo "Job completed."
    break
  elif [ "$STATUS" = "FAILED" ]; then
    echo "ERROR: fal.ai job failed."
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

**Step 4 - Fetch result and download image:**

```bash
RESULT=$(curl -s \
  "https://queue.fal.run/${MODEL_ID}/requests/${REQUEST_ID}" \
  -H "Authorization: Key $FAL_KEY")

IMAGE_URL=$(echo "$RESULT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    images = data.get('images', [])
    if images:
        print(images[0]['url'])
    else:
        image = data.get('image', {})
        print(image.get('url',''))
except:
    print('')
" 2>/dev/null)

if [ -z "$IMAGE_URL" ]; then
  echo "ERROR: Could not extract image URL from fal.ai result."
  echo "$RESULT"
  exit 1
fi

curl -s "$IMAGE_URL" --output "$OUTPUT_FILE"
echo "Image saved: $OUTPUT_FILE"
```

Report to the user:
- The path where the image was saved
- The prompt used
- If a 404 error occurred, explain that the model ID may need verification at https://fal.ai/models
- If any other error occurred, explain what went wrong and how to fix it