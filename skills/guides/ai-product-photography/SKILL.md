---
name: ai-product-photography
description: "AI product photography guide. Background removal, studio prompts, e-commerce outputs."
allowed-tools: []
disable-model-invocation: false
---

# AI Product Photography Guide

Produce e-commerce-ready product images using `/pocket-knife:background-removal` and `/pocket-knife:ai-image-generation`.
No physical studio required — AI handles background replacement and scene composition.

## Two Core Workflows

### Workflow A: Real product photo → clean studio background

Use when you have an existing product photo and want a professional background.

```
Step 1: /pocket-knife:background-removal
  Input:  IMAGE_URL = public URL of product photo
  Output: PNG with transparent background

Step 2: Upload PNG to a public host → get public URL

Step 3: /pocket-knife:ai-image-generation
  Input:  PROMPT = product description + studio background scene
  Output: Final composite image
```

### Workflow B: Generate product image from scratch

Use when you need a product concept, variation, or you don't have a photo yet.

```
Step 1: /pocket-knife:ai-image-generation
  Input:  PROMPT = detailed product + background + lighting description
  Output: ~/Downloads/product_[timestamp].png
```

## Studio Lighting Prompts

Lighting is the single most important factor in professional product photography.

| Lighting style | Prompt fragment | Best for |
|---------------|-----------------|----------|
| White seamless | `"white seamless background, soft studio lighting, even illumination"` | All products; safest default |
| Beauty dish | `"beauty dish lighting, crisp highlights, light grey background"` | Cosmetics, jewelry |
| Gradient backdrop | `"gradient studio backdrop, light grey to white, professional"` | Electronics, tech |
| Natural window | `"soft natural window light, white surface, airy and bright"` | Food, lifestyle products |
| Dark luxury | `"dark studio background, dramatic side lighting, moody, premium feel"` | Watches, spirits, perfume |
| Flat lay | `"flat lay composition, overhead shot, white marble surface, even light"` | Small products, accessories |

## Full Prompt Formula for Product Photography

`[Product description] + [Background/surface] + [Lighting] + [Shot type] + [Style] + [Technical]`

**Examples:**

| Product | Complete prompt |
|---------|----------------|
| Running shoes | `"pair of white running shoes, white seamless studio background, soft diffused lighting, side view, product photography, sharp focus, 4K"` |
| Perfume bottle | `"luxury perfume bottle with gold cap, dark black background, dramatic rim lighting, three-quarter view, high-end product photography, reflective surface"` |
| Skincare cream | `"white skincare cream jar, light grey gradient background, beauty dish lighting, centered, clean product shot, sharp detail"` |
| Coffee mug | `"ceramic coffee mug with steam, rustic wooden table, warm window light, lifestyle product shot, cozy atmosphere"` |
| Smartwatch | `"smartwatch on white surface, top-down flat lay, even studio lighting, tech product photography, minimal composition"` |

## E-Commerce Platform Specifications

| Platform | Required ratio | Minimum resolution | Background |
|----------|---------------|-------------------|------------|
| Amazon main image | 1:1 | 1000×1000px | Pure white only |
| Shopify product | 1:1 or 4:5 | 800×800px | White or clean |
| Instagram shop | 1:1 | 1080×1080px | Any |
| Google Shopping | 1:1 | 250×250px min | White preferred |
| Pinterest | 2:3 | 1000×1500px | Any |

**Amazon requirement:** Pure white background (`#FFFFFF`) with no shadows touching the edges. Use the `ASPECT_RATIO: 1:1` parameter and include `"pure white background"` explicitly in the prompt.

## Background Removal: When to Use It

Use `/pocket-knife:background-removal` when:
- You have a real product photo with a complex background
- You want to test multiple backgrounds without re-shooting
- The original background is inconsistent (shadows, props, clutter)

**Image requirements for good background removal:**
- Product must have clear edges (avoid transparent/glass products without additional setup)
- High contrast between product and background improves edge detection
- Resolution: 512×512 minimum; higher is better

## Composition Principles

| Principle | Application |
|-----------|-------------|
| Rule of thirds | Position product at a third-point, not dead center, for lifestyle shots |
| Negative space | Leave empty space around product to allow text overlay for ads |
| Multiple angles | Generate front, side, three-quarter, and detail shots as a set |
| Prop consistency | Keep lifestyle props minimal and brand-consistent |
| Color harmony | Background color should complement, not compete with, product color |

## Common Mistakes and Fixes

| Mistake | Fix |
|---------|-----|
| Product blends into white background | Add `"subtle drop shadow"` or switch to light grey gradient |
| Background removal leaves rough edges | Use higher-resolution source image; re-upload at 1024px+ |
| Reflective products (glass, metal) look flat | Add `"reflective surface, specular highlights"` to prompt |
| Colors look washed out | Add `"vibrant colors, high contrast, accurate color"` to prompt |
| Amazon rejects non-white background | Use `"pure white #FFFFFF background, no shadows, no props"` |
| Product looks AI-generated | Use `/pocket-knife:background-removal` on a real photo instead |

## Batch Production Workflow

For a complete product page (6 angles + lifestyle):

1. Generate each angle as a separate prompt with consistent lighting descriptors
2. Use the same lighting language across all prompts for visual consistency
3. Add one lifestyle/contextual shot with a `"in use"` scene
4. Apply background removal to isolate product for the white-background hero image
5. Resize to platform requirements using any image editor

## Workflow with Other Skills

- `/pocket-knife:background-removal` — isolate product from complex backgrounds
- `/pocket-knife:ai-image-generation` — generate product on new backgrounds
- `/pocket-knife:image-to-video` — animate the product for video ads (rotation, reveal)
- `/pocket-knife:elevenlabs-tts` — add product narration voiceover to a video ad
