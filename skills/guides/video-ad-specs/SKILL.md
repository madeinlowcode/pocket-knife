---
name: video-ad-specs
description: Video ad specifications — platform specs, aspect ratios, file sizes, duration limits, safe zones.
---

# Video Ad Specifications Guide

## Quick Reference: Platform Specs Table

| Platform              | Ad Format               | Aspect Ratio     | Resolution        | Max File Size | Max Duration  | File Format     |
|-----------------------|-------------------------|------------------|-------------------|---------------|---------------|-----------------|
| YouTube               | In-stream (skippable)   | 16:9             | 1920×1080         | None specified| No hard limit | MP4, MOV, AVI   |
| YouTube               | In-stream (non-skip)    | 16:9             | 1920×1080         | None specified| 15–20 sec     | MP4, MOV        |
| YouTube               | Bumper Ad               | 16:9             | 1920×1080         | None specified| 6 sec         | MP4, MOV        |
| YouTube               | Shorts Ad               | 9:16             | 1080×1920         | None specified| 60 sec        | MP4             |
| Meta (Facebook)       | Feed Video Ad           | 16:9, 1:1, 4:5   | 1080×1080 (1:1)   | 4 GB          | 1 sec–241 min | MP4, MOV        |
| Meta (Facebook)       | Reels Ad                | 9:16             | 1080×1920         | 4 GB          | 15–60 sec     | MP4, MOV        |
| Meta (Facebook)       | Stories Ad              | 9:16             | 1080×1920         | 4 GB          | 1–15 sec      | MP4, MOV        |
| Instagram             | Feed Video Ad           | 1:1, 4:5, 16:9   | 1080×1080 (1:1)   | 4 GB          | 1 sec–60 min  | MP4, MOV        |
| Instagram             | Reels Ad                | 9:16             | 1080×1920         | 4 GB          | Up to 60 sec  | MP4, MOV        |
| Instagram             | Stories Ad              | 9:16             | 1080×1920         | 4 GB          | 1–15 sec      | MP4, MOV        |
| TikTok                | In-Feed Ad              | 9:16, 1:1, 16:9  | 1080×1920 (9:16)  | 500 MB        | 5–60 sec      | MP4, MOV, AVI   |
| TikTok                | TopView Ad              | 9:16             | 1080×1920         | 500 MB        | 5–60 sec      | MP4, MOV        |
| TikTok                | Spark Ad (boosted post) | 9:16             | 1080×1920         | 500 MB        | No hard limit | Native post      |
| LinkedIn              | Sponsored Video         | 16:9, 1:1, 9:16  | 1920×1080 (16:9)  | 200 MB        | 3 sec–30 min  | MP4             |
| LinkedIn              | Video Ad (objective)    | 16:9             | 1920×1080         | 200 MB        | 3 sec–30 min  | MP4             |
| Snapchat              | Single Video Ad         | 9:16             | 1080×1920         | No limit      | 3–180 sec     | MP4, MOV        |
| Pinterest             | Video Ad                | 2:3, 9:16, 1:1   | 1080×1920 (9:16)  | 2 GB          | 4 sec–15 min  | MP4, MOV, M4V   |
| X (Twitter)           | Video Ad                | 16:9, 1:1        | 1920×1080         | 1 GB          | Up to 2 min 20 sec | MP4, MOV  |

---

## Aspect Ratio Reference

### 16:9 — Landscape (Horizontal)
- **Pixel dimensions**: 1920×1080 (Full HD), 3840×2160 (4K)
- **Use for**: YouTube pre-roll, LinkedIn feed, desktop-dominant placements
- **Character**: Wide, cinematic, comfortable on desktop

### 9:16 — Portrait (Vertical)
- **Pixel dimensions**: 1080×1920
- **Use for**: TikTok, Instagram Reels, Facebook Stories, Snapchat
- **Character**: Full-screen mobile, immersive
- **Critical**: Over 60% of all social video is now consumed vertically

### 1:1 — Square
- **Pixel dimensions**: 1080×1080
- **Use for**: Facebook/Instagram feed, LinkedIn feed (performs well)
- **Character**: Platform-neutral, good fallback when shooting only one format
- **Tip**: Repurpose 16:9 with zoomed crop + logo/text banner top and bottom

### 4:5 — Vertical (Portrait Landscape Hybrid)
- **Pixel dimensions**: 1080×1350
- **Use for**: Instagram feed (takes up more screen space than 1:1)
- **Character**: Slightly taller than square — greater visual real estate in feed

