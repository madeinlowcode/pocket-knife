---
name: elevenlabs-voice-isolator
description: "Isolate voice from audio/remove background noise via ElevenLabs. Requires: ELEVENLABS_API_KEY"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Remove background noise and isolate the voice from an audio file using
ElevenLabs audio isolation API.

Ask the user for:
- AUDIO_FILE: absolute path to the audio file (MP3, WAV, FLAC, OGG, AAC)
- OUTPUT_FILE (optional): where to save the isolated audio - default: ~/Downloads/isolated_[timestamp].mp3

Then run the following steps:

**Step 1 - Check API key and file:**

```bash
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "ERROR: ELEVENLABS_API_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi

AUDIO_FILE="[ABSOLUTE_PATH_TO_AUDIO_FILE]"
OUTPUT_FILE="${OUTPUT_FILE:-$HOME/Downloads/isolated_$(date +%Y%m%d_%H%M%S).mp3}"

if [ ! -f "$AUDIO_FILE" ]; then
  echo "ERROR: Audio file not found: $AUDIO_FILE"
  echo "Provide an absolute path to an existing audio file."
  exit 1
fi
```

**Step 2 - Isolate voice:**

```bash
# Source: https://elevenlabs.io/blog/voice-isolator-api-launch
# Endpoint: POST /v1/audio-isolation
# Use -f (NOT --fail-with-body) for binary output - error body corrupts the audio file
# Field name is "audio" (not "file" - different from STT endpoint)
curl -f -s \
  -X POST "https://api.elevenlabs.io/v1/audio-isolation" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "audio=@${AUDIO_FILE}" \
  --output "$OUTPUT_FILE"

if [ $? -ne 0 ]; then
  echo "ERROR: ElevenLabs Voice Isolator API call failed."
  echo "Check that ELEVENLABS_API_KEY is correct in ~/.claude/.env"
  echo "Run /pocket-knife:setup to reconfigure."
  exit 1
fi

if [ ! -s "$OUTPUT_FILE" ]; then
  echo "ERROR: Output audio file is empty."
  echo "Possible causes: unsupported audio format, no speech detected in file."
  rm -f "$OUTPUT_FILE"
  exit 1
fi

echo "Voice isolated successfully: $OUTPUT_FILE"
```

Report to the user:
- The path where the isolated audio was saved
- If any error: missing key run /pocket-knife:setup; empty file check audio contains speech
