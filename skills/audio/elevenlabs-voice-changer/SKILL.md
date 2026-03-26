---
name: elevenlabs-voice-changer
description: "Transform voice in audio to another voice via ElevenLabs STS. Requires: ELEVENLABS_API_KEY"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Transform the voice in an audio file to a different target voice using ElevenLabs
speech-to-speech (STS) endpoint.

Ask the user for:
- AUDIO_FILE: absolute path to the source audio file (MP3, WAV, FLAC, OGG, AAC)
- VOICE_ID (optional): target voice ID - default: George (JBFqnCBsd6RMkjVDRZzb)
- OUTPUT_FILE (optional): where to save the MP3 - default: ~/Downloads/voice_changed_[timestamp].mp3

**Available voices:**
| Name | Voice ID | Accent | Gender |
|------|----------|--------|--------|
| George (default) | JBFqnCBsd6RMkjVDRZzb | British | Male |
| Rachel | 21m00Tcm4TlvDq8ikWAM | American | Female |
| Aria | 9BWtsMINqrJLrRacOk9x | American | Female |
| Charlie | IKne3meq5aSn9XLyUdCD | Australian | Male |

Then run the following steps:

**Step 1 - Check API key and file:**

```bash
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "ERROR: ELEVENLABS_API_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi

AUDIO_FILE="[ABSOLUTE_PATH_TO_AUDIO_FILE]"
VOICE_ID="${VOICE_ID:-JBFqnCBsd6RMkjVDRZzb}"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/voice_changed_$(date +%Y%m%d_%H%M%S).mp3}"

if [ ! -f "$AUDIO_FILE" ]; then
  echo "ERROR: Audio file not found: $AUDIO_FILE"
  echo "Provide an absolute path to an existing audio file."
  exit 1
fi
```

**Step 2 - Transform voice:**

```bash
# Source: https://elevenlabs.io/docs/api-reference/speech-to-speech/convert
# Use -f (NOT --fail-with-body) for binary output - error body corrupts the MP3 file
# Model: eleven_multilingual_sts_v2 (NOT eleven_monolingual_v1 - deprecated)
# voice_settings is a JSON object inside multipart - must be serialized as string with -F
curl -f -s \
  -X POST "https://api.elevenlabs.io/v1/speech-to-speech/${VOICE_ID}" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "audio=@${AUDIO_FILE}" \
  -F "model_id=eleven_multilingual_sts_v2" \
  -F "output_format=mp3_44100_128" \
  -F "voice_settings={\"stability\":0.75,\"similarity_boost\":0.75}" \
  --output "$OUTPUT_FILE"

if [ $? -ne 0 ]; then
  echo "ERROR: ElevenLabs Voice Changer API call failed."
  echo "Check that ELEVENLABS_API_KEY is correct in ~/.claude/.env"
  echo "Run /pocket-knife:setup to reconfigure."
  exit 1
fi

if [ ! -s "$OUTPUT_FILE" ]; then
  echo "ERROR: Output audio file is empty."
  echo "Possible causes: invalid voice_id, unsupported audio format, or API error."
  rm -f "$OUTPUT_FILE"
  exit 1
fi

echo "Voice changed successfully: $OUTPUT_FILE"
echo "Target voice ID: $VOICE_ID"
```

Report to the user:
- The path where the transformed audio was saved
- The target voice ID used
- If any error: missing key run /pocket-knife:setup; invalid voice_id check the table above
