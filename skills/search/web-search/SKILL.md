---
name: web-search
description: "Search the web via Tavily or Exa. Requires: TAVILY_API_KEY or EXA_API_KEY"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Search the web using your configured search API. Uses Tavily if available, falls back to Exa.

Ask the user for:
- QUERY: the search query
- MAX_RESULTS (optional): number of results to return (default: 5)

Then run the following steps:

**Step 1 — Check available search provider:**

```bash
if [ -n "$TAVILY_API_KEY" ]; then
  SEARCH_PROVIDER="tavily"
elif [ -n "$EXA_API_KEY" ]; then
  SEARCH_PROVIDER="exa"
else
  echo "ERROR: No search API key configured."
  echo "Configure TAVILY_API_KEY or EXA_API_KEY in ~/.claude/.env"
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi

echo "Using search provider: $SEARCH_PROVIDER"
```

**Step 2 — Execute the search:**

```bash
QUERY="[USER_QUERY_HERE]"
MAX_RESULTS="${MAX_RESULTS:-5}"

if [ "$SEARCH_PROVIDER" = "tavily" ]; then
  RESPONSE=$(curl --fail-with-body -s \
    -X POST "https://api.tavily.com/search" \
    -H "Authorization: Bearer $TAVILY_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$QUERY\", \"search_depth\": \"basic\", \"max_results\": $MAX_RESULTS, \"include_answer\": true}" \
    2>&1)
else
  RESPONSE=$(curl --fail-with-body -s \
    -X POST "https://api.exa.ai/search" \
    -H "x-api-key: $EXA_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$QUERY\", \"type\": \"auto\", \"numResults\": $MAX_RESULTS, \"contents\": {\"highlights\": {\"maxCharacters\": 4000}}}" \
    2>&1)
fi

EXIT_CODE=$?

case $EXIT_CODE in
  0)
    echo "$RESPONSE"
    ;;
  22)
    if echo "$RESPONSE" | grep -qi "unauthorized\|invalid.*key\|authentication\|forbidden"; then
      echo "ERROR: Invalid API key for '$SEARCH_PROVIDER'. Check your key in ~/.claude/.env"
    elif echo "$RESPONSE" | grep -qi "rate.limit\|too many requests"; then
      echo "ERROR: Rate limit exceeded for '$SEARCH_PROVIDER'. Wait a moment and try again."
    elif echo "$RESPONSE" | grep -qi "quota\|billing\|credits"; then
      echo "ERROR: Search quota exceeded for '$SEARCH_PROVIDER'. Check your account credits."
    else
      echo "ERROR: Search API returned HTTP error."
      echo "$RESPONSE"
    fi
    exit 1
    ;;
  6)
    echo "ERROR: Could not resolve '$SEARCH_PROVIDER' API host. Check internet connection."
    exit 1
    ;;
  7)
    echo "ERROR: Failed to connect to '$SEARCH_PROVIDER' API. Check internet connection."
    exit 1
    ;;
  *)
    echo "ERROR: curl failed with code $EXIT_CODE"
    echo "$RESPONSE"
    exit 1
    ;;
esac
```

**Step 3 — Parse and present results:**

Extract and display results from the response:
- For Tavily: display `answer` (AI summary) first, then list `results[].title`, `results[].url`, `results[].content` (first 200 chars each)
- For Exa: display `results[].title`, `results[].url`, `results[].highlights` (first highlight each)

Report to the user:
- Which search provider was used
- AI-generated answer (Tavily) or highlights (Exa)
- List of source URLs with titles
- If any error occurred, explain clearly (wrong key -> /pocket-knife:setup, quota -> check credits)
