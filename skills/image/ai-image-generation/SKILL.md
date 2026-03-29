---
name: ai-image-generation
description: "Create images, photos, art with Google Imagen 4. Use for: generate image, make picture, AI art"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Generate an image using the Google Imagen 4 API (imagen-4.0-generate-001).

Ask the user for:
- PROMPT: description of the image to generate
- ASPECT_RATIO (optional): "1:1" (default), "3:4", "4:3", "9:16", "16:9"
- OUTPUT_FILE (optional): path to save the image (default: ~/Downloads/imagen_output.png)

Then run the following steps:

**Step 1 — Check API key:**

```bash
if [ -z "$GOOGLE_API_KEY" ]; then
  echo "ERROR: GOOGLE_API_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi
```

**Step 2 — Generate the image:**

```bash
PROMPT="[USER_PROMPT_HERE]"
ASPECT_RATIO="${ASPECT_RATIO:-1:1}"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/imagen_output.png}"
RESPONSE_FILE="/tmp/imagen_response_$$.json"

RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict" \
  -H "x-goog-api-key: $GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"instances\": [{\"prompt\": \"$PROMPT\"}], \"parameters\": {\"sampleCount\": 1, \"aspectRatio\": \"$ASPECT_RATIO\"}}" \
  2>&1)

EXIT_CODE=$?

case $EXIT_CODE in
  0)
    echo "$RESPONSE" > "$RESPONSE_FILE"
    ;;
  22)
    if echo "$RESPONSE" | grep -qi "unauthorized\|invalid.*key\|api key"; then
      echo "ERROR: Invalid GOOGLE_API_KEY. Check your key in ~/.claude/.env"
    elif echo "$RESPONSE" | grep -qi "rate.limit\|quota"; then
      echo "ERROR: API quota exceeded. Check your Google AI account billing."
    elif echo "$RESPONSE" | grep -qi "not found\|404"; then
      echo "ERROR: Model not found. The model imagen-4.0-generate-001 may not be available in your region or API tier."
    else
      echo "ERROR: API returned HTTP error."
      echo "$RESPONSE"
    fi
    exit 1
    ;;
  6)
    echo "ERROR: Could not resolve generativelanguage.googleapis.com. Check internet connection."
    exit 1
    ;;
  7)
    echo "ERROR: Failed to connect to Google AI API. Check internet connection."
    exit 1
    ;;
  *)
    echo "ERROR: curl failed with code $EXIT_CODE"
    echo "$RESPONSE"
    exit 1
    ;;
esac
```

**Step 3 — Decode and save the image:**

```bash
python3 - "$RESPONSE_FILE" "$OUTPUT_FILE" << 'PYEOF'
import sys, json, base64

response_file = sys.argv[1]
output_file = sys.argv[2]

with open(response_file, 'r') as f:
    data = json.load(f)

predictions = data.get('predictions', [])
if not predictions:
    print("ERROR: No image data in response. Check the prompt or try again.")
    sys.exit(1)

img_b64 = predictions[0].get('bytesBase64Encoded', '')
if not img_b64:
    print("ERROR: Empty image data in response.")
    sys.exit(1)

with open(output_file, 'wb') as f:
    f.write(base64.b64decode(img_b64))

print(f"Image saved: {output_file}")
PYEOF

rm -f "$RESPONSE_FILE"
```

Report to the user:
- The path where the image was saved
- The prompt used
- The aspect ratio used
- If any error occurred, explain what went wrong and how to fix it (missing key -> run /pocket-knife:setup, quota -> check billing, model not found -> check API tier)
