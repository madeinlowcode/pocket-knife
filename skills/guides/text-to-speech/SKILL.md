---
name: text-to-speech
description: "Comprehensive TTS guide. Voice selection, pronunciation, SSML, use cases for elevenlabs-tts."
allowed-tools: []
disable-model-invocation: false
---

# Text-to-Speech Guide

Use `/pocket-knife:elevenlabs-tts` to convert text to natural-sounding speech audio (MP3).
Supports 32 languages and multiple voice personalities.

## Available Voices

| Name | Voice ID | Accent | Gender | Best for |
|------|----------|--------|--------|----------|
| George (default) | JBFqnCBsd6RMkjVDRZzb | British | Male | Narration, documentaries |
| Rachel | 21m00Tcm4TlvDq8ikWAM | American | Female | Audiobooks, e-learning |
| Aria | 9BWtsMINqrJLrRacOk9x | American | Female | Conversational, social |
| Charlie | IKne3meq5aSn9XLyUdCD | Australian | Male | Casual, ads, podcasts |

Pass the voice name (e.g. `george`, `rachel`) or the full voice_id directly to the VOICE parameter.

## Voice Selection by Use Case

| Use case | Recommended voice | Reason |
|----------|------------------|--------|
| Corporate narration | George | Authoritative British tone |
| E-learning course | Rachel | Clear American, easy to follow |
| Social media content | Aria | Natural conversational energy |
| Podcast ad reads | Charlie | Relaxed, approachable feel |
| Audiobook fiction | Rachel or Charlie | Sustained listenability |
| News/documentary | George | Credible, measured delivery |

## Writing Text for TTS

Good TTS output depends heavily on how you write the input text.

**Punctuation controls pacing:**
- Periods (`.`) create full stops — use for clear sentence separation
- Commas (`,`) add short pauses — use for natural breathing rhythm
- Em dashes (`—`) create a longer pause than a comma
- Ellipses (`...`) suggest a trailing, thoughtful pause

**Capitalization affects emphasis:**
- `VERY important` — all caps words receive stronger stress
- Use sparingly; overuse sounds unnatural

**Numbers and abbreviations:**
- Spell out numbers for natural reading: `"twenty-five"` not `"25"`
- Spell out abbreviations: `"Doctor Smith"` not `"Dr. Smith"` (model handles most, but explicit is safer)
- Currency: `"fifty dollars"` is safer than `"$50"` for all voices

## Pronunciation Control

When a word is mispronounced, rewrite it phonetically in the input text:

| Original | Phonetic spelling |
|----------|------------------|
| `GIF` | `"JIF"` or `"GHIF"` depending on your preference |
| `nginx` | `"engine-x"` |
| `SQL` | `"sequel"` or `"S-Q-L"` |
| Proper nouns | Spell as they sound: `"Elon"` → `"EE-lon"` if needed |

**Homograph disambiguation** — words spelled the same but spoken differently:
- `"She will lead the team"` vs `"made of lead"` — the model usually handles context correctly
- When in doubt, rewrite: `"made of the metal led"` removes ambiguity

## Language Support

The model `eleven_multilingual_v2` handles 32 languages automatically. Simply write the text in the target language and the voice will adapt its phonetics accordingly.

**Tip:** For multilingual scripts (e.g. English with French phrases), write the foreign words in their native spelling — the model code-switches naturally.

## Structuring Long-Form Content

For content over 500 words, break it into segments and generate multiple files:

1. Break script at natural section boundaries
2. Generate each section as a separate MP3
3. Concatenate in your audio editor (Audacity, Reaper, etc.)

This avoids potential truncation and makes re-generation of individual sections easier if you need to fix one part.

## Voice Settings Reference

The skill uses `stability: 0.5` and `similarity_boost: 0.75` as defaults.

| Setting | Low value | High value |
|---------|-----------|------------|
| `stability` | More expressive, varied delivery | More consistent, less emotional |
| `similarity_boost` | More divergence from base voice | Closer match to original voice character |

For scripted corporate content, higher stability (0.7+) gives more consistent multi-segment output. For storytelling or ads, lower stability (0.3–0.5) adds expressiveness.

## Common Mistakes

| Mistake | Effect | Fix |
|---------|--------|-----|
| Pasting raw code or URLs | Robotic spelling of characters | Clean the text; remove non-speech content |
| No punctuation | Run-on delivery with no pauses | Add commas and periods |
| Very long sentences | Breath issues, unnatural pacing | Break into max 30-word sentences |
| Symbols like `&`, `%`, `@` | Inconsistent reading | Spell out: `"and"`, `"percent"`, `"at"` |

## Workflow with Other Skills

- Pair TTS output with `/pocket-knife:elevenlabs-music` — layer voice over background music in an audio editor
- Use `/pocket-knife:elevenlabs-voice-cloner` first to clone a custom voice, then use that voice_id here
- Use `/pocket-knife:elevenlabs-stt` to transcribe reference audio, then re-voice it with a different voice via this skill
