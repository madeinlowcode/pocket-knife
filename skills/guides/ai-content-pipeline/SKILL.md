---
name: ai-content-pipeline
description: AI content repurposing pipeline turning one piece into multiple formats with workflow and quality gates.
---

# AI Content Repurposing Pipeline

## The Core Principle

Create once. Distribute everywhere. The goal is not to write 10 separate pieces of content — it is to extract maximum value from one high-effort, high-quality source piece.

The pipeline flows from **long-form → medium-form → short-form → micro-format.**

---

## The Full Repurposing Map

```
SOURCE: Long-form content (blog post, podcast, webinar, YouTube video)
│
├── MEDIUM-FORM
│   ├── LinkedIn article (condensed, 800–1200 words)
│   ├── Email newsletter (intro + 3 key insights + link)
│   └── YouTube video script (if source was written)
│
├── SHORT-FORM
│   ├── LinkedIn text post (hook + 3 insights + CTA)
│   ├── Twitter/X thread (6–10 tweets)
│   ├── Instagram carousel (8–10 slides)
│   ├── TikTok / Reels script (45–60 seconds)
│   └── Facebook post (1–3 paragraphs)
│
└── MICRO-FORMAT
    ├── 5 standalone tweets (one insight each)
    ├── 5 quote graphics (pull quotes from source)
    ├── 1 infographic (key stats or framework as visual)
    ├── 3 email subject line options (for A/B testing)
    └── FAQ expansion (for SEO, support docs)
```

---

## Source Content Types and Their Yield

| Source Format | Richest Derivative Formats |
|--------------|--------------------------|
| Long blog post (1500+ words) | Thread, carousel, newsletter, LinkedIn post, shorts |
| Podcast episode (30–60 min) | Blog post, newsletter, 3–5 Reels scripts, thread |
| Webinar or long YouTube video | Blog, carousel, 5+ short clips, email sequence |
| Interview or Q&A | Quote cards, Twitter thread, FAQ article |
| Case study | LinkedIn post, carousel, testimonial card, email story |
| Research/data report | Infographic, thread, carousel, press release |

---

## The AI Repurposing Workflow

### Step 1 — Prepare the Source

Before prompting, prepare your source content:
- Transcribe audio/video (use Whisper, Otter, Riverside, or similar)
- Clean the transcript: remove filler words, fix speaker labels
- Tag the highest-value sections (insights, stats, stories, frameworks)

### Step 2 — Extract the Core Message

```
Prompt:
"Read this content carefully: [paste content]

Extract:
1. The single most important insight (1 sentence)
2. The top 5 supporting points (1 sentence each)
3. The most quotable sentence (verbatim)
4. The primary audience and their problem being solved
5. The actionable takeaway for the reader"
```

Use this extraction as the foundation for all derivative formats. Every piece should point back to the same core message.

### Step 3 — Generate Per Format

Use format-specific prompts (see prompts below), always including:
- The extracted core message
- The target audience
- The core takeaways
- Platform constraints (length, format)

### Step 4 — Review and Calibrate

AI output will be generic without calibration. For each generated piece:
1. Add one personal detail, story beat, or specific data point not in the original
2. Adjust the opening hook — AI hooks are often weak
3. Ensure the CTA is appropriate for the platform
4. Read aloud to catch awkward phrasing

### Step 5 — Publish and Distribute

Stagger publication across 1–2 weeks. Do not publish all derivatives on the same day.

```
Suggested stagger:
Day 1:   Publish source (blog post / podcast / video)
Day 1:   Send email newsletter featuring the source
Day 2:   LinkedIn article or text post
Day 3:   Twitter/X thread
Day 5:   Instagram carousel
Day 7:   TikTok / Reels
Day 10:  Quote cards (pick best-performing from early posts)
Day 14:  Repurpose best-performing derivative again (quote-tweet, re-share)
```

---

## AI Prompts Per Format

### Blog Post → LinkedIn Post

```
Here is a blog post: [paste]

Write a LinkedIn post:
- Line 1: Bold hook that works without reading the post
- Lines 2–8: 3 key insights from the post, one paragraph each
- Final 2 lines: Takeaway + question for comments
- 3–5 hashtags
- Under 1300 characters total
- Do NOT mention "In this post I wrote..." or link to the article
```

### Blog Post → Twitter Thread

```
Here is a blog post: [paste]

Write a 8-tweet thread:
- Tweet 1: Hook that makes the thread worth reading (bold claim or curiosity gap)
- Tweets 2–7: One key point per tweet, under 280 chars each
- Tweet 8: Summary + "Save this thread if useful"
- Number as 1/ 2/ 3/ etc.
```

### Podcast Transcript → Instagram Carousel

```
Here is a podcast transcript: [paste]

Write a 10-slide Instagram carousel:
Per slide: headline (under 8 words) + body copy (under 25 words) + visual suggestion
Slide 1: Hook — the most surprising or counterintuitive insight
Slides 2–9: One actionable point per slide, ordered logically
Slide 10: Summary + CTA to follow or save
```

### Any Source → Email Newsletter

```
Here is content I want to turn into a newsletter section: [paste]

Write a newsletter section:
- Subject line: 3 options (curiosity, benefit, contrarian)
- Preview text: 1 option (40 chars)
- Opening: 2 sentences connecting to reader's situation
- Body: 3 key insights, each with a 1-sentence takeaway
- Closing: 1 sentence CTA (read full piece, try something, reply with answer)
- Tone: [conversational/professional]
```

---

## Quality Gates

Before publishing any derivative piece, verify:

**Accuracy gate:**
- [ ] No facts from the source were distorted in AI generation
- [ ] Statistics and quotes are verbatim, not paraphrased incorrectly

**Value gate:**
- [ ] This piece delivers standalone value (reader doesn't need to see the source)
- [ ] The CTA is appropriate for someone who hasn't seen the source

**Voice gate:**
- [ ] At least one personal addition that AI could not have generated
- [ ] Reads like you wrote it, not like a tool generated it

**Platform gate:**
- [ ] Correct length for the platform
- [ ] Correct format (hashtags on LinkedIn, thread numbers on Twitter, etc.)
- [ ] Hook is rewritten (AI default hooks are predictable)

---

## Repurposing Cadence

| Content Volume | Recommended Cadence |
|---------------|-------------------|
| 1 long piece/week | Full pipeline, staggered over 7–10 days |
| 1 long piece/month | Full pipeline, staggered over 2–3 weeks |
| Daily short content | Reverse: pull quotes from past long pieces |

---

## Tools Stack Reference

| Task | Tools |
|------|-------|
| Transcription | Whisper (local), Otter.ai, Riverside, Descript |
| AI writing | Claude, GPT-4, Gemini |
| Carousel design | Canva, Adobe Express, Figma |
| Scheduling | Buffer, Hypefury, Typefully, Later |
| Link tracking | UTM parameters (manual), Bitly, Dub.co |
| Newsletter | Beehiiv, Substack, ConvertKit |
