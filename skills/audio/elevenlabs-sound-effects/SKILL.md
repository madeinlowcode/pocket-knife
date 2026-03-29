---
name: elevenlabs-sound-effects
description: "Generate sound effects from description. Use for: SFX, game audio, video soundscape"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Generate sound effects audio from a text description using ElevenLabs sound-generation API.

Ask the user for:
- TEXT: text description of the sound effect (e.g. "thunderstorm with heavy rain", "cat meowing")
- DURATION (optional): duration in seconds (1.0-22.0) — default: 5.0
- PROMPT_INFLUENCE (optional): how much the prompt influences the audio (0.0-1.0) — default: 0.3
- OUTPUT_FILE (optional): where to save the MP3 — default: ~/Downloads/sfx_[timestamp].mp3

Then run the following steps:

**Step 1 — Check API key:**

(bash)
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "ERROR: ELEVENLABS_API_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi

TEXT="[USER_DESCRIPTION_HERE]"
DURATION="${DURATION:-5.0}"
PROMPT_INFLUENCE="${PROMPT_INFLUENCE:-0.3}"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/sfx_$(date +%Y%m%d_%H%M%S).mp3}"
(end bash)

**Step 2 — Generate sound effect:**

(bash)
# Source: https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert
# Use -f (NOT --fail-with-body) for binary output — error body would corrupt the MP3 file
# duration_seconds: 1.0-22.0; prompt_influence: 0.0-1.0 (higher = closer to prompt)
curl -f -s \
  -X POST "https://api.elevenlabs.io/v1/sound-generation" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"${TEXT}\", \"duration_seconds\": ${DURATION}, \"prompt_influence\": ${PROMPT_INFLUENCE}}" \
  --output "$OUTPUT_FILE"

if [ $? -ne 0 ]; then
  echo "ERROR: ElevenLabs Sound Effects API call failed."
  echo "Check that ELEVENLABS_API_KEY is correct in ~/.claude/.env"
  echo "Run /pocket-knife:setup to reconfigure."
  exit 1
fi

# Verify the output file has content (empty = API error without proper exit code)
if [ ! -s "$OUTPUT_FILE" ]; then
  echo "ERROR: Audio file is empty. Possible causes:"
  echo "  - Text description too vague or too short"
  echo "  - duration_seconds out of range (must be 1.0-22.0)"
  echo "  - API returned error without proper HTTP status code"
  rm -f "$OUTPUT_FILE"
  exit 1
fi

echo "Sound effect generated successfully: $OUTPUT_FILE"
echo "Duration: ${DURATION}s | Prompt influence: ${PROMPT_INFLUENCE}"
(end bash)

Report to the user:
- The path where the audio file was saved
- The text description and parameters used
- If any error: missing key run /pocket-knife:setup; empty file check text/duration range
