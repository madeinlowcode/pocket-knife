---
name: elevenlabs-tts
description: "Text-to-speech via ElevenLabs. 32 languages, 22+ voices. Requires: ELEVENLABS_API_KEY"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Generate speech audio from text using the ElevenLabs API.

Ask the user for:
- TEXT: the text to convert to speech
- VOICE (optional): voice name or ID — default is "george" (see voice list below)
- OUTPUT_FILE (optional): where to save the MP3 — default: ~/Downloads/tts_[timestamp].mp3

**Available voices:**
| Name | Voice ID | Accent | Gender |
|------|----------|--------|--------|
| George (default) | JBFqnCBsd6RMkjVDRZzb | British | Male |
| Rachel | 21m00Tcm4TlvDq8ikWAM | American | Female |
| Aria | 9BWtsMINqrJLrRacOk9x | American | Female |
| Charlie | IKne3meq5aSn9XLyUdCD | Australian | Male |

Then run the following steps:

**Step 1 — Check API key:**

```bash
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "ERROR: ELEVENLABS_API_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi
```

**Step 2 — Set voice ID:**

```bash
VOICE_INPUT="[VOICE_NAME_OR_ID_HERE]"

case "$VOICE_INPUT" in
  george|"")  VOICE_ID="JBFqnCBsd6RMkjVDRZzb" ;;
  rachel)     VOICE_ID="21m00Tcm4TlvDq8ikWAM" ;;
  aria)       VOICE_ID="9BWtsMINqrJLrRacOk9x" ;;
  charlie)    VOICE_ID="IKne3meq5aSn9XLyUdCD" ;;
  *)          VOICE_ID="$VOICE_INPUT" ;;  # Assume custom voice ID was passed directly
esac

OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/tts_$(date +%Y%m%d_%H%M%S).mp3}"
TEXT="[USER_TEXT_HERE]"
```

**Step 3 — Generate audio:**

```bash
# Use -f (not --fail-with-body) for binary output — mixing error body with binary stream corrupts the file
curl -f -s \
  -X POST "https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEXT\", \"model_id\": \"eleven_multilingual_v2\", \"voice_settings\": {\"stability\": 0.5, \"similarity_boost\": 0.75}}" \
  --output "$OUTPUT_FILE"

if [ $? -ne 0 ]; then
  echo "ERROR: ElevenLabs API call failed."
  echo "Check that ELEVENLABS_API_KEY is correct in ~/.claude/.env"
  echo "Run /pocket-knife:setup to reconfigure."
  exit 1
fi

# Verify the output file has content (empty file = API error without exit code)
if [ ! -s "$OUTPUT_FILE" ]; then
  echo "ERROR: Audio file is empty. Possible causes:"
  echo "  - Invalid or empty text input"
  echo "  - Invalid voice ID: $VOICE_ID"
  echo "  - API returned error without proper HTTP status code"
  rm -f "$OUTPUT_FILE"
  exit 1
fi

echo "Audio generated successfully: $OUTPUT_FILE"
```

Report to the user:
- The path where the audio file was saved
- The voice used and the text length
- If any error occurred, explain clearly (missing key -> /pocket-knife:setup, empty file -> check text/voice ID)