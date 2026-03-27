---
name: dialogue-audio
description: "Multi-speaker dialogue guide. Script format, voice assignment, pacing for elevenlabs-dialogue."
allowed-tools: []
disable-model-invocation: false
---

# Multi-Speaker Dialogue Audio Guide

Use `/pocket-knife:elevenlabs-dialogue` to produce audio with multiple distinct voices in a single request.
Supports up to 10 unique voices per generation. Output is a single MP3 with natural conversation flow.

## How Dialogue Generation Differs from TTS

| Feature | TTS (`elevenlabs-tts`) | Dialogue (`elevenlabs-dialogue`) |
|---------|----------------------|--------------------------------|
| Speakers | 1 | Up to 10 |
| Natural turn-taking | No | Yes — model handles transitions |
| Interruptions/overlap | No | Partial support |
| Use case | Narration, announcements | Conversations, interviews, podcasts |

The dialogue endpoint produces more natural pauses and prosodic transitions between speakers than stitching multiple TTS files together manually.

## Available Voices

| Name | Voice ID | Accent | Gender |
|------|----------|--------|--------|
| George | JBFqnCBsd6RMkjVDRZzb | British | Male |
| Rachel | 21m00Tcm4TlvDq8ikWAM | American | Female |
| Aria | 9BWtsMINqrJLrRacOk9x | American | Female |
| Sarah | EXAVITQu4vr4xnSDxMaL | American | Female |
| Charlie | IKne3meq5aSn9XLyUdCD | Australian | Male |

Choose voices that contrast clearly — avoid assigning two similar-sounding voices (e.g., Rachel and Aria) to characters the listener needs to distinguish quickly.

## Script Formatting for Dialogue

When providing your script, use the `Speaker: Line` format, one line per turn:

```
Alice: Have you tried the new product yet?
Bob: I tested it last week, actually. It exceeded my expectations.
Alice: Really? What stood out to you?
Bob: The speed. It processed everything in under two seconds.
```

Each line becomes one segment in the `inputs` array with the assigned `voice_id`.

## Voice Assignment Strategy

**2-speaker conversation (interview/podcast):**
- Host: George (authoritative, structured)
- Guest: Charlie (relaxed, conversational)

**2-speaker conversation (educational):**
- Teacher: Rachel (clear, measured)
- Student: Aria (curious, natural)

**3-speaker debate:**
- Moderator: George (neutral, formal)
- Speaker A: Rachel (confident)
- Speaker B: Charlie (casual counterpoint)

**Customer service training:**
- Customer: Aria (frustrated or confused tone through writing)
- Agent: Sarah (helpful, calm)

## Pacing and Timing Through Text

The model infers pacing from punctuation and sentence structure. Use these techniques:

**Short lines = faster pace:**
```
Bob: Agreed.
Alice: Let's move on.
Bob: Good idea.
```

**Longer lines = measured, thoughtful delivery:**
```
Alice: When we reviewed the data last quarter, the trends pointed clearly toward a significant shift in user behavior that we hadn't anticipated in our initial projections.
```

**Emotional cues through word choice** — write dialogue that signals the emotion:
```
Bob: I... I can't believe this happened. (pause through ellipsis)
Alice: Take your time. (short line = patient, calm)
```

## Practical Use Cases

| Use case | Speakers | Suggested voices |
|----------|----------|-----------------|
| Podcast episode | 2 | George + Charlie |
| E-learning scenario | 2 | Rachel + Aria |
| Product demo narration | 2 | Sarah + George |
| Audio drama (3 chars) | 3 | George + Rachel + Charlie |
| Customer support training | 2 | Aria + Sarah |
| Explainer with Q&A | 2 | George + Rachel |

## Line Length Recommendations

| Speaker turn | Recommended word count |
|-------------|----------------------|
| Short reply | 5–20 words |
| Standard reply | 20–60 words |
| Long explanation | 60–120 words |

Avoid single segments over 150 words — break long explanations into two turns for more natural pacing.

## Structuring a Full Episode

For a 5-minute podcast segment (approx. 750 words of dialogue):

1. **Opening hook** — 2–3 short exchanges to establish character voices
2. **Main content** — alternating turns, each 30–80 words
3. **Key insight moment** — one speaker delivers a 100–120 word uninterrupted point
4. **Reaction and discussion** — 4–6 short exchanges
5. **Closing** — 2 lines each, clear wrap-up

Keep total segments under 25 per request for reliability. For longer content, split into multiple requests and concatenate the MP3 files.

## Workflow with Other Skills

- Generate transcript with an LLM → produce audio with `/pocket-knife:elevenlabs-dialogue`
- Add background music: generate with `/pocket-knife:elevenlabs-music` → layer in an audio editor
- Transcribe an existing conversation with `/pocket-knife:elevenlabs-stt` → adapt as a script → re-voice
