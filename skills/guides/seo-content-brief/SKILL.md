---
name: seo-content-brief
description: SEO content brief creation — keyword research, search intent, outline structure, meta tags, internal links.
---

# SEO Content Brief Creation Guide

## What a Content Brief Is
A content brief is the document a writer receives before they start writing. It removes ambiguity by specifying exactly what the content needs to accomplish, which keywords to target, what the reader wants, how the article should be structured, and what technical SEO requirements apply. A good brief produces a publishable first draft. A bad brief produces rewrites.

---

## Brief Document Structure

### Template: Full SEO Content Brief
```
CONTENT BRIEF
─────────────────────────────────────────
Page Title (working):
Target URL slug:
Author:
Due date:
Word count target:

─────────────────────────────────────────
KEYWORD TARGETS
─────────────────────────────────────────
Primary keyword:          [keyword] — [monthly search volume] — [KD score]
Secondary keywords:       [keyword 1], [keyword 2], [keyword 3]
LSI / semantic terms:     [related terms to include naturally]

─────────────────────────────────────────
SEARCH INTENT
─────────────────────────────────────────
Intent type:              [Informational / Navigational / Commercial / Transactional]
What the searcher wants:  [1 sentence]
What they do NOT want:    [1 sentence]

─────────────────────────────────────────
TARGET READER
─────────────────────────────────────────
Who they are:
Knowledge level:          [Beginner / Intermediate / Expert]
What they want to achieve after reading:

─────────────────────────────────────────
SERP ANALYSIS
─────────────────────────────────────────
Top 3 ranking URLs to analyze:
Content gaps to fill:
Angle that differentiates this article:

─────────────────────────────────────────
OUTLINE
─────────────────────────────────────────
H1:
H2 (1):
  H3:
  H3:
H2 (2):
  H3:
  H3:
H2 (3):
  ...
FAQ section (optional):

─────────────────────────────────────────
META TAGS
─────────────────────────────────────────
Title tag (under 60 chars):
Meta description (under 160 chars):

─────────────────────────────────────────
INTERNAL LINKS
─────────────────────────────────────────
Link FROM this article to:     [URL — anchor text]
Link TO this article from:     [URL — anchor text]

─────────────────────────────────────────
ADDITIONAL NOTES
─────────────────────────────────────────
CTA placement:
Media / visuals required:
E-E-A-T requirements (author credentials, sources):
```

---

## Keyword Research Framework

### Step 1: Seed Keyword Discovery
Start with what the target reader types when they have the problem your content solves.

Sources for seed keywords:
- Google Search autocomplete (type partial query, capture suggestions)
- Google "People also ask" and "Related searches"
- Answer the Public
- Ahrefs / Semrush "Keyword Ideas" for seed terms
- Reddit and Quora: look at the exact language people use to describe their problems
- Customer support tickets and sales call transcripts (what do buyers actually say?)

### Step 2: Keyword Qualification Matrix
Evaluate each candidate on four dimensions:

| Criteria           | What to Check                                        | Threshold              |
|--------------------|------------------------------------------------------|------------------------|
| Search volume      | Monthly searches in target market                    | >100 for niche; >500 for broad |
| Keyword difficulty | KD score (0–100 scale)                               | Target KD < 40 for new sites; up to 60 for established |
| Relevance          | Does this keyword match a real problem you can solve? | Must be 100% relevant |
| Business value     | Does ranking bring buyers, not just readers?          | Rate 1–3; prioritize 3s |

### Step 3: Primary vs. Secondary Keyword Selection
- **Primary keyword**: One keyword. The page is optimized for this first.
- **Secondary keywords**: 3–5 variations, longer-tail versions, or closely related terms
- **LSI / semantic terms**: Words Google expects to see on a page about this topic — not synonyms, but contextually related vocabulary

### Keyword Placement Rules
| Location                    | Primary KW | Secondary KW |
|-----------------------------|------------|--------------|
| H1 tag                      | Yes        | Optional     |
| First 100 words of body     | Yes        | Optional     |
| At least one H2             | Yes        | Yes          |
| URL slug                    | Yes        | No           |
| Title tag                   | Yes        | Optional     |
| Meta description            | Yes        | Optional     |
| Image alt text              | Optional   | Optional     |
| Body copy (natural)         | 2–4 times  | 1–3 times each |

---

## Search Intent Mapping

