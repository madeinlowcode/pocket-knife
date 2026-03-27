---
name: ai-podcast-creation
description: AI podcast production guide covering scripting, voice synthesis, multi-speaker dialogue, and distribution.
---

# AI Podcast Creation

## What AI Can and Cannot Do

**AI handles well:**
- Script generation from outlines, briefs, or source material
- Consistent voice synthesis (single or multiple speakers)
- Show notes, episode summaries, and chapter markers
- Transcript cleanup and formatting
- Intro/outro copy and audio branding scripts

**AI cannot replace:**
- Genuine spontaneous conversation between real people
- Authentic emotion, laughter, and unpredictable chemistry
- Expert credibility from real lived experience
- Live interviews and dynamic Q&A

Use AI to **produce** what humans would take 5x longer to do, not to simulate what humans do best.

---

## Episode Types and Their AI Suitability

| Episode Format | AI Suitability | Notes |
|---------------|----------------|-------|
| Solo explainer / educational | Excellent | Full script → voice synthesis works well |
| Scripted dialogue (2 hosts) | Good | Multi-speaker synthesis; needs natural break cadence |
| Interview simulation | Moderate | Requires careful scripting of "guest" lines |
| News roundup / briefing | Excellent | Pull from sources, summarize, synthesize voice |
| Narrative / documentary | Good | Strong for scripted storytelling |
| Live interview (real guest) | Not applicable | AI assists with prep, show notes, editing only |

---

## Script Generation Framework

### Episode Brief (Input for AI)

Before generating any script, define:

```
Topic: [Specific, not broad]
Audience: [Who is listening, what do they already know]
Episode goal: [Educate / entertain / persuade / update]
Format: [Solo / dialogue / narrative]
Duration target: [5 / 10 / 20 / 45 minutes]
Tone: [Casual / authoritative / storytelling / conversational]
Key points to cover: [3–5 bullet points]
Point of view: [Are we neutral, opinionated, or analytical?]
Call to action: [What should listeners do after?]
```

### AI Prompt for Full Episode Script

```
Write a [X-minute] podcast script on [topic].

Format: [Solo host / Two hosts named A and B / Narrator-led]
Audience: [Describe]
Tone: [Casual and conversational / Educational and authoritative]

Structure:
1. Cold open (30 seconds): Start mid-thought or with a provocative question
2. Intro (60 seconds): Host intro, episode preview, what listener will get
3. Main content ([X minutes]): Cover these points: [list]
4. Transition bumpers between sections: "Let's talk about..." / "Now here's where it gets interesting..."
5. Outro (60 seconds): Summary, CTA, sign-off

Write in spoken language — contractions, short sentences, natural pauses.
Mark pauses as [PAUSE], emphasis as [EMPHASIS], and section breaks as [MUSIC STING].
```

---

## Writing for Spoken Audio

Scripts read differently from written text. Follow these rules:

**Sentence length:** Spoken sentences should be under 20 words. Long sentences cause voice synthesis to lose natural rhythm.

**Avoid:** Semicolons, em dashes inside sentences, parenthetical asides — these confuse TTS models.

**Use instead:**
```
Written: "The results—which surprised even the researchers—showed a 40% improvement."
Spoken: "The results showed a 40% improvement. The researchers were genuinely surprised."
```

**Numbers:** Write out numbers in words when they appear mid-sentence.
```
Avoid: "3 out of 4 founders fail in year 1"
Use: "Three out of four founders fail in their first year"
```

**Technical terms:** Spell phonetically in brackets if the TTS model mispronounces:
```
"The company Xiaomi [shao-mee] announced..."
```

---

## Multi-Speaker Dialogue Design

For two-host formats, write with distinct voice personalities:

```
Host A: [Analytical, asks clarifying questions, more formal]
Host B: [Conversational, uses analogies, brings it back to the audience]
```

**Dialogue pacing rules:**
- Alternate speaking turns every 2–4 sentences (not longer monologues)
- Include natural reactions: "Right, exactly." / "That's a good point." / "Interesting."
- Write disagreement: authentic podcasts have moments of different perspectives
- Avoid identical sentence structure between hosts

**Sample multi-speaker template:**

```
[HOST A]: The report showed that [X]. What's surprising is [Y].

[HOST B]: Yeah, and if you think about it from [audience perspective], that means [implication].

[HOST A]: Exactly. So the question becomes: [question that leads to next point].

[HOST B]: And I think the answer depends on [nuance]. Let me explain what I mean...
```

---

## Voice Synthesis Tools

| Tool | Strengths | Best For |
|------|-----------|----------|
| ElevenLabs | High realism, emotion control, voice cloning | Single host, short clips, premium quality |
| Murf | Multiple voices, good for dialogue, team use | Multi-speaker, budget-friendly |
| PlayHT | Voice cloning, API access, multilingual | Developers building pipelines |
| Speechify | Fast generation, mobile-friendly | Quick drafts, newsletter-to-audio |
| Suno / Udio | Music generation for intro/outro | Background music, jingles |
| NotebookLM (Google) | Automatic dialogue from documents | Quick research podcasts |

### Voice Selection Tips
- Avoid choosing the most common default voices — your podcast sounds like everyone else's
- Match voice gender and age to your brand persona
- Test with a 30-second sample before committing to a full episode
- Use "stability" and "clarity" controls (ElevenLabs) to reduce over-emoting on expository content

---

## Intro and Outro Scripts

### Intro Template (30–45 seconds)

```
[MUSIC STING IN]
Welcome to [Podcast Name] — [one-line show description].
I'm [host name/persona].

Today: [3 things the listener will take away, stated as outcomes].

Let's get into it.
[MUSIC FADE]
```

### Outro Template (45–60 seconds)

```
[MUSIC STING IN]
That's a wrap on today's episode.

The big takeaway: [1-sentence summary of core message].

If this was useful, [subscribe / share / leave a review / follow us].

Next time: [tease next episode topic in 1 sentence].

See you then.
[MUSIC FADE OUT]
```

---

## Show Notes Generation

Show notes serve SEO and listener convenience. Generate with this prompt:

```
Write show notes for a podcast episode titled "[title]" about [topic].

Include:
1. Episode summary (3–5 sentences, written for search engines)
2. Key timestamps (format: 00:00 — Topic name)
3. Top 5 takeaways (bullet points)
4. Resources mentioned: [list any if applicable]
5. Guest bio: [if applicable]
6. CTA: subscribe / follow / newsletter / community link

Target length: 300–500 words. Optimize for the keyword: [main topic keyword].
```

---

## Distribution Checklist

**Audio file:**
- [ ] MP3, 128kbps minimum (192kbps for music-heavy shows)
- [ ] Normalized to -16 LUFS (podcast standard loudness)
- [ ] Intro and outro trimmed cleanly
- [ ] ID3 tags filled: title, artist, album, episode number, cover art

**Publishing platforms:**
- [ ] RSS feed via hosting platform (Buzzsprout, Anchor, Transistor, Podbean)
- [ ] Submitted to: Spotify, Apple Podcasts, Google Podcasts, Amazon Music
- [ ] Episode title uses searchable keywords (not just episode number)

**Supporting content:**
- [ ] Show notes published to hosting platform and/or website
- [ ] Transcript available (accessibility + SEO)
- [ ] Audiogram clip (30–60 second video of key quote) for social media
- [ ] Episode announced on newsletter and social channels
