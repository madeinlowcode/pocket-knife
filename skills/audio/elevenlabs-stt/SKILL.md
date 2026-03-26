---
name: elevenlabs-stt
description: "Speech-to-text via ElevenLabs Scribe v2. Transcribes audio files. Requires: ELEVENLABS_API_KEY"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Transcribe audio to text using ElevenLabs Scribe v2.

Ask the user for:
- AUDIO_FILE: absolute path to the audio file (MP3, WAV, FLAC, OGG, AAC, M4A)
- LANGUAGE (optional): language code e.g. "en", "pt", "es" — default: auto-detect
- DIARIZE (optional): identify different speakers true/false — default: false

Then run the following steps:

**Step 1 — Check API key and file:**

(bash)
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "ERROR: ELEVENLABS_API_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi

AUDIO_FILE="[ABSOLUTE_PATH_TO_AUDIO_FILE]"
LANGUAGE="${LANGUAGE:-}"
DIARIZE="${DIARIZE:-false}"

if [ ! -f "$AUDIO_FILE" ]; then
  echo "ERROR: Audio file not found: $AUDIO_FILE"
  echo "Provide an absolute path to an existing audio file (MP3, WAV, FLAC, OGG, AAC, M4A)."
  exit 1
fi
(end bash)

**Step 2 — Transcribe audio:**

(bash)
# Source: https://elevenlabs.io/docs/api-reference/speech-to-text/convert
# Use --fail-with-body (NOT -f) — response is JSON, need to see error body on failure
# Send EITHER file OR source_url — NOT both (causes 422 Unprocessable Entity)
LANG_FLAG=""
if [ -n "$LANGUAGE" ]; then
  LANG_FLAG="-F language_code=${LANGUAGE}"
fi

RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://api.elevenlabs.io/v1/speech-to-text" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "model_id=scribe_v2" \
  -F "file=@${AUDIO_FILE}" \
  -F "diarize=${DIARIZE}" \
  $LANG_FLAG)

if [ $? -ne 0 ]; then
  echo "ERROR: ElevenLabs STT API call failed."
  echo "Response: $RESPONSE"
  echo "Check that ELEVENLABS_API_KEY is correct in ~/.claude/.env"
  echo "Run /pocket-knife:setup to reconfigure."
  exit 1
fi
(end bash)

**Step 3 — Display transcription:**

(bash)
echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    lang = data.get('language_code', 'unknown')
    text = data.get('text', '')
    print('Language detected: ' + lang)
    print()
    print('Transcription:')
    print(text)
except json.JSONDecodeError as e:
    print('ERROR: Could not parse API response as JSON: ' + str(e))
    sys.exit(1)
"
(end bash)

Report to the user:
- The transcribed text
- The detected or specified language
- If any error occurred: missing key run /pocket-knife:setup; file not found check path; 422 error means both file and source_url were sent
