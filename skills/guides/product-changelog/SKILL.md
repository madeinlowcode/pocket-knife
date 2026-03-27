---
name: product-changelog
description: Product changelog writing guide covering versioning, categorization, audience language, and distribution.
---

# Product Changelog Writing

## Why Changelogs Matter

A changelog is not documentation for developers — it is a **trust signal** for customers. It shows that the product is actively maintained, that reported problems are resolved, and that customer feedback translates into shipped work. A well-written changelog reduces churn by demonstrating momentum.

---

## Version Numbering

### Semantic Versioning (SemVer) — for developer-facing products

```
MAJOR.MINOR.PATCH
2.4.1

MAJOR: Breaking changes — existing integrations may need updates
MINOR: New features, backward compatible
PATCH: Bug fixes and minor improvements, backward compatible
```

### CalVer (Calendar Versioning) — for consumer and SaaS products

```
YYYY.MM.DD or YYYY.MM.PATCH
2024.03.15
2024.03.1

Good for: Products with frequent releases, no meaningful versioning concept
```

### Naming Releases (Optional)

For marketing-heavy launches, pairing a version number with a release name increases visibility:

```
v3.0 — "Velocity"
March 2024 Update — "Collaboration"
```

---

## Standard Changelog Categories

Use these four categories, in this order, for every release entry:

```markdown
### Added
New features or capabilities introduced in this release.

### Changed
Modifications to existing behavior, UI, or performance improvements.

### Fixed
Bug fixes, error corrections, and resolved issues.

### Removed
Features, endpoints, or options that have been deprecated and removed.
```

**Optional additional categories:**
- `Security` — for vulnerability patches (always list separately, never bury)
- `Deprecated` — features announced for future removal
- `Performance` — improvements measurable in speed or resource usage

---

## Writing for the Right Audience

Changelogs often have two distinct audiences. Write for both in the same entry, separated clearly.

### Customer-Facing Language (Product Update / Release Notes)

**Principles:**
- Lead with the user benefit, not the technical implementation
- Use second-person ("You can now...") not passive ("It is now possible to...")
- Avoid internal variable names, API routes, and database terms
- Group by workflow area, not by codebase location
- Keep each entry to 1–2 sentences

**Customer-facing examples:**

```markdown
### Added
- **Bulk export:** You can now export up to 500 records at once as CSV directly
  from the dashboard. No more exporting page by page.
- **Slack notifications:** Connect your workspace to receive alerts when
  a report is ready or a task is overdue.

### Fixed
- Fixed a bug where recurring events would disappear from the calendar view
  after midnight in timezones west of UTC-5.
```

### Developer/Technical Language (API Changelog / Release Notes)

**Principles:**
- Include exact method names, endpoint paths, parameter names
- List deprecation warnings with migration paths
- Document breaking changes at the top, not buried
- Link to relevant documentation for each changed endpoint

**Developer-facing example:**

```markdown
### Changed
- `POST /api/v2/users` now returns a `created_at` timestamp in the response body.
  Previously this field was omitted. Update any downstream parsers accordingly.

### Deprecated
- `GET /api/v1/export` is deprecated and will be removed in v4.0.
  Migrate to `GET /api/v2/exports` — see migration guide: [link]
```

---

## Full Entry Structure

```markdown
## [Version] — YYYY-MM-DD

Brief release summary (1–2 sentences about the theme of this release).

### Added
- [Feature]: [Benefit-first description. Who can use it, what it does, why it matters.]
- [Feature]: [Description]

### Changed
- [Change]: [What changed and why (if the reason helps users adapt).]

### Fixed
- [Bug]: [What was broken, in what conditions, that is now resolved.]

### Removed
- [Item]: [What was removed and what to use instead.]
```

---

## Writing Anti-Patterns to Avoid

| Avoid | Use Instead |
|-------|-------------|
| "Various bug fixes and performance improvements" | Name each fix specifically |
| "Refactored the authentication module" | "Sign-in is now 40% faster" |
| "We improved the UX of the settings page" | "The settings page now loads in a single panel instead of across 3 tabs" |
| "Fixed issue #4821" | Describe the issue in plain language |
| Passive voice throughout | Active, second-person where possible |
| Releasing monthly but writing nothing | Publish at every meaningful release |

---

## Distribution Channels

| Channel | Audience | Format |
|---------|----------|--------|
| In-app notification / banner | Active users | 1–2 sentence summary + link |
| Email newsletter | Subscribers | Highlights only, link to full changelog |
| Public changelog page | All visitors, SEO | Full structured log |
| Social media | Followers | Single biggest feature, visual |
| Slack/Discord community | Power users | Full details, invite feedback |
| Status page | Technical users | Incidents, outages, resolutions |

### Public Changelog Page Options

- Build in-product (Notion, custom page)
- Hosted tools: Headwayapp, Beamer, Changefeed, LaunchNotes, Noticeable
- GitHub Releases (for open-source or dev tools)

---

## Release Checklist

**Before writing:**
- [ ] All changes confirmed shipped and stable in production
- [ ] Audience identified: customer-facing, developer-facing, or both
- [ ] Version number assigned following your chosen convention
- [ ] Date confirmed (ship date, not writing date)

**While writing:**
- [ ] Each entry leads with benefit, not implementation
- [ ] Fixes describe symptoms, not internal variable names
- [ ] Breaking changes are in a prominent, clearly labeled section
- [ ] Links added to relevant docs, migration guides, or tutorials

**Before publishing:**
- [ ] Reviewed by product or customer success for clarity
- [ ] Changelog page updated
- [ ] In-app notification or email queued
- [ ] Social post drafted for top feature
- [ ] Support team briefed on changes before customer-facing distribution
