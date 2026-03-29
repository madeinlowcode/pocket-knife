---
name: elevenlabs-dialogue
description: "Create multi-speaker dialogue audio. Use for: podcasts, conversations, audiobook scenes"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Generate multi-speaker dialogue audio using ElevenLabs text-to-dialogue endpoint.
Each segment can use a different voice. Up to 10 unique voices per request.

Ask the user for:
- SEGMENTS: list of dialogue lines, each with text and speaker (e.g. "Alice: Hello! / Bob: Hi there!")
- OUTPUT_FILE (optional): where to save the MP3 — default: ~/Downloads/dialogue_[timestamp].mp3

**Available voices:**
| Name | Voice ID | Accent | Gender |
|------|----------|--------|--------|
| George (default male) | JBFqnCBsd6RMkjVDRZzb | British | Male |
| Rachel | 21m00Tcm4TlvDq8ikWAM | American | Female |
| Aria | 9BWtsMINqrJLrRacOk9x | American | Female |
| Sarah | EXAVITQu4vr4xnSDxMaL | American | Female |
| Charlie | IKne3meq5aSn9XLyUdCD | Australian | Male |

Then run the following steps:

**Step 1 — Check API key:**

(bash)
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "ERROR: ELEVENLABS_API_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi

OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/dialogue_$(date +%Y%m%d_%H%M%S).mp3}"
(end bash)

**Step 2 — Generate dialogue audio:**

(bash)
# Source: https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert
# Use -f (NOT --fail-with-body) for binary output — error body would corrupt the MP3 file
# Model: eleven_v3 (NOT eleven_monolingual_v1 — deprecated)
# inputs array: max 10 unique voice_ids per request
# Replace the inputs array below with the actual dialogue segments from the user
curl -f -s \
  -X POST "https://api.elevenlabs.io/v1/text-to-dialogue" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": [
      {"text": "[FIRST_LINE_TEXT]", "voice_id": "JBFqnCBsd6RMkjVDRZzb"},
      {"text": "[SECOND_LINE_TEXT]", "voice_id": "EXAVITQu4vr4xnSDxMaL"}
    ],
    "model_id": "eleven_v3"
  }' \
  --output "$OUTPUT_FILE"

if [ $? -ne 0 ]; then
  echo "ERROR: ElevenLabs Dialogue API call failed."
  echo "Check that ELEVENLABS_API_KEY is correct in ~/.claude/.env"
  echo "Run /pocket-knife:setup to reconfigure."
  exit 1
fi

# Verify the output file has content
if [ ! -s "$OUTPUT_FILE" ]; then
  echo "ERROR: Audio file is empty. Possible causes:"
  echo "  - Invalid voice_id in inputs array"
  echo "  - API returned error without proper HTTP status code"
  rm -f "$OUTPUT_FILE"
  exit 1
fi

echo "Dialogue audio generated successfully: $OUTPUT_FILE"
(end bash)

Report to the user:
- The path where the audio file was saved
- Number of dialogue segments generated
- Voices used per segment
- If any error: missing key run /pocket-knife:setup; empty file check voice IDs
