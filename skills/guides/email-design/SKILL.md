---
name: email-design
description: Design responsive, accessible, high-converting emails that render across all clients.
---

# Email Design Guide

## Core Constraints

Email HTML is frozen in 2005. Outlook uses Microsoft Word's rendering engine. Gmail strips `<style>` blocks from the `<head>`. Mobile clients clip emails over 102KB. Every design decision must account for these realities.

---

## Structural Foundation

### The Email Column System
- **Single column**: Maximum compatibility, mobile-first, best for newsletters
- **Two column**: Use for grid content (products, features) — must stack on mobile
- **Hybrid (mix)**: Header single → content two-column → footer single

### Width Standards
- Maximum content width: **600px**
- Mobile rendering: scales to screen width (320–414px typical)
- Left/right padding on content: minimum 20px mobile, 30–40px desktop

### The Container Structure
Every email should follow this nesting:
```
<table> 100% width (email client body)
  <tr><td> centered wrapper
    <table> 600px max-width (content container)
      [header]
      [body sections]
      [footer]
    </table>
  </td></tr>
</table>
```

---

## Header Structure

### Required Header Elements
- **Logo**: Top-center or top-left, 150–200px wide, linked to homepage
- **Preheader**: Hidden preview text (40–130 characters), placed before header visually
- **Hero image or headline**: Visible without scrolling

### Preheader Text
The preheader is the second subject line — it appears in the inbox preview.

Rules:
- 40–130 characters (varies by client)
- Never leave it empty — clients pull the first visible text instead
- Should complement the subject line, not repeat it
- Place as first text in `<body>` with `display:none; max-height:0; overflow:hidden`

### Logo Best Practices
- PNG with transparent background (works on both white and dark backgrounds)
- Include `alt` text with company name
- Always link to homepage
- Supply 2x version for retina displays: `width="150"` on image, but 300px wide actual file

---

## Body Layout Zones

### Typical Zone Order
1. **Hero**: Image + primary headline + primary CTA
2. **Value content**: Core message, story, or product information
3. **Secondary CTA** (optional): Different action from primary
4. **Supporting content**: Extra features, testimonials, or curated content
5. **Footer CTA** (optional): Soft ask or reminder

### Section Spacing
- Between sections: 30–40px padding
- Within sections: 16–24px between elements
- Above buttons: 24px minimum
- Consistent spacing = professional, easier to scan

---

## CTA (Call-to-Action) Design

### Button Best Practices
- Minimum size: 44x44px touch target (Apple HIG), recommended 200px wide x 48px tall
- Background color: Distinctive from email background — never blend in
- Text: Action verb + object ("Shop the Sale", "Download Guide", "Start Free Trial")
- Center-aligned for single column; left-aligned when next to text block
- Rounded corners (4–8px radius) outperform sharp corners in testing

### CTA Placement Rules
- First CTA should be visible without scrolling on mobile
- Repeat primary CTA for emails longer than 3 scrolls
- Limit to 2 distinct CTA actions per email — more creates decision paralysis
- High-value CTAs get buttons; low-value get text links

### Bulletproof Buttons
Avoid image-based buttons — they disappear when images are blocked. Use VML for Outlook and CSS for everything else. The "Bulletproof Button" pattern from Campaign Monitor works in all clients.

---

## Typography

### Web-Safe Font Stack
Not all email clients support custom web fonts. Always provide fallback:
```
font-family: 'Your Font', Arial, Helvetica, sans-serif;
```

Gmail and Outlook do NOT support `@font-face` reliably. Apple Mail and iOS Mail do.

### Font Size Minimums
- Body text: 16px (14px minimum, but 16px prevents iOS auto-zoom)
- Headlines: 22–32px
- Small print / footer: 12px minimum, 11px absolute floor
- CTA button text: 16–18px

### Line Height
- Body: 1.5–1.6x font size
- Headlines: 1.2–1.3x font size
- Tight line heights in emails are hard to read on small screens

### Text Width
- Maximum line length: 65 characters (600px container naturally enforces this)
- Use padding to prevent text touching container edges

---

## Images

### Image Rules
- Always include `alt` text — images are blocked by default in many clients
- `width` and `height` attributes required to prevent layout shift when images load
- Use `display:block` on images to prevent phantom bottom gap
- JPG for photos, PNG for graphics with transparency, GIF for simple animation

