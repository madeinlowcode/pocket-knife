---
name: ai-voice-cloning
description: "Guide for cloning voices with ElevenLabs. Sample prep, quality tips, ethical use."
allowed-tools: []
disable-model-invocation: false
---

# AI Voice Cloning Guide

Use `/pocket-knife:elevenlabs-voice-cloner` to create a custom voice from audio samples.
The resulting `voice_id` works with `/pocket-knife:elevenlabs-tts` and `/pocket-knife:elevenlabs-voice-changer`.

## How Voice Cloning Works

ElevenLabs analyzes uploaded audio to extract voice characteristics — timbre, pitch, cadence, and accent. The clone is stored in your ElevenLabs account and assigned a `voice_id` that you can reuse across TTS requests.

## Audio Sample Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Duration | 1 minute | 3–5 minutes |
| Noise floor | Clean (no music) | Completely silent background |
| Speakers | 1 only | 1 only |
| Format | MP3, WAV | WAV 44.1kHz 16-bit |
| Content | Clear speech | Varied sentences |

## Preparing Your Audio Sample

**Step 1 — Record or source audio**
- Use a condenser microphone or a modern smartphone in a quiet room
- Avoid rooms with echo — record in a carpeted room or with sound panels
- Maintain consistent distance from mic (20–30 cm)

**Step 2 — Clean the audio (if needed)**
- Remove background music or ambient noise using a DAW (Audacity is free)
- Cut out long silences (keep natural pauses, remove dead air over 3 seconds)
- Normalize loudness to around -14 LUFS

**Step 3 — Content variety**
Include sentences with:
- Questions and statements (intonation variety)
- Short and long sentences (pacing variety)
- Words with different vowel and consonant patterns
- Natural emotion (avoid robotic monotone reading)

## Quality Checklist Before Uploading

- [ ] Single speaker throughout the entire file
- [ ] No background music, TV, or environmental noise
- [ ] No clipping (audio peaks going into red)
- [ ] At least 1 full minute of actual speech (not silence)
- [ ] Consistent recording environment (no room change mid-file)

## Ethical Considerations

Voice cloning carries serious ethical responsibilities:

**You must only clone:**
- Your own voice
- A voice for which you have explicit written consent from the speaker
- Public figures only for clearly satirical or educational contexts where local law permits

**Never clone a voice to:**
- Impersonate someone without their knowledge
- Create fraudulent audio for scams, deepfakes, or misinformation
- Bypass consent in any commercial or broadcast context

ElevenLabs Terms of Service require you to confirm you have the rights to clone any voice you upload.

## Using the Cloned Voice

After cloning, you receive a `voice_id`. Use it with:

```
/pocket-knife:elevenlabs-tts
  TEXT: "Your script here"
  VOICE: [your_voice_id]
```

The voice_id persists in your ElevenLabs account — you do not need to re-clone for each use.

## Troubleshooting Poor Quality

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Robotic or flat output | Monotone training audio | Re-record with more expressive reading |
| Wrong accent detected | Short or unclear sample | Add more varied speech, minimum 3 min |
| Noisy output | Background noise in sample | Use audio editor to clean the sample |
| Missing emotion | Single-tone reading | Include varied emotional content in sample |
| Clone sounds generic | Too little audio | Increase to 5+ minutes |

## Workflow Example

1. Record 3 minutes of natural speech as WAV
2. Run `/pocket-knife:elevenlabs-voice-cloner` with the file path and a name
3. Save the returned `voice_id`
4. Use `/pocket-knife:elevenlabs-tts` with that voice_id to generate narration
5. Reuse the same voice_id for consistent brand voice across projects
