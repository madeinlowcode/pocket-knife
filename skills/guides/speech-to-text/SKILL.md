---
name: speech-to-text
description: "STT guide. Audio prep, formats, accuracy tips, speaker diarization, post-processing."
allowed-tools: []
disable-model-invocation: false
---

# Speech-to-Text Guide

Use `/pocket-knife:elevenlabs-stt` to transcribe audio files to text using ElevenLabs Scribe v2.
Supports automatic language detection, 32+ languages, and optional speaker diarization.

## Supported Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| MP3 | `.mp3` | Most common; good quality above 128kbps |
| WAV | `.wav` | Lossless; best accuracy |
| FLAC | `.flac` | Lossless compressed; excellent quality |
| OGG | `.ogg` | Common for web audio |
| AAC | `.aac` | Apple devices, good quality |
| M4A | `.m4a` | iPhone recordings default format |

Always provide an absolute path to the file. The skill does not accept relative paths.

## Audio Quality vs. Accuracy

Transcription accuracy is directly tied to audio quality.

| Audio condition | Expected accuracy | Notes |
|----------------|------------------|-------|
| Studio recording, single speaker | Very high | Near-perfect results |
| Phone call, quiet environment | High | Minor errors on unusual words |
| Outdoor recording, some wind | Medium | Background noise reduces accuracy |
| Meeting with multiple speakers | Medium | Enable diarization; overlapping speech causes errors |
| Heavily compressed audio | Low | Re-encode at higher bitrate if possible |

## Preparing Audio for Best Results

**Before transcribing:**
1. **Reduce background noise** — use a noise reduction tool (Audacity's Effect > Noise Reduction)
2. **Normalize loudness** — aim for -14 LUFS; very quiet audio is harder to transcribe
3. **Trim silence** — long gaps at start/end waste processing time but do not affect accuracy
4. **Convert to WAV if in doubt** — lossless format removes codec as a variable

**For meeting recordings:**
- Separate speakers onto different tracks if your recording setup allows it
- Enable diarization with `DIARIZE: true` to label speaker turns

## Language Detection

The model auto-detects language from the audio. You can also specify it explicitly:

| Language | Code |
|----------|------|
| English | `en` |
| Portuguese | `pt` |
| Spanish | `es` |
| French | `fr` |
| German | `de` |
| Italian | `it` |
| Japanese | `ja` |
| Chinese (Mandarin) | `zh` |

**When to specify language manually:**
- Short clips (under 10 seconds) where context is too brief for auto-detection
- Accented speech where the model might misidentify the language
- Mixed-language content where you want the primary language prioritized

## Speaker Diarization

Set `DIARIZE: true` to label which speaker said what. The API labels speakers as `speaker_0`, `speaker_1`, etc.

**Best for:**
- Interview transcriptions (2 speakers)
- Podcast episodes
- Meeting minutes
- Deposition or legal recordings

**Limitations:**
- Overlapping speech is attributed to one speaker only
- Very similar voices may be merged into the same label
- More than 6 speakers significantly reduces diarization accuracy

## Post-Processing the Transcript

Raw transcripts typically need cleanup before use:

**For publishing (articles, subtitles):**
- Remove filler words: `"um"`, `"uh"`, `"you know"`, `"like"`
- Break into paragraphs by topic change
- Add punctuation corrections if the model missed any
- Verify proper nouns, product names, and technical terms

**For subtitle/caption generation:**
- Break into lines of max 42 characters
- Each subtitle block: max 2 lines, 1–7 seconds of screen time
- Sync timestamps from the `words` array in the API response (available in raw JSON)

**For meeting notes:**
- Group by speaker label
- Extract action items: sentences with `"will"`, `"need to"`, `"by [date]"`
- Summarize each speaker's main points with an LLM after transcription

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| File not found | Relative path used | Use absolute path: `/Users/name/file.mp3` |
| 422 Unprocessable Entity | Both file and URL sent | The skill sends file only — check for path conflicts |
| Empty transcript | Audio too quiet or silent | Normalize audio loudness before re-submitting |
| Wrong language | Short clip, auto-detect failed | Set `LANGUAGE` parameter explicitly |
| Garbled output | Heavily compressed audio | Re-encode at 128kbps+ MP3 or use WAV |

## Workflow with Other Skills

- Transcribe → edit → re-voice with `/pocket-knife:elevenlabs-tts` for audio dubbing
- Transcribe a podcast → summarize with an LLM → post summary to social with `/pocket-knife:twitter-automation`
- Transcribe a video interview → use the transcript as a script for `/pocket-knife:elevenlabs-dialogue`