### Image Blocking Defensive Design
When images are off, your email must still communicate:
- Alt text describes the image purposefully
- Layout doesn't collapse without images (use background colors)
- CTAs are bulletproof buttons, not image-based

### File Size Guidelines
- Total email size: under 100KB HTML (Gmail clips at 102KB)
- Individual images: under 200KB each
- Hero images: 600px wide x 200–400px tall (typical ratio)
- Use image compression tools before uploading to ESP

---

## Responsive Email Design

### Mobile-First Approach
Design for 375px first, then enhance for 600px desktop.

### Media Query Support
Gmail on Android does NOT support media queries. Use a hybrid/fluid approach:
- Single-column layout naturally adapts
- Use `max-width: 600px` on content tables with `width: 100%`
- Use inline `width="100%"` on images as fallback

### Common Responsive Patterns
- **Stack columns**: Two columns stack to single column on mobile
- **Scale images**: `width: 100%; max-width: 300px` for images
- **Larger text on mobile**: Increase headline size via media query
- **Full-width buttons**: `width: 100%; max-width: 300px` on mobile

### Touch Targets
- All links and buttons: minimum 44x44px on mobile
- Space between clickable elements: minimum 8px
- Bottom of email: extra padding (thumb scrolling zone)

---

## Dark Mode Considerations

40–50% of email opens now use dark mode. Prepare for it.

### Client Dark Mode Behavior
- **Full dark mode** (Apple Mail, iOS Mail): Automatically inverts colors
- **Partial dark mode** (Gmail, Outlook): May or may not invert
- **No dark mode support**: Renders in light mode regardless

### Dark Mode Design Strategies
- Use `@media (prefers-color-scheme: dark)` with specific overrides
- Avoid pure white backgrounds — use `#f8f8f8` to reduce inversion harshness
- Use transparent PNG logos (invisible background works on both modes)
- Test black text vs. white text with explicit dark mode overrides

### Critical Dark Mode CSS
```css
@media (prefers-color-scheme: dark) {
  body { background-color: #1a1a1a !important; }
  .content { background-color: #2d2d2d !important; }
  .body-text { color: #e0e0e0 !important; }
}
```

---

## Footer Structure

### Legal Requirements (CAN-SPAM, GDPR)
- Physical mailing address (required by CAN-SPAM)
- Unsubscribe link (required, must work within 10 days)
- Company name
- Privacy policy link

### Footer Best Practices
- Unsubscribe link must be visible — never tiny or hidden
- Include social media links with logo icons (24x24px minimum)
- Permission reminder: "You're receiving this because..."
- Preference center link (better than raw unsubscribe for list hygiene)

### Footer Typography
- 12–13px for fine print
- Gray (#666–#999) to visually de-emphasize but remain readable
- All legal text must meet accessibility contrast ratios

---

## Deliverability Considerations

### Content That Triggers Spam Filters
- Excessive capitalization or exclamation marks ("ACT NOW!!!")
- Spam trigger words: "Free", "Buy now", "Guaranteed", "Winner"
- Poor text-to-image ratio (pure image emails fail)
- URL shorteners in links
- Large attachments

### Technical Deliverability
- Authenticate with SPF, DKIM, and DMARC
- Consistent sending domain with positive reputation
- Clean list hygiene (remove bounces, inactives)
- Warm up new IPs gradually

### The 60/40 Rule
At minimum 60% text content, maximum 40% image content. Pure image emails are blocked by most spam filters and fail all users with images disabled.

---

## Testing Checklist

### Before Every Send
- [ ] Tested in: Gmail, Apple Mail, Outlook (2016, 2019), iOS Mail, Android Gmail
- [ ] Images blocked — email still communicates clearly
- [ ] All links working and tracked
- [ ] Unsubscribe link functional
- [ ] Preheader text correct in inbox preview
- [ ] Mobile display — single column, correct font sizes, tap targets
- [ ] Dark mode — tested in Apple Mail and iOS
- [ ] Spelling and grammar checked
- [ ] Total HTML under 100KB
- [ ] Alt text on all images
- [ ] From name and reply-to address correct
