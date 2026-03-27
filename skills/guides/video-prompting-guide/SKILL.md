---
name: video-prompting-guide
description: Video generation prompting guide for Kling, Veo, Wan, and Seedance with shot language and motion tips.
---

# Video Generation Prompting Guide

## Core Prompt Architecture

Every strong video prompt has four layers:

```
[Subject] + [Action/Motion] + [Environment/Setting] + [Camera/Style]
```

Example:
```
A red fox [subject] leaps across a frozen river [action/setting],
slow motion, golden hour lighting, shot on 35mm film [camera/style]
```

Always specify motion explicitly. Video models default to minimal movement if motion is not described.

---

## Universal Principles (All Models)

1. **Be motion-specific.** "A person stands" generates a static image. "A person walks forward slowly, looking left" generates motion.
2. **Define the camera separately from the subject.** Subject motion and camera motion are independent.
3. **Control duration implicitly.** Short clips (2–4s) need tight, single-action prompts. Longer clips need structured arc (beginning → middle → end motion).
4. **Lighting is physics.** Describe light source, direction, and quality: "soft diffused morning light from the left," not just "nice lighting."
5. **Style references work.** "Cinematic," "documentary-style," "anime," "shot on iPhone," "35mm film grain" all influence rendering.

---

## Camera Language Reference

### Shot Types
```
Extreme close-up (ECU) — Fill the frame with a face or object detail
Close-up (CU) — Head and shoulders, emphasizes emotion
Medium shot (MS) — Waist up
Wide shot (WS) — Full body + environment
Extreme wide / establishing shot — Environment dominates, subject is small
```

### Camera Movements
```
Pan — Camera rotates horizontally on a fixed axis (left to right)
Tilt — Camera rotates vertically on a fixed axis (up or down)
Dolly / Push in — Camera physically moves toward the subject
Pull back / Zoom out — Camera moves away, reveals context
Tracking shot — Camera follows a moving subject laterally
Crane / Pedestal up — Camera rises vertically
Handheld — Slight shake, naturalistic, documentary feel
Drone / Aerial — Top-down or high-angle perspective
Orbit / Arc — Camera circles the subject
```

### Movement Modifiers
```
Slow / gentle / subtle — Minimal movement
Quick / sharp / abrupt — Fast, attention-grabbing movement
Fluid / smooth — Gimbal-style stabilization
Whip pan — Very fast horizontal pan, often used as a transition
```

---

## Model-Specific Tips

### Kling (Kuaishou)

**Strengths:** Realistic human motion, coherent longer clips (up to 10s), good physics on fluid and fabric.

**Prompt style:** Descriptive sentences, not keywords. Write as a cinematography brief.
```
Best practice:
"A woman in a white linen dress walks slowly through a sunlit wheat field.
The camera tracks her from behind at eye level. Gentle wind moves the wheat.
Golden hour. Cinematic color grade."

Avoid:
"woman, field, walking, golden hour, cinematic" [keyword stacking underperforms]
```

**Motion tip:** Kling handles subtle motion well. For dramatic motion, use explicit action verbs: "sprints," "spins," "collapses."

**Negative prompt:** Use to prevent: "blurry, distorted faces, extra limbs, watermark, text overlay"

---

### Veo (Google DeepMind)

**Strengths:** High cinematic fidelity, strong physics simulation, excellent light rendering.

**Prompt style:** Cinematic language, reference real directors or films for style transfer.
```
Best practice:
"Aerial drone shot slowly descending over a misty mountain valley at dawn.
Pine trees below, soft fog layer at mid-height. Inspired by Werner Herzog's
documentary aesthetic. Natural color. 4K."
```

**Reference technique:**
- "Shot in the style of [film/director]" strongly influences visual treatment
- "Photographed by [famous photographer]" works for still-motion compositions

**Negative prompt:** Effective at preventing temporal inconsistencies: "flickering, morphing background, warping, color shift between frames"

---

### Wan (Alibaba/Tongyi)

**Strengths:** Strong with stylized and animated content, fast generation, good at multi-subject scenes.

**Prompt style:** Supports both descriptive and tag-based prompting. Works well with Chinese/East Asian aesthetic references.

```
Best practice (stylized):
"Anime style. A samurai stands at the edge of a cliff at dusk.
Cherry blossom petals fall slowly. Camera slowly zooms out to reveal
a vast valley below. Epic, cinematic."

Best practice (realistic):
"A barista carefully pours steamed milk into an espresso cup.
Close-up, overhead angle. Steam rises. Natural window light from the right.
Slow motion. Warm color palette."
```

**Motion tip:** Wan handles multi-element scenes well. You can describe background motion (wind, rain, people in the distance) separately from foreground.

---

### Seedance (ByteDance)

**Strengths:** Consistent character across frames, good at product showcase videos, strong at short-form social content style.

**Prompt style:** Works well with structured scene descriptions. Good for commercial and product-focused prompts.

```
Best practice (product):
"A sleek black smartwatch rests on a marble surface.
Slow orbit camera movement, 360 degrees. Studio lighting, single key light from top-right.
Subtle lens flare. Clean white background. Product photography aesthetic."

Best practice (social content):
"A creator sits at a desk with a ring light, speaking to camera.
They smile and hold up a small product box. Medium shot. Natural bedroom background.
30fps, TikTok-style framing. Handheld camera feel."
```

---

## Negative Prompt Reference

Use negative prompts to exclude common generation artifacts:

```
Universal negatives:
"blurry, out of focus, overexposed, underexposed, watermark, text, logo,
duplicate subjects, extra limbs, distorted anatomy, flickering, morphing,
low quality, pixelated, color banding"

For realistic humans:
"plastic skin, dead eyes, unnatural smile, floating elements, warped hands"

For environments:
"flat lighting, lens distortion, horizon tilt, unnatural perspective"
```

---

## Prompt Length Guidelines

| Clip Type | Recommended Prompt Length |
|-----------|--------------------------|
| Simple loop (2–3s) | 1–2 sentences |
| Scene clip (4–6s) | 3–5 sentences |
| Narrative clip (8–10s) | 5–8 sentences with clear arc |
| Cinematic sequence | Full brief with subject, camera, lighting, mood separate |

---

## Video Prompting Checklist

- [ ] Subject is named and described with at least one visual attribute
- [ ] Primary motion of the subject is explicitly stated
- [ ] Camera type and movement specified separately from subject motion
- [ ] Lighting described with source, direction, and quality
- [ ] Style or visual reference included (cinematic, anime, documentary, etc.)
- [ ] Temporal arc present for clips over 5 seconds (what happens beginning to end)
- [ ] Negative prompt includes anatomy artifacts and flickering
- [ ] Aspect ratio specified if platform-specific (9:16 vertical, 16:9 horizontal, 1:1 square)
