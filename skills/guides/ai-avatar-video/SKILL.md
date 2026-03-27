---
name: ai-avatar-video
description: "AI avatar video guide. Talking head animation, image-to-video workflow, face animation tips."
allowed-tools: []
disable-model-invocation: false
---

# AI Avatar Video Guide

Use `/pocket-knife:image-to-video` to animate a portrait or character image into a talking-head or expressive avatar video.
The skill uses fal.ai Wan 2.2 5B, which accepts a static image and a motion prompt, returning an MP4.

## How Image-to-Video Works for Avatars

The model interprets the source image and applies motion guided by your text prompt. For avatar use:
- Subtle head movements, blinking, and lip movement are achievable with targeted prompts
- Full body movement works best when the character is clearly isolated from the background
- Realistic results require a high-quality, well-lit source image

## Ideal Source Image Properties

| Property | Requirement |
|----------|-------------|
| Resolution | 512×512 minimum; 1024×1024 or higher preferred |
| Subject | Clear face or full body, well-lit |
| Background | Simple or solid — busy backgrounds reduce animation quality |
| Format | JPEG or PNG hosted at a public HTTPS URL |
| Pose | Neutral, forward-facing for talking head; side views work for profiles |

The image must be a **publicly accessible HTTPS URL** — local file paths are not supported. Upload the image to a CDN, cloud storage bucket, or image host first.

## Motion Prompt Formula for Avatars

`[Facial/body action] + [Style descriptor] + [Camera behavior] + [Technical quality]`

**Examples:**

| Effect desired | Prompt |
|---------------|--------|
| Talking head, professional | `"person speaking naturally, subtle head nods, lips moving, professional lighting, cinematic"` |
| Animated character | `"character blinking and smiling, slight head tilt, warm lighting, smooth animation"` |
| Dramatic avatar | `"person delivering a speech, confident gestures, dramatic lighting, cinematic close-up"` |
| Subtle life animation | `"gentle blinking, micro-expressions, natural breathing movement, soft studio light"` |
| Fantasy avatar | `"elf character turning head slowly, glowing eyes, magical ambient light, fantasy style"` |

## Workflow: Static Portrait to Avatar Video

**Step 1 — Prepare the source image**
- Use `/pocket-knife:ai-image-generation` to generate a portrait with a specific character design
- Or use `/pocket-knife:background-removal` to isolate a real person on a clean background
- Upload the result to a public image host (e.g., Imgur, Cloudinary, or an S3 bucket with public access)

**Step 2 — Animate with image-to-video**
- Run `/pocket-knife:image-to-video` with the public image URL
- Use an avatar-specific motion prompt (see examples above)
- Generation takes 1–3 minutes; the skill polls automatically

**Step 3 — Add voice (optional)**
- Generate speech with `/pocket-knife:elevenlabs-tts` using a voice that matches the avatar's character
- Layer audio over the video in any video editor (CapCut, DaVinci Resolve, Premiere)

## Face Animation Tips

**For realistic talking motion:**
- Include `"lips moving"` or `"speaking"` explicitly in the prompt
- Add `"natural head movement"` for lifelike micro-motion
- Avoid over-specifying — `"nodding vigorously"` often produces distortion

**For cartoon or illustrated characters:**
- Add `"smooth animation"` and `"cartoon style consistent"` to maintain style
- Illustrated characters with exaggerated features animate more predictably than photorealistic ones

**For minimal motion (looping background avatar):**
- Use `"very subtle breathing motion, gentle blinking, nearly static, ambient movement only"`
- This works well for profile pictures, loading screens, and background presenters

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Face distorts mid-video | Complex background distracting the model | Use background-removal before animating |
| No lip movement | Prompt too vague | Add `"lips moving"`, `"speaking"` explicitly |
| Stiff, no motion | Low-contrast source image | Use sharper, higher-contrast portrait |
| Wrong motion applied | Ambiguous prompt | Be specific: `"slight head turn to the right"` not `"move"` |
| Image URL rejected | Private or expired URL | Re-upload to a public host with permanent link |

## Use Cases

| Use case | Source image | Motion prompt |
|----------|-------------|---------------|
| Course presenter avatar | AI-generated instructor | `"speaking to camera, natural nods, professional"` |
| Brand mascot animation | Illustrated character | `"blinking, friendly smile, slight wave, cartoon"` |
| Social media avatar | Product photo + person | `"looking at camera, subtle smile, modern aesthetic"` |
| Game character cutscene | Fantasy character art | `"dramatic head turn, intense expression, cinematic"` |

## Workflow with Other Skills

1. `/pocket-knife:ai-image-generation` — generate the portrait
2. `/pocket-knife:background-removal` — isolate subject if needed
3. `/pocket-knife:image-to-video` — animate the portrait
4. `/pocket-knife:elevenlabs-tts` — generate matching voice narration
5. Combine video + audio in your editor of choice