### Four Intent Types
| Intent Type      | What the Searcher Wants                     | Content Format to Match         |
|------------------|---------------------------------------------|---------------------------------|
| Informational    | To learn something, answer a question       | Guide, how-to, explainer, listicle |
| Navigational     | To find a specific page/brand/product       | Homepage, product page, brand content |
| Commercial       | To compare options before buying            | Comparison, review, best-of list |
| Transactional    | To complete a purchase or sign-up action    | Product/landing page, pricing page |

### Intent Mismatch = Ranking Failure
If a searcher's intent is informational ("how to track time") and you create a transactional page ("buy our time tracker"), you will not rank. Match the intent before writing a word.

### Intent Confirmation Method
- Google the primary keyword manually
- Look at the top 5 organic results
- Answer: What format are they? What do they contain? What do they not contain?
- Your content format must match the dominant SERP pattern

---

## Outline Construction

### H1 Formula
```
[Primary keyword] + [qualifier or hook]
```
Examples:
- "How to Write a Content Brief (With Free Template)"
- "Keyword Research for Beginners: A Step-by-Step Guide"
- "10 Content Brief Templates That Actually Work"

### H2 Structure Rules
- Each H2 represents one major subtopic the reader needs
- Sequence from awareness to action (problem → context → solution → implementation)
- Include primary keyword in at least one H2
- Secondary keywords belong naturally in H2s — do not force them

### FAQ Section
- Use "People also ask" from Google as source material
- Each question becomes an H3 within a FAQ H2
- Answers: 40–80 words each, complete sentence format
- FAQ answers are often pulled as Featured Snippets — structure them accordingly

### Recommended Outline Depth
| Word Count Target | Recommended Outline Depth |
|-------------------|--------------------------|
| 800–1200 words    | H2 only (no H3s needed)   |
| 1200–2000 words   | H2 + H3 (2–3 H3s per H2)  |
| 2000–4000 words   | H2 + H3 + H4 for complex sections |
| 4000+ words       | Full hierarchy; consider splitting into series |

---

## Meta Tags

### Title Tag
- Under 60 characters (Google truncates around 600px width, ~60 chars)
- Include primary keyword as early as possible
- Use a separator: | or – (em dash)
- Example: `How to Write a Content Brief | [Brand Name]`
- Do not write the same title tag for two pages

### Meta Description
- Under 160 characters
- Include primary keyword naturally
- Write as an advertisement for the page — why click this result?
- Include a subtle CTA or value proposition
- Example: "Learn how to create an SEO content brief that produces first-draft-ready content. Includes template, keyword framework, and meta tag formulas."

### URL Slug
- Primary keyword only — no stop words (a, the, and, for, to)
- Hyphens between words, no underscores
- Lowercase only
- Maximum 5–6 words
- Example: `/seo-content-brief-guide` not `/how-to-create-an-seo-content-brief-for-writers`

---

## Internal Linking Strategy

### Two Directions of Internal Links
1. **Links FROM this article**: Which existing pages on the site should this new article link to? (Contextually relevant, adds value to the reader)
2. **Links TO this article**: Which existing pages should be updated to link to this new article? (Passes PageRank, connects topically)

### Internal Linking Rules
- Use exact-match or partial-match anchor text to the target page's primary keyword
- 3–5 internal links per article is healthy
- Avoid generic anchors: "click here," "read more," "this article"
- Never link two pages to each other with the same keyword anchor — creates confusion for crawlers
- Prioritize linking to pages you want to rank higher (PageRank flows through links)

### Pillar-Cluster Content Model
- **Pillar page**: Broad topic overview (2000–4000 words); targets high-volume, competitive keyword
- **Cluster pages**: Deep-dive subtopics; each links back to the pillar
- Every cluster article's brief should include: "Link back to pillar page: [URL] with anchor: [anchor text]"

---

## Brief Quality Checklist

### Before Sending to Writer
- [ ] Primary keyword confirmed with search volume and KD data
- [ ] Search intent verified by manually checking the SERP
- [ ] Word count target based on competitive analysis (match top 3 average ±20%)
- [ ] H1 includes primary keyword
- [ ] Outline covers all major subtopics surfaced in competitor content
- [ ] Content gaps identified (what top competitors miss)
- [ ] Title tag under 60 characters with primary keyword
- [ ] Meta description under 160 characters
- [ ] URL slug clean, short, keyword-first
- [ ] Internal link targets specified in both directions
- [ ] E-E-A-T signals noted (required expert credentials, sources, author bio guidance)
- [ ] CTA placement specified
