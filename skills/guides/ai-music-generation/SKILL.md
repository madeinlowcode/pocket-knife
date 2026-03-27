---
name: ai-music-generation
description: "Guide for generating AI music with ElevenLabs. Genres, moods, duration, prompt techniques."
allowed-tools: []
disable-model-invocation: false
---

# AI Music Generation Guide

Use `/pocket-knife:elevenlabs-music` to generate original music from text descriptions.

## How the Skill Works

The skill sends a text prompt to ElevenLabs and returns an MP3 file. Duration range is 3–600 seconds. The model interprets musical intent from natural language — genre, tempo, mood, instrumentation, and energy all affect the result.

## Prompt Formula

`[Genre] + [Instrumentation] + [Tempo] + [Mood/Energy] + [Optional: context or era]`

**Examples:**

| Goal | Prompt |
|------|--------|
| Background for a product video | `"ambient electronic, soft synth pads, slow tempo, calm and professional"` |
| Podcast intro | `"upbeat jazz piano trio, medium tempo, friendly and warm, short intro feel"` |
| Action scene | `"orchestral cinematic, full brass and strings, fast tempo, intense and dramatic"` |
| Lofi study music | `"lofi hip hop, mellow piano, dusty drums, slow BPM, relaxed and nostalgic"` |
| Retail/background | `"acoustic pop, light guitar strumming, cheerful, moderate tempo, no lyrics"` |

## Genre Reference

| Genre | Key descriptors to include |
|-------|---------------------------|
| Classical | `orchestral`, `strings`, `piano`, `chamber`, `symphonic` |
| Electronic | `synth`, `EDM`, `house`, `techno`, `ambient`, `bass` |
| Jazz | `piano trio`, `upright bass`, `brushed drums`, `swing`, `bebop` |
| Cinematic | `orchestral`, `emotional`, `score`, `epic`, `tension`, `swell` |
| Folk/Acoustic | `acoustic guitar`, `fingerpicking`, `warm`, `storytelling` |
| Hip Hop | `drums`, `bass`, `lofi`, `sample-based`, `beat` |

## Mood and Energy Words

**Low energy:** `calm`, `peaceful`, `ambient`, `meditative`, `soft`, `quiet`, `relaxed`

**Medium energy:** `friendly`, `warm`, `uplifting`, `moderate`, `balanced`, `professional`

**High energy:** `intense`, `epic`, `dramatic`, `powerful`, `driving`, `fast-paced`, `urgent`

## Duration Guidelines

| Use case | Recommended duration |
|----------|---------------------|
| Social media clip | 15–30 seconds |
| Podcast intro/outro | 10–20 seconds |
| Short video background | 30–60 seconds |
| Full background track | 60–180 seconds |
| Extended ambient loop | 180–600 seconds |

Set duration with the `DURATION` parameter (in seconds). The API accepts 3–600 seconds.

## Common Patterns

**Marketing video background:**
Prompt: `"corporate pop, light electric guitar, upbeat, moderate tempo, optimistic, no lyrics"`
Duration: 60 seconds

**Podcast intro:**
Prompt: `"jazzy piano, short intro stab, energetic, 5 seconds, punchy"`
Duration: 10 seconds

**Horror/suspense:**
Prompt: `"dark ambient, dissonant strings, slow build, tense, eerie atmosphere"`
Duration: 30 seconds

**Children's content:**
Prompt: `"playful ukulele, xylophone, happy and fun, bouncy tempo, kids music"`
Duration: 30 seconds

## Tips for Better Results

- Be specific about instrumentation rather than just genre: `"piano, upright bass, brushed snare"` beats just `"jazz"`
- Include energy descriptors alongside tempo: `"fast tempo, high energy"` is clearer than `"fast"`
- Avoid lyric expectations — the model generates instrumental music
- If the output feels generic, add era references: `"70s funk"`, `"80s synth pop"`, `"90s grunge"`
- For looping tracks, add `"seamless loop"` or `"circular ending"` to the prompt

## Workflow with Other Skills

After generating music, combine with:
- `/pocket-knife:elevenlabs-tts` — add narration over the music track in your editing software
- `/pocket-knife:elevenlabs-dialogue` — produce a podcast script with music as background
- AI video skills — pair generated music with AI-generated video clips
