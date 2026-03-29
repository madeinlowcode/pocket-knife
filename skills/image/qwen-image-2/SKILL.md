---
name: qwen-image-2
description: "Generate images with Qwen 2.0. Good for: text in images, Chinese content, Asian styles"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Generate an image using the Qwen Image 2.0 model via Alibaba DashScope International API.

Ask the user for:
- PROMPT: description of the image to generate
- SIZE (optional): image dimensions in format WIDTHxHEIGHT using asterisk - "1024*1024" (default), "512*512", "768*1024", "1024*768"
- OUTPUT_FILE (optional): path to save the image (default: ~/Downloads/qwen_image_[timestamp].png)

**Note:** Requires `DASHSCOPE_API_KEY` from Alibaba Cloud Model Studio (modelscope.cn or dashscope.aliyuncs.com).

Then run the following steps:

**Step 1 - Check API key:**

```bash
if [ -z "$DASHSCOPE_API_KEY" ]; then
  echo "ERROR: DASHSCOPE_API_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  echo "Get your key at: https://dashscope.aliyuncs.com (Alibaba Cloud account required)"
  exit 1
fi
```

**Step 2 - Generate the image:**

```bash
PROMPT="[USER_PROMPT_HERE]"
SIZE="${SIZE:-1024*1024}"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/qwen_image_$(date +%s).png}"
MODEL="qwen-image-2.0"

RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation" \
  -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL\",
    \"input\": {
      \"messages\": [{\"role\": \"user\", \"content\": [{\"text\": \"$PROMPT\"}]}]
    },
    \"parameters\": {
      \"size\": \"$SIZE\",
      \"n\": 1,
      \"prompt_extend\": true,
      \"watermark\": false
    }
  }" \
  2>&1)

EXIT_CODE=$?

case $EXIT_CODE in
  0)
    ;;
  22)
    if echo "$RESPONSE" | grep -qi "unauthorized\|invalid.*key\|authentication"; then
      echo "ERROR: Invalid DASHSCOPE_API_KEY. Check your key in ~/.claude/.env"
    elif echo "$RESPONSE" | grep -qi "rate.limit\|quota\|throttl"; then
      echo "ERROR: DashScope API quota exceeded. Check your Alibaba Cloud account."
    elif echo "$RESPONSE" | grep -qi "size.*invalid\|invalid.*size"; then
      echo "ERROR: Invalid size format. Use asterisk format: '1024*1024' (not 1024x1024)"
    else
      echo "ERROR: DashScope API returned HTTP error."
      echo "$RESPONSE"
    fi
    exit 1
    ;;
  6)
    echo "ERROR: Could not resolve dashscope-intl.aliyuncs.com. Check internet connection."
    exit 1
    ;;
  7)
    echo "ERROR: Failed to connect to DashScope API. Check internet connection."
    exit 1
    ;;
  *)
    echo "ERROR: curl failed with code $EXIT_CODE"
    echo "$RESPONSE"
    exit 1
    ;;
esac
```

**Step 3 - Extract image URL and download:**

```bash
IMAGE_URL=$(echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    choices = data['output']['choices']
    for choice in choices:
        content = choice['message']['content']
        for item in content:
            if 'image' in item:
                print(item['image'])
                break
except Exception as e:
    print('')
" 2>/dev/null)

if [ -z "$IMAGE_URL" ]; then
  echo "ERROR: Could not extract image URL from DashScope response."
  echo "$RESPONSE"
  exit 1
fi

curl -s "$IMAGE_URL" --output "$OUTPUT_FILE"
echo "Image saved: $OUTPUT_FILE"
```

Report to the user:
- The path where the image was saved
- The prompt used
- The size used
- If any error occurred, explain what went wrong and how to fix it (especially for size format errors: use asterisk like '1024*1024')