---
name: elevenlabs-voice-cloner
description: "Clone a voice with ElevenLabs. Upload audio sample, get voice_id. Requires: ELEVENLABS_API_KEY"
allowed-tools: Bash(curl *)
disable-model-invocation: true
---

Clone a voice by uploading audio samples to ElevenLabs. Returns a voice_id usable with
/pocket-knife:elevenlabs-tts and /pocket-knife:elevenlabs-voice-changer.

Ask the user for:
- VOICE_NAME: name for the cloned voice (e.g. "My Custom Voice")
- SAMPLE_FILE: absolute path to audio sample file (MP3 or WAV)
- DESCRIPTION (optional): description of the voice

**Important: Audio quality requirements for good cloning results:**
- Minimum 1 minute of clean audio (3+ minutes recommended)
- No background music or noise
- Clear speech only
- Supported formats: MP3, WAV, OGG, FLAC, AAC, M4A

Then run the following steps:

**Step 1 - Check API key and file:**

```bash
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "ERROR: ELEVENLABS_API_KEY not set."
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi

VOICE_NAME="[VOICE_NAME_HERE]"
SAMPLE_FILE="[ABSOLUTE_PATH_TO_SAMPLE_FILE]"
DESCRIPTION="${DESCRIPTION:-}"

if [ ! -f "$SAMPLE_FILE" ]; then
  echo "ERROR: Sample file not found: $SAMPLE_FILE"
  echo "Provide an absolute path to an existing audio file."
  exit 1
fi
```

**Step 2 - Upload voice sample and create clone:**

```bash
# Source: https://elevenlabs.io/docs/api-reference/voices/add
# Use --fail-with-body (NOT -f) - response is JSON with voice_id
DESC_FLAG=""
if [ -n "$DESCRIPTION" ]; then
  DESC_FLAG="-F description=${DESCRIPTION}"
fi

RESPONSE=$(curl --fail-with-body -s \
  -X POST "https://api.elevenlabs.io/v1/voices/add" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "name=${VOICE_NAME}" \
  -F "files=@${SAMPLE_FILE}" \
  -F "remove_background_noise=false" \
  $DESC_FLAG)

if [ $? -ne 0 ]; then
  echo "ERROR: ElevenLabs Voice Cloner API call failed."
  echo "Response: $RESPONSE"
  echo "Check that ELEVENLABS_API_KEY is correct in ~/.claude/.env"
  echo "Run /pocket-knife:setup to reconfigure."
  exit 1
fi
```

**Step 3 - Extract and display voice_id:**

```bash
echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    voice_id = data.get('voice_id', '')
    if not voice_id:
        print('ERROR: No voice_id in response.')
        print('Response: ' + str(data))
        sys.exit(1)
    print('Voice cloned successfully!')
    print('voice_id: ' + voice_id)
    print()
    print('Use this voice_id with:')
    print('  /pocket-knife:elevenlabs-tts (set VOICE to the voice_id above)')
    print('  /pocket-knife:elevenlabs-voice-changer (set VOICE_ID to the voice_id above)')
except json.JSONDecodeError as e:
    print('ERROR: Could not parse API response: ' + str(e))
    sys.exit(1)
"
```

Report to the user:
- The voice_id of the newly created voice
- Instructions to use it with elevenlabs-tts and elevenlabs-voice-changer
- If quality seems poor: remind about minimum 1 min clean audio requirement
