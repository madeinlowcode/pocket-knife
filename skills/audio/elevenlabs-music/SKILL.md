---
name: elevenlabs-music
description: "Generate music from text description. Use for: background music, jingles, soundtracks"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Generate original music from a text description using ElevenLabs music generation API.

Ask the user for:
- PROMPT: description of the music (e.g. "upbeat jazz piano, medium tempo, happy mood")
- DURATION (optional): duration in seconds (3-600) - default: 30
- OUTPUT_FILE (optional): where to save the MP3 - default: ~/Downloads/music_[timestamp].mp3

Then run the following steps:

**Step 1 - Check API key:**

```bash
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "ERROR: ELEVENLABS_API_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi

PROMPT="[USER_MUSIC_DESCRIPTION_HERE]"
DURATION="${DURATION:-30}"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/music_$(date +%Y%m%d_%H%M%S).mp3}"

# Convert seconds to milliseconds
DURATION_MS=$((DURATION * 1000))
```

**Step 2 - Generate music:**

```bash
# Source: https://elevenlabs.io/docs/api-reference/music/compose
# Released August 2025; model: music_v1; duration in milliseconds (3000-600000)
# Use -f (NOT --fail-with-body) for binary output - error body corrupts the MP3 file
curl -f -s \
  -X POST "https://api.elevenlabs.io/v1/music" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"${PROMPT}\", \"music_length_ms\": ${DURATION_MS}, \"model_id\": \"music_v1\"}" \
  --output "$OUTPUT_FILE"

if [ $? -ne 0 ]; then
  echo "ERROR: ElevenLabs Music API call failed."
  echo "Check that ELEVENLABS_API_KEY is correct in ~/.claude/.env"
  echo "Run /pocket-knife:setup to reconfigure."
  exit 1
fi

if [ ! -s "$OUTPUT_FILE" ]; then
  echo "ERROR: Music file is empty. Possible causes:"
  echo "  - Duration out of range (must be 3-600 seconds)"
  echo "  - Prompt too short or unclear"
  echo "  - API returned error without proper HTTP status code"
  rm -f "$OUTPUT_FILE"
  exit 1
fi

echo "Music generated successfully: $OUTPUT_FILE"
echo "Duration: ${DURATION}s | Prompt: ${PROMPT}"
```

Report to the user:
- The path where the music file was saved
- The prompt and duration used
- If any error: missing key run /pocket-knife:setup; duration 3-600 seconds