---

## Safe Zone Guidelines

Safe zones are the areas guaranteed to be visible and unobscured by UI overlays on every platform.

### 9:16 Safe Zones (TikTok / Reels / Stories)
```
┌─────────────────────┐
│   ← 150px top →    │  ← Avoid: profile info, sound icon
│                     │
│                     │
│   SAFE CONTENT      │  ← All critical text/visuals here
│      AREA           │
│                     │
│   ← 250px bottom → │  ← Avoid: CTA buttons, caption overlay
└─────────────────────┘
Left edge: 50px safe margin
Right edge: 50px safe margin
```

| Platform         | Top margin | Bottom margin | Left/Right margin |
|------------------|------------|---------------|-------------------|
| TikTok In-Feed   | 150px      | 250px         | 50px              |
| Instagram Reels  | 150px      | 250px         | 50px              |
| Facebook Stories | 150px      | 250px         | 50px              |
| Snapchat         | 200px      | 300px         | 80px              |
| YouTube Shorts   | 130px      | 200px         | 50px              |

### 16:9 Safe Zones (YouTube / LinkedIn)
- Keep all text and critical visuals within the inner 80% of the frame
- Action safe area: 5% in from all edges
- Title safe area: 10% in from all edges (for text/logos)

---

## Technical Specifications (All Platforms)

### Video Codec
- **Required**: H.264 (most widely accepted)
- **Also accepted**: H.265 (HEVC) on YouTube and some Meta placements
- **Avoid**: ProRes, MJPEG, or uncompressed — too large, often rejected

### Audio Codec
- **Standard**: AAC
- **Sample rate**: 44.1 kHz or 48 kHz
- **Channels**: Stereo (2-channel) preferred; mono accepted
- **Bitrate**: 128 kbps minimum; 192–320 kbps recommended

### Frame Rate
- 23.976 fps (film look)
- 24 fps (cinema)
- 29.97 / 30 fps (standard broadcast, most social platforms)
- 60 fps (sports, screen recordings, slow-motion source)
- Do NOT submit variable frame rate (VFR) — convert to CFR before upload

### Recommended Bitrate by Resolution
| Resolution   | Recommended Bitrate |
|--------------|---------------------|
| 720p (HD)    | 5–8 Mbps            |
| 1080p (FHD)  | 8–15 Mbps           |
| 4K (UHD)     | 35–45 Mbps          |

---

## Duration Strategy

### Optimal Ad Duration by Objective
| Objective              | Platform              | Ideal Duration  |
|------------------------|-----------------------|-----------------|
| Brand awareness        | YouTube bumper        | 6 sec           |
| Product consideration  | TikTok / Reels        | 15–30 sec       |
| Direct response / CTA  | Meta / TikTok         | 15–30 sec       |
| Retargeting (warm)     | YouTube in-stream     | 30–60 sec       |
| Thought leadership     | LinkedIn              | 60–90 sec       |
| Full explainer         | YouTube / LinkedIn    | 90–180 sec      |

### Non-Skippable Ad Duration Limits
- YouTube non-skip: 15 sec (some markets allow 20 sec)
- LinkedIn: No non-skippable format
- TikTok TopView: First 5 sec non-skippable; up to 60 sec total
- Meta: No enforced skip; viewers abandon — treat first 3 sec as critical

---

## Pre-Upload Checklist

### File Preparation
- [ ] Exported as MP4 (H.264) container
- [ ] Correct aspect ratio for target placement
- [ ] Resolution at minimum 1080p
- [ ] Frame rate is constant (not variable)
- [ ] Audio encoded as AAC stereo
- [ ] File size within platform limit
- [ ] No black leader frames at start or end

### Content Compliance
- [ ] No prohibited content per platform ad policies
- [ ] Captions / subtitles included (85% of social video watched muted)
- [ ] CTA text within safe zone
- [ ] Logo / branding visible within first 5 sec
- [ ] All music and footage is licensed for paid advertising (not just organic use)
- [ ] No third-party trademarks shown without permission

### Platform-Specific Final Checks
- [ ] TikTok: Resolution 1080×1920, duration 5–60 sec, music licensed through TikTok's commercial library if using platform audio
- [ ] Meta: No more than 20% text coverage on thumbnail frame (guideline, not hard limit)
- [ ] YouTube: Custom thumbnail uploaded separately, description and target URL set
- [ ] LinkedIn: Company page linked as ad account, video ad objective matches campaign goal
