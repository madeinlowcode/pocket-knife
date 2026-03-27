---
name: content-repurposing
description: Guide for repurposing content across formats using the atomic content model.
---

# Content Repurposing

Repurposing turns one piece of content into many. The atomic content model separates production from distribution: create once, adapt everywhere.

## The Atomic Content Model

```
Pillar Content (long-form, evergreen)
    │
    ├── Derivative A (thread / carousel)
    ├── Derivative B (short video / reel)
    ├── Derivative C (newsletter section)
    ├── Derivative D (quote card)
    └── Derivative E (podcast segment)
```

A **pillar** is the canonical, fully-researched piece: a long blog post, a recorded video, a live workshop, or a detailed report. Derivatives are smaller, platform-native adaptations — never standalone originals.

Rules:
- Never publish a derivative before the pillar exists
- Each derivative must be independently valuable (no "read the full post for more")
- Derivative quality gates must pass before scheduling (see section 5)

## Format Matrix

### Blog Post → Thread (Twitter / X / LinkedIn)

1. Extract the 5–7 most surprising or actionable insights
2. Each insight becomes one tweet/post (max 280 chars on Twitter, 700 on LinkedIn)
3. Tweet 1 = hook (the counterintuitive claim or bold result)
4. Tweet 2–N = insights in logical order
5. Final tweet = CTA + link to pillar

Hook formula options:
- "I spent 6 months doing X. Here's what I learned: [thread]"
- "Most people do X wrong. The fix is simple:"
- "Unpopular opinion: [claim]. Here's the data:"

### Long Video → Clips

| Output | Length | Platform | What to extract |
|---|---|---|---|
| Reel / Short | 15–60s | Instagram, TikTok, YouTube | Peak moment, surprising stat |
| Story | 15s | Instagram, Facebook | CTA or teaser |
| Clip | 1–3 min | LinkedIn, Twitter | Self-contained argument |
| Highlight | 5–10 min | YouTube | Best segment |

Clip selection criteria: emotional peak, knowledge drop, controversy, or strong CTA. Never cut mid-sentence.

### Podcast Episode → Quotes

1. Transcribe with Whisper or a transcription service
2. Tag high-value moments: surprising statement, quotable advice, story punch line
3. Format as audiogram (waveform + caption) for social, or plain text quote card
4. Quote card dimensions: 1080×1080 for Instagram, 1200×628 for Twitter/LinkedIn

### Presentation → Carousel

A slide deck maps naturally to a carousel:
- Slide 1 = Cover (hook + visual)
- Slides 2–9 = One idea per slide, large text, minimal visuals
- Last slide = Summary + CTA

LinkedIn carousels: export as PDF (max 300 pages, practical max 10–12). Instagram carousels: export slides as individual images.

### Report / Research → Newsletter Section

1. Identify the single most relevant finding for your audience
2. Write a 3-sentence summary: finding → implication → action
3. Add one data point or chart
4. Link to full report for credibility

## Platform Adaptation Rules

| Platform | Tone | Length | Visual | Frequency |
|---|---|---|---|---|
| Twitter / X | Punchy, direct | Short | Optional | 1–3/day |
| LinkedIn | Professional, story | Medium | Required | 1/day |
| Instagram | Visual-first | Caption secondary | Required | 1/day |
| TikTok / Reels | Casual, fast | 15–60s video | Required | 1/day |
| Newsletter | Conversational | 300–800 words | Optional | 1–2/week |
| YouTube | Educational | 8–20 min | Required | 1–2/week |

Cross-posting without adaptation is the most common repurposing mistake. Each platform has a native content language — adapt, do not copy-paste.

## Quality Gates per Format

Before scheduling any derivative, check:

### Thread / Post
- [ ] Hook is compelling in isolation (would you stop scrolling?)
- [ ] Each item is self-contained (no "continued in next tweet")
- [ ] CTA is one specific action, not multiple

### Short Video / Clip
- [ ] Opens with movement or spoken word in the first 2 seconds (no title card)
- [ ] Captions are present (85% of mobile video is watched muted)
- [ ] No dead air over 2 seconds
- [ ] Clear verbal or on-screen CTA

### Carousel
- [ ] Cover slide communicates the value proposition alone
- [ ] Text readable at thumbnail size (min 28px equivalent)
- [ ] Consistent visual theme across all slides

### Newsletter Section
- [ ] Can be read in under 90 seconds
- [ ] One core idea, not multiple
- [ ] Reply or click CTA included

### Quote Card
- [ ] Quote is 15 words or fewer
- [ ] Attribution is visible
- [ ] High-contrast text on background

## Workflow Automation

### Minimal Automation Stack

```
Record / Write Pillar
        ↓
Transcribe (Whisper API or Descript)
        ↓
Extract Key Points (LLM prompt)
        ↓
Generate Derivatives (LLM per format)
        ↓
Human Quality Review
        ↓
Schedule (Buffer / Later / Hypefury)
```

### LLM Extraction Prompt Pattern

```
You are a content strategist. Given the following [blog post / transcript], extract:
1. Five hook candidates for a Twitter thread (one sentence each)
2. Seven key insights (one sentence each, standalone)
3. Three quote-worthy statements (15 words or fewer)
4. One newsletter summary (3 sentences: finding, implication, action)

Content:
[PILLAR_CONTENT]
```

### Scheduling Cadence

Avoid flooding all channels on the same day. Spread derivatives over 7–14 days:

```
Day 0   → Publish pillar (blog / video / podcast)
Day 1   → LinkedIn post + Twitter thread
Day 2   → Instagram carousel
Day 3   → Short clip (TikTok / Reel)
Day 5   → Newsletter mention
Day 7   → Quote card + second clip
Day 14  → Aggregate thread ("most people missed this from [pillar]")
```

## Evergreen vs Timely Content

| Type | Repurposing window | Frequency |
|---|---|---|
| Evergreen (how-to, principles) | 12–24 months, re-promote periodically | Recycle every 6 months |
| Timely (news, trends) | 24–72 hours | Do not recycle; archive |
| Data / Research | Until superseded by newer data | Re-promote when data cited externally |

Mark evergreen pillars in your content library. Set a 6-month calendar reminder to re-derive and re-distribute.

## Content Library Structure

Maintain a single source-of-truth spreadsheet or database:

| Column | Description |
|---|---|
| Pillar ID | Unique identifier |
| Title | Pillar title |
| Format | Blog / Video / Podcast / Deck |
| Published Date | ISO date |
| Evergreen? | Yes / No |
| Derivatives | Links to all published derivatives |
| Next Re-promote | Date for next repurposing cycle |
| Performance | Best-performing derivative by reach |
