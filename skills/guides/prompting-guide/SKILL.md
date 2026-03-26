---
name: prompting-guide
description: "Prompt engineering for LLM, image and video. Techniques: chain-of-thought, few-shot."
allowed-tools: []
disable-model-invocation: false
---

# Prompt Engineering Guide

## LLM Prompts

**Formula:** Role + Task + Constraints + Output Format

| Element | Example |
|---------|---------|
| Role | "You are a senior software engineer specializing in security" |
| Task | "Review this code for vulnerabilities" |
| Constraints | "Focus on SQL injection and XSS only" |
| Output | "Return a JSON list of issues with severity: critical/high/medium/low" |

**Techniques:**

| Technique | When to use | Example |
|-----------|-------------|---------|
| Chain-of-thought | Complex reasoning | "Think step by step before answering" |
| Few-shot | Pattern matching | Provide 2-3 examples before the actual request |
| System prompt | Persistent behavior | Set tone, persona, format at session start |
| Temperature 0 | Deterministic output | Code generation, data extraction |
| Temperature 0.7+ | Creative output | Brainstorming, marketing copy |

**Chain-of-thought template:**
```
Let's solve this step by step:
1. First, understand the problem: [restate in your own words]
2. Identify constraints: [list limitations]
3. Consider approaches: [list 2-3 options]
4. Choose the best approach: [explain why]
5. Execute: [the actual answer]
```

## Image Generation Prompts

**Formula:** Subject + Style + Composition + Lighting + Technical

| Element | Examples |
|---------|----------|
| Subject | "portrait of a scientist", "mountain landscape", "product shot of a coffee cup" |
| Style | "photorealistic", "watercolor", "cinematic", "oil painting", "digital art" |
| Composition | "centered", "rule of thirds", "close-up", "wide shot", "bird's eye view" |
| Lighting | "golden hour", "studio lighting", "dramatic shadows", "soft diffused light" |
| Technical | "4K", "high resolution", "sharp focus", "bokeh background", "HDR" |

**Complete example:**
`"Portrait of a scientist in a lab, oil painting style, centered composition, warm laboratory lighting, detailed, high resolution"`

**Negative prompts** (what to exclude):
`"blurry, low quality, distorted, extra limbs, watermark, text"`

## Video Prompts

**Formula:** Shot Type + Subject + Action + Setting + Lighting + Style + Technical

| Shot Type | Use for |
|-----------|---------|
| Tracking shot | Following moving subjects |
| Static/locked | Dialogue, product reveals |
| Aerial/drone | Establishing shots, scale |
| Close-up | Emotion, product details |
| POV | Immersive first-person |

**Complete example:**
`"Tracking shot of a red sports car, driving through Tokyo at night, neon reflections, cinematic color grade, 4K 24fps"`

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Too vague: "write code" | Specify language, purpose, constraints: "Write Python function to validate email format, return bool" |
| Too long: 500-word prompt | Break into steps; use few-shot for structure |
| No output format | Always specify: "Return as JSON", "Answer in bullet points", "Max 3 sentences" |
| Missing context | Include relevant background: tech stack, audience, goal |
| Image: just the subject | Add style + lighting + technical for quality |

## Prompt Templates by Use Case

**Code review:** "Review [LANGUAGE] code for [CONCERN]. Focus on [SPECIFIC_ASPECT]. Return issues as: [ISSUE]: [EXPLANATION] ([SEVERITY])"

**Content creation:** "Write a [FORMAT] about [TOPIC] for [AUDIENCE]. Tone: [TONE]. Length: [LENGTH]. Include: [KEY_POINTS]"

**Data analysis:** "Analyze this [DATA_TYPE] and identify [GOAL]. Format: [FORMAT]. Highlight anomalies above [THRESHOLD]"