---
name: nano-banana-2
description: "Generate images with Gemini 3.1 Flash Image. Fast, 4K quality. Requires: GOOGLE_API_KEY"
allowed-tools: Bash(curl *)
disable-model-invocation: false
---

Generate an image using the Google Gemini 3.1 Flash Image Preview API.

Ask the user for:
- PROMPT: description of the image to generate
- OUTPUT_FILE (optional): path to save the image (default: ~/Downloads/nano_banana_2_[timestamp].png)

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
MODEL="gemini-3.1-flash-image-preview"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/nano_banana_2_$(date +%s).png}"
RESPONSE_FILE="/tmp/nano_banana_2_response_$$.json"

RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent" \
  -H "x-goog-api-key: $GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"contents\":[{\"parts\":[{\"text\":\"$PROMPT\"}]}],\"generationConfig\":{\"responseModalities\":[\"TEXT\",\"IMAGE\"]}}" \
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
      echo "ERROR: Model gemini-3.1-flash-image-preview not found. It may not be available in your region or API tier."
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

# Gemini native uses candidates[].content.parts[].inline_data (NOT predictions[].bytesBase64Encoded)
candidates = data.get('candidates', [])
if not candidates:
    print("ERROR: No candidates in response. Check the prompt or try again.")
    sys.exit(1)

parts = candidates[0].get('content', {}).get('parts', [])
for part in parts:
    if 'inline_data' in part:
        img_b64 = part['inline_data']['data']
        with open(output_file, 'wb') as f:
            f.write(base64.b64decode(img_b64))
        print(f"Image saved: {output_file}")
        sys.exit(0)

print("ERROR: No image data found in response parts.")
print("Response structure:", list(data.keys()))
sys.exit(1)
PYEOF

rm -f "$RESPONSE_FILE"
```

Report to the user:
- The path where the image was saved
- The prompt used
- If any error occurred, explain what went wrong and how to fix it