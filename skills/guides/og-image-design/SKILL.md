---
name: og-image-design
description: Design Open Graph images at 1200x630 that look great in every social preview.
---

# Open Graph Image Design Guide

## Core Purpose

Open Graph (OG) images are the thumbnail previews that appear when a URL is shared on Twitter/X, LinkedIn, Facebook, Slack, Discord, iMessage, and WhatsApp. A well-designed OG image dramatically increases click-through rate from shared links — effectively free distribution when done well.

---

## Specifications

### Canonical Dimensions
- **Standard**: 1200 × 630 px (1.91:1 ratio)
- **Minimum**: 600 × 315 px (will be upscaled, avoid if possible)
- **Square variant**: 1200 × 1200 px (used by some clients — design both if budget allows)

### File Format
- **JPEG**: Preferred for photos — smaller file size, no transparency needed
- **PNG**: Preferred for graphics, text, flat design — lossless, supports transparency
- Maximum file size: **8MB** (most platforms) — keep under 1MB for performance
- Color profile: sRGB

### HTML Implementation
```html
<meta property="og:image" content="https://yourdomain.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://yourdomain.com/og-image.png" />
```

---

## Safe Zone Framework

Not all platforms display the full 1200×630 image. Some crop it.

### The Three Zones
- **Safe zone**: 900 × 472 px centered (all critical content here)
- **Visible zone**: 1200 × 630 px (full image, may be visible)
- **Bleed zone**: 1260 × 660 px (extend backgrounds, never place text)

### Platform Crop Behavior
- **Facebook**: Shows full 1.91:1 image
- **Twitter/X**: Crops to approximately 2:1 — top and bottom slightly cut
- **LinkedIn**: Shows full 1.91:1 in feed; may crop in article view
- **Slack**: Shows full image in expanded view
- **iMessage**: May crop to square — design so center crop works
- **Discord**: Full image with embedded preview

Place all text and critical elements within the 900×472 safe zone.

---

## Layout Systems

### Single-Brand Image (static per site)
For marketing sites with one OG image:
- Full-width background (brand color, pattern, or photography)
- Centered logo
- Site name or tagline
- Brand URL in footer
- Works for: portfolio sites, agency sites, product homepages

### Article/Post Template (dynamic per page)
Generated for each piece of content:
- Left zone: article title (large, 2–3 lines max)
- Right zone: illustration, chart, or photo
- Bottom bar: author + date + logo
- Works for: blogs, documentation, news sites

### Product Card Template
For e-commerce or product listings:
- Product image (center or left)
- Product name
- Price or key spec
- Brand logo
- Works for: SaaS features, products, app pages

### Social Share Card
User-specific or context-specific (for apps):
- User name / achievement / generated content
- Personalized data
- App branding
- Works for: Spotify Wrapped, Strava, product receipts

---

## Text Readability at Small Sizes

### The Display Size Problem
OG images appear at drastically different sizes:
- Full expanded preview: ~600px wide
- Timeline thumbnail: ~150–300px wide
- Notification preview: ~50–80px wide

Design for the 150px wide test — your title should still be readable.

### Font Size Guidelines (at 1200px canvas)
- **Main headline**: 64–96px
- **Supporting text**: 32–48px
- **Small metadata**: 24–28px (absolute minimum)
- **Logo text**: scale so it's readable at thumbnail size

### Text Contrast Requirements
- All text against background: minimum 4.5:1 contrast ratio
- Large text (24px+): minimum 3:1
- Use a dark overlay if placing text over photography
- Never rely on background patterns to read text

### Overlay Techniques for Photos
- Dark gradient from bottom: `linear-gradient(transparent, rgba(0,0,0,0.7))`
- Frosted/blurred panel: blur background behind text container
- Solid colored bar: most reliable readability
- Dark vignette: radial fade at edges

