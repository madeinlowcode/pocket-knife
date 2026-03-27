---
name: technical-blog-writing
description: Technical blog writing — structure, code formatting, audience calibration, SEO for developers.
---

# Technical Blog Writing Guide

## What Separates Good Technical Posts from Great Ones
A good technical post answers the question. A great technical post answers the question the reader actually has (which is often not what the title suggests), at exactly the right level of detail, with working code, and without wasting a sentence. Clarity is the primary virtue.

---

## Article Structure

### The Core Framework: Problem → Context → Solution → Code → Caveat

```
1. HOOK / PROBLEM STATEMENT     (50–150 words)
   └── What breaks, what's frustrating, what you couldn't find elsewhere

2. CONTEXT / BACKGROUND         (100–300 words, sometimes skippable)
   └── Why this problem exists; what the reader needs to know before the solution

3. SOLUTION WALKTHROUGH         (main body — variable length)
   └── Step-by-step; each step is one concept; code accompanies every concept

4. COMPLETE WORKING EXAMPLE     (one unified code block at the end, if applicable)
   └── Readers should be able to copy this and run it

5. CAVEATS / EDGE CASES         (100–200 words)
   └── What this approach doesn't cover; known limitations; when to use something else

6. SUMMARY / TLDR               (optional; 3–5 bullet points)
   └── For readers who scroll to the bottom first — give them value too

7. NEXT STEPS / RELATED         (2–3 links)
   └── Where to go from here
```

### Hook Rules
- Open with the problem — not with "In this article, we will..."
- Strong hook patterns:
  - State the frustration directly: "Every time I needed to batch-process S3 files in Lambda, I hit the same 6-minute timeout wall."
  - State what you searched for: "I spent an afternoon trying to find a clear explanation of when to use `useRef` vs `useState`. This is what I wish I'd found."
  - State the confusion: "The docs say to use `context.WithCancel` but every example I found used `context.WithTimeout`. Here's when each one is right."
- Never start with the company/technology history — the reader already knows

### When to Include Background
Include background context only if:
- The reader must understand a concept before the solution makes sense
- The concept is commonly misunderstood and the misunderstanding causes the exact bug you're solving
- The article targets beginners who lack foundational vocabulary

Skip background if:
- Your target reader already knows the fundamentals (intermediate/advanced audience)
- The concept is well-documented elsewhere — link to it instead of re-explaining

---

## Audience Calibration

### Define the Reader Before the First Word
Answer these three questions in the brief:
1. What is this person's job title or role?
2. What have they already tried (what brought them to search)?
3. What do they need to know to use your solution confidently?

### Vocabulary Calibration by Level
| Level           | Write Like This                                | Avoid                                   |
|-----------------|------------------------------------------------|-----------------------------------------|
| Beginner        | Define every term on first use; short sentences | Assuming knowledge; heavy abbreviation  |
| Intermediate    | Define terms that aren't universal; link the rest | Over-explaining the basics             |
| Expert          | Use precise technical terms without definition | Soft language; hedging everything       |

### The One-Level Rule
Write for one level. Mixing beginner and expert language in the same article satisfies neither reader.

### Signs You've Misjudged the Level
- Beginner article that uses acronyms without expansion
- Advanced article that spends 500 words on "what is a REST API"
- Article that says "simply" or "just" before a step that isn't simple for the target reader

---

## Code Snippet Formatting

