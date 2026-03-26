---
name: content-guide
description: "Content guide: AI pipelines, podcast creation, automation, photography."
allowed-tools: []
disable-model-invocation: false
---

# Content Guide

## AI Content Pipeline

**End-to-end workflow:**
1. **Research** → Use web search skill for topic research, competitor content gaps
2. **Brief** → Generate SEO brief (target keyword, outline, word count)
3. **Draft** → Generate first draft with LLM (GPT-4/Claude)
4. **Edit** → Human review: fact-check, add personal insight, adjust tone
5. **Visuals** → Generate images with image skills (Imagen/FLUX/Qwen)
6. **Publish** → Schedule with appropriate lead time

**Quality checklist before publishing:**
- [ ] All facts verified (AI hallucinates statistics)
- [ ] Personal voice added (AI writing sounds generic)
- [ ] Internal links to existing content
- [ ] Meta description written
- [ ] Image alt text added

## AI Automation Workflows

**Content repurposing automation:**
```
Input: Long-form blog post (1500+ words)
           ↓
    Extract key insights (LLM)
           ↓
    ┌──────────────────────────┐
    │  Twitter thread (7 tweets)│
    │  LinkedIn post            │
    │  Newsletter summary       │
    │  YouTube script outline   │
    └──────────────────────────┘
```

**Prompt for repurposing:**
`"Given this blog post, create: 1) A 7-tweet Twitter thread with hook tweet, 2) A LinkedIn post (150 words), 3) A 3-bullet newsletter summary. Output as JSON with keys: twitter_thread (array), linkedin_post (string), newsletter_summary (string)"`

## AI Podcast Creation

**Pre-production:**
| Task | AI Tool | Output |
|------|---------|--------|
| Topic research | Web search skill | Trending questions in niche |
| Outline | LLM skill | Episode structure with timestamps |
| Questions | LLM skill | 15 interview questions (easy→hard) |
| Script | LLM skill | Intro/outro scripts, ad reads |
| Show notes | LLM skill | Summary + timestamps + links |

**Episode structure (30-minute):**
1. Hook clip (0:00-0:30): Best moment from episode
2. Intro music + welcome (0:30-1:30)
3. Guest intro (1:30-3:00)
4. Main interview (3:00-26:00)
5. Rapid fire questions (26:00-28:30)
6. Outro + CTA (28:30-30:00)

## AI Product Photography

**Prompt formulas by style:**

| Style | Prompt template |
|-------|----------------|
| Studio | "[Product] on white background, studio lighting, commercial photography, sharp focus, 8K" |
| Lifestyle | "[Product] in [setting], natural lighting, lifestyle photography, [mood] atmosphere" |
| Flat lay | "[Product] flat lay, overhead shot, [color] background, minimalist, editorial style" |
| Hero shot | "Hero shot of [product], [color] background, dramatic lighting, product photography, high-end commercial" |

**Technical specs for e-commerce:**
- Main image: white background, product 85% of frame
- Lifestyle images: real-use context, aspirational setting
- Detail shots: close-up of key features or materials
- Dimensions: 2000x2000px minimum for zoom functionality