### Text Length Limits
- Headline: 6–10 words maximum (truncate longer titles)
- Subtitle: 1 line, 60 characters maximum
- No body copy — this is a thumbnail, not a document
- If title is long (blog post), truncate with "..."

---

## Branding Consistency

### Required Brand Elements
Every OG image in a system should include:
- Logo (top-left or bottom-right typical placement)
- Brand primary color used somewhere
- Consistent typography matching site/app
- URL or domain name (builds familiarity)

### Logo Placement
- Top-left: traditional media convention (newspaper masthead)
- Bottom-left: modern design convention, content-first
- Bottom-right: works when image bleeds to left
- Center-bottom: for brand-heavy, content-light images

### Maintaining Consistency Across Dynamic Images
Define a template with locked elements:
- Logo position and size locked
- Color palette locked
- Font family and weight locked
- Only title text and imagery change

---

## Platform-Specific Optimizations

### Twitter/X
- `summary_large_image` card type for full-width previews
- Card is approximately 2:1 ratio — top/bottom may be cropped
- Character limit on overlaid text: Twitter does NOT limit text in images, but readability matters
- Alt text via `twitter:image:alt` meta tag (255 chars max) for accessibility

### LinkedIn
- Optimal ratio is 1.91:1 (1200×628)
- Images with faces and people see higher engagement
- Professional aesthetic preferred
- Company page posts: consistent branded image template builds recognition

### Facebook
- Supports full 1200×630
- Images with text perform differently — Facebook's text overlay tool is deprecated but text in images is fine
- Warm, human imagery performs well in consumer contexts

### Slack / Discord (link unfurl)
- Users see these in work context — professionalism matters
- Clear title at small preview size is critical
- Internal tools: include project/page name prominently

---

## Dynamic OG Image Generation

For sites with many pages (blogs, docs, apps), generate OG images programmatically.

### Approaches
- **Vercel OG / @vercel/og**: React JSX to image at edge
- **Puppeteer/Playwright headless**: Screenshot an HTML template
- **Sharp + Canvas**: Node.js image manipulation
- **Cloudinary URL API**: Parameter-based image generation
- **Bannerbear / Shotstack**: SaaS APIs for template-based generation

### Dynamic Template Design Principles
- Define a fixed canvas size (1200×630) as the template container
- Use CSS or design tool constraints so no element overflows
- Handle long titles gracefully (max-width + overflow: ellipsis or line clamp)
- Test with your shortest and longest expected content

### Cache Strategy for Dynamic OG Images
- Cache at CDN level with long TTL (images don't change)
- Use deterministic URL based on content hash
- Warm cache after publishing (request URL proactively)
- Include cache-busting parameter when content updates

---

## Debugging and Testing

### Validation Tools
- **Facebook Sharing Debugger**: developers.facebook.com/tools/debug
- **Twitter Card Validator**: cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: linkedin.com/post-inspector
- **OpenGraph.xyz**: Visual preview of OG tags

### Common Issues
- Image not appearing: check `og:image` URL is absolute, not relative
- Old image showing: platform has cached old image — use debug tool to force refresh
- Image too small: under 600px minimum — platform may reject or downscale
- Wrong crop: content outside safe zone — move text inward
- Text unreadable: check contrast, increase font size, add overlay

---

## Final Checklist

- [ ] Dimensions: 1200 × 630 px
- [ ] All critical text within 900 × 472 safe zone
- [ ] Text readable at 150px wide thumbnail
- [ ] Contrast ratio: minimum 4.5:1 for all text
- [ ] Logo visible and legible
- [ ] File size under 1MB (JPG) or 2MB (PNG)
- [ ] `og:image` meta tag with absolute URL
- [ ] `og:image:width` and `og:image:height` tags present
- [ ] Twitter card meta tags included
- [ ] Tested in at least Facebook and Twitter validators
- [ ] Dynamic template handles long and short titles gracefully
- [ ] Alt text provided for accessibility
