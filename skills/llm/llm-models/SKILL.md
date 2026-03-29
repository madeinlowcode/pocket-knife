---
name: llm-models
description: "Chat with external LLMs (Gemini, Kimi, GLM). Use when you need a second AI opinion"
allowed-tools: Bash(curl *)
disable-model-invocation: false
---

Send a message to an LLM using your configured API key. Automatically selects the first available provider: Anthropic (Claude) > Google (Gemini) > Moonshot (Kimi) > Zhipu (GLM).

Ask the user for:
- PROMPT: the message to send to the LLM
- PROVIDER (optional): force a specific provider ("anthropic", "gemini", "kimi", "glm")

Then run the following steps:

**Step 1 — Detect available provider:**

```bash
if [ -n "$ANTHROPIC_API_KEY" ]; then
  PROVIDER="anthropic"
elif [ -n "$GOOGLE_API_KEY" ]; then
  PROVIDER="gemini"
elif [ -n "$KIMI_API_KEY" ]; then
  PROVIDER="kimi"
elif [ -n "$GLM_API_KEY" ]; then
  PROVIDER="glm"
else
  echo "ERROR: No LLM API key configured."
  echo "Configure at least one of: ANTHROPIC_API_KEY, GOOGLE_API_KEY, KIMI_API_KEY, GLM_API_KEY"
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi

echo "Using provider: $PROVIDER"
```

**Step 2 — Call the LLM API:**

```bash
PROMPT="[USER_PROMPT_HERE]"

case "$PROVIDER" in
  anthropic)
    RESPONSE=$(curl --fail-with-body -s \
      -X POST "https://api.anthropic.com/v1/messages" \
      -H "x-api-key: $ANTHROPIC_API_KEY" \
      -H "anthropic-version: 2023-06-01" \
      -H "Content-Type: application/json" \
      -d "{\"model\": \"claude-3-5-haiku-20241022\", \"max_tokens\": 1024, \"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}]}" \
      2>&1)
    ;;
  gemini)
    RESPONSE=$(curl --fail-with-body -s \
      -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent" \
      -H "x-goog-api-key: $GOOGLE_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"contents\": [{\"parts\": [{\"text\": \"$PROMPT\"}]}]}" \
      2>&1)
    ;;
  kimi)
    RESPONSE=$(curl --fail-with-body -s \
      -X POST "https://api.moonshot.cn/v1/chat/completions" \
      -H "Authorization: Bearer $KIMI_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"model\": \"moonshot-v1-8k\", \"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}]}" \
      2>&1)
    ;;
  glm)
    RESPONSE=$(curl --fail-with-body -s \
      -X POST "https://open.bigmodel.cn/api/paas/v4/chat/completions" \
      -H "Authorization: Bearer $GLM_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"model\": \"glm-4-flash\", \"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}]}" \
      2>&1)
    ;;
esac

EXIT_CODE=$?

case $EXIT_CODE in
  0)
    echo "$RESPONSE"
    ;;
  22)
    if echo "$RESPONSE" | grep -qi "unauthorized\|invalid.*key\|authentication"; then
      echo "ERROR: Invalid API key for provider '$PROVIDER'. Check your key in ~/.claude/.env"
    elif echo "$RESPONSE" | grep -qi "rate.limit\|too many requests"; then
      echo "ERROR: Rate limit exceeded for '$PROVIDER'. Wait a moment and try again."
    elif echo "$RESPONSE" | grep -qi "quota\|billing"; then
      echo "ERROR: API quota exceeded for '$PROVIDER'. Check your account billing."
    else
      echo "ERROR: API returned HTTP error from '$PROVIDER'."
      echo "$RESPONSE"
    fi
    exit 1
    ;;
  6)
    echo "ERROR: Could not resolve API host for '$PROVIDER'. Check internet connection."
    exit 1
    ;;
  7)
    echo "ERROR: Failed to connect to '$PROVIDER' API. Check internet connection."
    exit 1
    ;;
  *)
    echo "ERROR: curl failed with code $EXIT_CODE"
    echo "$RESPONSE"
    exit 1
    ;;
esac
```

**Step 3 — Parse and present the response:**

Extract and display the text response from the API. For Anthropic: `content[0].text`. For Gemini: `candidates[0].content.parts[0].text`. For Kimi/GLM: `choices[0].message.content`.

Report to the user:
- Which provider was used
- The LLM's response text (extracted from JSON, not the raw JSON)
- If any error occurred, explain clearly (wrong key -> /pocket-knife:setup, rate limit -> wait, quota -> billing)