### Standards for Every Code Block
- Use fenced code blocks with language tags: \`\`\`python, \`\`\`javascript, \`\`\`bash
- Every snippet must be runnable or clearly identified as partial
- Syntax highlights language — always specify it
- Use comments inside code to annotate non-obvious lines — do not explain in prose what you can explain in a comment

### Code Block Types and When to Use Each
| Type                    | Format                          | When to Use                                |
|-------------------------|---------------------------------|--------------------------------------------|
| Complete runnable file  | Full fenced block with imports  | Tutorial, "copy and run this" scenarios    |
| Partial snippet         | Fenced block, annotate "partial" | When showing a specific function or method |
| Shell command           | \`\`\`bash fenced block         | Installation, CLI commands                 |
| Diff / change           | \`\`\`diff with + and - lines   | Before/after comparisons                   |
| Inline code             | \`backtick\` in prose           | Variable names, function names, file paths |

### Code Quality Checklist
- [ ] All code is tested and works as written
- [ ] Variable names are clear (not single-letter except conventional iterators i, j, k)
- [ ] No placeholder TODO comments in final published code unless intentional
- [ ] Imports / dependencies are visible at the top of complete examples
- [ ] Error handling is present — do not show code that silently swallows errors
- [ ] Version numbers specified in install commands: `pip install requests==2.31.0`

### Inline Code in Prose
Use backtick formatting for:
- Function and method names: `useEffect()`, `context.WithCancel()`
- Variable names: `max_retries`, `config`
- File paths: `/etc/nginx/nginx.conf`
- CLI commands in prose: "Run `npm install` before starting"
- Error messages: `TypeError: 'NoneType' object is not subscriptable`

Do NOT use backtick formatting for:
- Product names (Kubernetes, Docker — no backticks)
- Technology names used as nouns (Python, JavaScript — no backticks unless referring to the literal string)

---

## SEO for Developer Audiences

### How Developers Search (Different from General Search)
- Developers use exact error messages as queries: `"cannot read properties of undefined (reading 'map')"`
- Developers use technology + problem pairs: "postgres connection pool exhausted node"
- Developers search for patterns, not problems: "python async context manager example"
- Developers trust results that show code immediately — slow-loading or code-light results are back-clicked

### Keyword Strategy for Technical Content
- **Target long-tail, specific queries**: "how to debounce input in React hooks" beats "React performance"
- **Mirror error messages exactly**: If your article helps with a specific error, include the exact error text in the article — this is how developers will find it
- **Use the exact library/framework name + version when relevant**: "Next.js 14 app router fetch caching"
- **Avoid invented jargon in titles** — use the same terms the documentation uses

### H1 / Title Formula for Technical Posts
```
[Technology/Tool] + [Action/Problem] + [Context/Qualifier]
```
Examples:
- "Debouncing Input in React with useCallback and useRef"
- "Fix: Postgres Connection Pool Exhausted in Node.js"
- "How to Set Up GitHub Actions for Django with PostgreSQL"
- "Go Context: When to Use WithCancel vs WithTimeout"

### Featured Snippet Optimization
Developer queries often trigger Featured Snippets. To win them:
- For "how to" queries: Use numbered list H3s inside an H2 that matches the query
- For "what is" queries: Answer in 40–60 words immediately under the H2, then expand
- For error message queries: Answer the cause in 1 sentence, then show the fix in a code block

---

## Writing Mechanics for Technical Posts

### Sentence and Paragraph Length
- Technical prose: average sentence length 15–20 words
- No paragraph longer than 4 sentences in tutorial-style content
- One concept per paragraph
- Use line breaks generously — dense walls of text drive readers to Stack Overflow

### Use Active Voice for Instructions
- Active: "Call `db.Close()` before the goroutine exits."
- Passive: "The connection should be closed before the goroutine exits."
- Instructions must be active — passive voice creates ambiguity about who does the action

### Numbers and Lists
- Use numbered lists for sequential steps — order matters for procedures
- Use bulleted lists for non-sequential options or considerations
- Never mix steps and reference items in the same list
- Introduce every list with a sentence that explains what the list contains

### Hedging Language to Avoid
| Weak phrase               | Stronger alternative                |
|---------------------------|-------------------------------------|
| "You might want to..."    | "Do this when X condition is true." |
| "It's generally a good idea to..." | "This prevents Y failure mode." |
| "Simply..."               | (Delete it — if it were simple, you wouldn't need to say so) |
| "Just..."                 | (Same as above)                     |
| "Obviously..."            | (Never obvious to the reader who needs this article) |

---

## Pre-Publish Checklist

### Content Quality
- [ ] Hook opens with the problem — no intro filler
- [ ] Every code block is tested and works
- [ ] Code blocks have language tags for syntax highlighting
- [ ] Target reader's level is consistent throughout
- [ ] Caveats and limitations are addressed
- [ ] No "simply" or "just" preceding non-trivial steps

### SEO
- [ ] Primary keyword in H1, first 100 words, and at least one H2
- [ ] Title is under 60 characters with primary keyword near the start
- [ ] Meta description under 160 characters, includes keyword
- [ ] URL slug is clean, short, keyword-first
- [ ] Exact error messages the article helps with appear as text in the article
- [ ] Internal links to related technical articles added

### Technical Accuracy
- [ ] Version numbers correct for all dependencies
- [ ] Code examples work with stated versions
- [ ] Published date included (technical content ages — readers need to know)
- [ ] Any deprecated APIs noted with the current alternative
