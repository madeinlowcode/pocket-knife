# Phase 5: Social, UI, SDK e CLI - Research

**Researched:** 2026-03-26
**Domain:** Twitter/X API v2 OAuth 1.0a, guide/reference skills, npx CLI creation, API key validation
**Confidence:** HIGH (stack patterns verified), MEDIUM (Twitter auth complexity), HIGH (CLI tooling)

---

## Summary

Phase 5 completes the pocket-knife plugin with the final skills (twitter-automation, javascript-sdk, python-sdk, agent-ui, chat-ui, tools-ui, widgets-ui) and the `npx pocket-knife init` onboarding CLI. The most technically complex item is the Twitter skill: unlike all other providers in this project that use simple Bearer tokens, Twitter/X **write operations require OAuth 1.0a** with a 4-credential HMAC-SHA1 signature — impossible to implement in pure bash curl without an external signing helper. The recommended approach is a thin Node.js helper script called from SKILL.md (consistent with existing patterns like the Python base64 extractor in image skills).

The SDK skills (javascript-sdk, python-sdk) and UI skills (agent-ui, chat-ui, tools-ui, widgets-ui) are **guide/reference skills** in the inference-sh original — they contain no API calls, no curl, and no `~/.claude/.env` dependencies. They should be ported as pure reference content following the established guide pattern (`allowed-tools: []`).

The CLI (`npx pocket-knife init`) is a Node.js ESM package using `@inquirer/prompts@8.x`, `chalk@5.x`, `dotenv@17.x`, and `fs-extra@11.x` — all already identified in the stack research and their current versions verified. The CLI lives in `cli/` as a sub-package with its own `package.json`.

**Primary recommendation:** Port SDK/UI skills as reference guides (no API needed). Port Twitter as SKILL.md + Node.js OAuth helper script. Build the CLI as an ESM Node.js package in `cli/` with interactive prompts and per-provider key validation.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SOC-01 | Skill `twitter-automation` — automação Twitter/X com `disable-model-invocation: true` (chave: requer OAuth v2) | OAuth 1.0a is required for write ops; 4 env vars needed; Node.js helper for HMAC-SHA1 signing |
| SDK-01 | Skill `javascript-sdk` — guia/template para SDK JavaScript | Inference-sh original is a pure reference guide for `@inferencesh/sdk`; adapt as provider-agnostic JS guide |
| SDK-02 | Skill `python-sdk` — guia/template para SDK Python | Inference-sh original is a pure reference guide for `inferencesh` package; adapt as provider-agnostic Python guide |
| UI-01 | Skill `agent-ui` — interface de agente | Reference/guide for `@inferencesh/sdk` + shadcn agent component; adapt as general React agent UI guide |
| UI-02 | Skill `chat-ui` — interface de chat | Reference/guide for shadcn chat components; adapt as general React chat UI guide |
| UI-03 | Skill `tools-ui` — interface de ferramentas | Reference/guide for shadcn tool-state components; adapt as general React tools UI guide |
| UI-04 | Skill `widgets-ui` — widgets de interface | Reference/guide for JSON-based declarative widget renderer; adapt as general guide |
| SETUP-01 | CLI interativa via `npx pocket-knife init` que cria `~/.claude/.env` perguntando chaves por categoria | ESM Node.js CLI; `@inquirer/prompts` prompts; `fs-extra` file writes; per-category key collection |
| SETUP-04 | Validação de chaves durante setup (teste rápido de autenticação com cada provedor) | Per-provider lightweight API calls; specific endpoints documented below |
</phase_requirements>

---

## Standard Stack

### Core (Skills — no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SKILL.md + YAML frontmatter | agentskills.io spec | Skill definition | Same pattern as all other phase skills |
| bash + curl | system | API calls | Zero dependency; established project pattern |
| Node.js | 18+ (22 LTS) | Twitter helper + CLI runtime | Required by Claude Code itself |

### Supporting (CLI sub-package in `cli/`)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @inquirer/prompts | 8.3.2 (verified) | Interactive CLI prompts | `npx pocket-knife init` key collection |
| chalk | 5.6.2 (verified) | Terminal color output | CLI feedback and status messages |
| dotenv | 17.3.1 (verified) | Read existing `~/.claude/.env` before appending | Prevent clobbering existing keys |
| fs-extra | 11.3.4 (verified) | Reliable cross-platform file/dir creation | `~/.claude/` directory creation + atomic writes |
| crypto (built-in) | Node.js built-in | HMAC-SHA1 for OAuth 1.0a | Twitter signature generation in Node.js helper |

### Twitter OAuth Helper (thin Node.js script, no npm install)

The Twitter skill requires a Node.js helper script that generates OAuth 1.0a signatures. This uses ONLY Node.js built-ins (`crypto`, `https`) — no npm install needed. The helper is invoked via `node ${CLAUDE_SKILL_DIR}/scripts/post-tweet.js`.

**Installation (CLI sub-package only):**
```bash
cd cli
npm install @inquirer/prompts chalk dotenv fs-extra
```

**Version verification (confirmed 2026-03-26):**
```bash
npm view @inquirer/prompts version  # → 8.3.2
npm view chalk version              # → 5.6.2
npm view dotenv version             # → 17.3.1
npm view fs-extra version           # → 11.3.4
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 5 additions)

```
pocket-knife/
├── skills/
│   ├── social/
│   │   └── twitter-automation/
│   │       ├── SKILL.md              # disable-model-invocation: true, allowed-tools: Bash(node *)
│   │       └── scripts/
│   │           └── post-tweet.js     # Node.js OAuth 1.0a helper (no npm deps)
│   ├── sdk/
│   │   ├── javascript-sdk/
│   │   │   └── SKILL.md              # Guide: allowed-tools: [], no API
│   │   └── python-sdk/
│   │       └── SKILL.md              # Guide: allowed-tools: [], no API
│   └── ui/
│       ├── agent-ui/
│       │   └── SKILL.md              # Guide: allowed-tools: [], no API
│       ├── chat-ui/
│       │   └── SKILL.md              # Guide: allowed-tools: [], no API
│       ├── tools-ui/
│       │   └── SKILL.md              # Guide: allowed-tools: [], no API
│       └── widgets-ui/
│           └── SKILL.md              # Guide: allowed-tools: [], no API
└── cli/
    ├── package.json                  # "type": "module", bin: {"pocket-knife": "./bin/init.js"}
    ├── bin/
    │   └── init.js                   # #!/usr/bin/env node + ESM shebang entry
    └── lib/
        ├── prompts.js                # Category selection + key prompts
        ├── validate.js               # Per-provider key validation calls
        └── env-writer.js             # Read/merge/write ~/.claude/.env
```

### Pattern 1: Guide Skill (SDK and UI skills)

**What:** Pure reference content with no API calls, no `allowed-tools`, no keys required.
**When to use:** When the skill delivers knowledge (templates, code examples, best practices) rather than executing actions.

```yaml
---
name: javascript-sdk
description: "JavaScript/TypeScript patterns for AI SDK integration. React, Next.js, streaming."
allowed-tools: []
disable-model-invocation: false
---
```

Content follows the established guide pattern from Phase 3 (prompting-guide, design-guide, etc.) — markdown tables, code blocks, practical examples. No `scripts/` subdirectory needed.

### Pattern 2: Twitter Skill with Node.js OAuth Helper

**What:** SKILL.md invokes a Node.js script that handles OAuth 1.0a HMAC-SHA1 signing and makes the POST /2/tweets call via HTTPS.
**When to use:** When a provider requires complex auth that cannot be expressed as a single curl header.

SKILL.md frontmatter:
```yaml
---
name: twitter-automation
description: "Post tweets, like, retweet and get user info via X/Twitter API v2. Requires: 4 OAuth keys."
allowed-tools: Bash(node *)
disable-model-invocation: true
---
```

Node.js helper pattern (built-ins only — no npm install):
```javascript
#!/usr/bin/env node
// Source: https://developer.x.com/en/docs/authentication/oauth-1-0a/creating-a-signature
import { createHmac } from 'node:crypto';
import { request } from 'node:https';

const {
  X_CONSUMER_KEY, X_CONSUMER_SECRET,
  X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
} = process.env;

// ... OAuth 1.0a signature generation using crypto.createHmac('sha1', key)
// POST https://api.twitter.com/2/tweets
// { "text": "..." }
```

### Pattern 3: npx CLI (ESM package)

**What:** An ESM Node.js package in `cli/` with `"type": "module"` and a `bin` field pointing to `./bin/init.js`.
**When to use:** `npx pocket-knife init` entry point.

```json
// cli/package.json
{
  "name": "pocket-knife",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "pocket-knife": "./bin/init.js"
  },
  "dependencies": {
    "@inquirer/prompts": "^8.0.0",
    "chalk": "^5.0.0",
    "dotenv": "^17.0.0",
    "fs-extra": "^11.0.0"
  }
}
```

`bin/init.js` must start with `#!/usr/bin/env node` shebang (first line, no blank line before it). ESM imports work directly with `"type": "module"`.

### Pattern 4: Key Validation During Setup

**What:** After collecting each provider's key, make a lightweight API call to confirm it works before writing to `~/.claude/.env`.
**When to use:** SETUP-04 — validate each key immediately after prompting.

Per-provider validation strategy (confirmed against official docs):

| Provider | Env Var | Validation Endpoint | Method | Expected Status |
|----------|---------|---------------------|--------|-----------------|
| Google Gemini | `GOOGLE_API_KEY` | `GET https://generativelanguage.googleapis.com/v1beta/models?key=$KEY&pageSize=1` | curl | 200 |
| ElevenLabs | `ELEVENLABS_API_KEY` | `GET https://api.elevenlabs.io/v1/user` with `xi-api-key:` header | curl | 200 |
| fal.ai | `FAL_KEY` | No dedicated validation endpoint — use `GET https://fal.run/fal-ai/flux/schnell` with `Authorization: Key $KEY`; expect non-401 | curl | not 401 |
| Tavily | `TAVILY_API_KEY` | `POST https://api.tavily.com/search` with `{"query":"test"}` | curl | 200 |
| Exa | `EXA_API_KEY` | `POST https://api.exa.ai/search` with `{"query":"test","num_results":1}` | curl | 200 |
| DASHSCOPE (Qwen) | `DASHSCOPE_API_KEY` | `GET https://dashscope.aliyuncs.com/api/v1/models` with `Authorization: Bearer $KEY` | curl | 200 |
| Twitter/X | `X_CONSUMER_KEY` + 3 others | Validate via `GET https://api.twitter.com/2/users/me` with OAuth 1.0a header | node helper | 200 |

**Implementation:** Use `fetch` or `curl -s -o /dev/null -w "%{http_code}"` to capture HTTP status only. Avoid downloading full response bodies (slow, wasteful). Return `true/false`. On validation failure: warn but offer to save anyway (user may have offline test keys).

### Anti-Patterns to Avoid

- **Using Bearer token to POST tweets:** Bearer token is read-only for X API. Write operations require OAuth 1.0a user context with all 4 credentials. Error: `403 Forbidden: Authenticating with OAuth 2.0 Application-Only is forbidden for this endpoint`.
- **Pure bash OAuth 1.0a:** Generating HMAC-SHA1 signatures in bash requires openssl in a specific invocation that is fragile across platforms. Use Node.js `crypto.createHmac` instead.
- **`twitter-api-v2` npm package in SKILL.md:** Adds a dependency that users would need to install. The thin built-in Node.js helper pattern avoids this.
- **`allowed-tools: Bash(curl *)` for guide skills:** Guide skills should use `allowed-tools: []` — they contain no executable blocks.
- **Writing keys with `echo >> ~/.claude/.env`:** Shell quoting around special characters in keys fails on Windows/Git Bash. Use `fs.appendFileSync` in Node.js.
- **Overwriting existing `~/.claude/.env` without merge:** The CLI must read existing file, skip keys already present, and only append new ones.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth 1.0a HMAC-SHA1 signing | Custom bash signature builder | Node.js `crypto.createHmac('sha1', key)` | openssl bash invocations are fragile across platforms; Node.js built-in is reliable |
| Interactive CLI prompts | Custom readline loop | `@inquirer/prompts` | Handles edge cases: Ctrl+C, validation, type-checking, arrow keys |
| Cross-platform `.env` file writes | `echo >> ~/.env` | `fs-extra` + `fs.appendFileSync` | Shell escaping fails for keys with special characters on Windows/Git Bash |
| Per-category key manifest | Hardcoded list in CLI | JSON manifest file (e.g., `cli/lib/categories.json`) | Easier to maintain; skills can be added without touching CLI logic |

**Key insight:** The hardest parts of this phase are OAuth 1.0a (use crypto built-in, not bash) and safe `.env` mutation (use Node.js fs, not shell echo).

---

## Twitter/X API — Critical Details

### Authentication Requirements by Operation

| Operation | Auth Required | Notes |
|-----------|--------------|-------|
| POST /2/tweets (create tweet) | OAuth 1.0a user context | 4 credentials; HMAC-SHA1 signature per request |
| POST /2/tweets/:id/likes | OAuth 1.0a user context | Same 4 credentials |
| POST /2/users/:id/retweets | OAuth 1.0a user context | Same 4 credentials |
| DELETE /2/tweets/:id | OAuth 1.0a user context | Same 4 credentials |
| GET /2/users/me | OAuth 1.0a user context | Useful for key validation |
| GET /2/tweets/:id (read) | Bearer token OR OAuth 1.0a | Read-only; free tier has no read access |

### Required Environment Variables

| Var Name | Description | Where to Get |
|----------|-------------|--------------|
| `X_CONSUMER_KEY` | API Key (Consumer Key) | X Developer Portal > App > Keys & Tokens |
| `X_CONSUMER_SECRET` | API Secret (Consumer Secret) | Same location |
| `X_ACCESS_TOKEN` | Access Token | Same location — must be generated for your account |
| `X_ACCESS_TOKEN_SECRET` | Access Token Secret | Same location |

### Rate Limits (Free Tier, as of 2026)

- **POST /2/tweets:** ~17 requests per 24 hours (app-level); ~500 per month
- **Read endpoints:** Not available on free tier
- **Free tier is write-only:** Cannot read tweets, cannot search, cannot look up users beyond basic `/2/users/me`

### OAuth 1.0a Signature Construction

```
Signature Base String = METHOD + "&" + url_encode(URL) + "&" + url_encode(sorted_params)
Signing Key = url_encode(consumer_secret) + "&" + url_encode(token_secret)
Signature = base64(HMAC-SHA1(signing_key, base_string))
```

Authorization header format:
```
Authorization: OAuth oauth_consumer_key="...",oauth_nonce="...",oauth_signature="...",
  oauth_signature_method="HMAC-SHA1",oauth_timestamp="...",oauth_token="...",oauth_version="1.0"
```

All values must be percent-encoded. Nonce is a random alphanumeric string. Timestamp is Unix epoch seconds.

---

## SDK and UI Skills — What They Actually Are

### Inference-sh Originals: SDK Skills

The inference-sh `javascript-sdk` and `python-sdk` skills are **guides for using the inference.sh SDK packages** (`@inferencesh/sdk` and `inferencesh`). They document installation, authentication, app execution modes, file uploads, and agent patterns.

**For pocket-knife, these must be adapted** as provider-agnostic guides for integrating AI providers directly into JavaScript/Python projects — without the inference.sh SDK. Suggested content:

- `javascript-sdk`: Patterns for calling Gemini, fal.ai, ElevenLabs via `fetch`/`axios`; TypeScript types; streaming; error handling; Next.js proxy pattern for hiding API keys in frontend
- `python-sdk`: Patterns for calling the same providers via `requests`/`httpx`; async patterns with `asyncio`; `python-dotenv` for key management

Both use `allowed-tools: []` (no execution, pure reference).

### Inference-sh Originals: UI Skills

All four UI skills (agent-ui, chat-ui, tools-ui, widgets-ui) are **guides for using ui.inference.sh shadcn components** installed via `npx shadcn@latest add https://ui.inference.sh/r/[component].json`. They assume the `@inferencesh/sdk` proxy route and `INFERENCE_API_KEY`.

**For pocket-knife, these must be adapted** as provider-agnostic React/Next.js UI guides. Suggested approach:
- `agent-ui`: How to build an AI agent UI with streaming — using any backend (Vercel AI SDK, direct fetch to provider)
- `chat-ui`: How to build a chat interface with message state, streaming tokens, role-based display
- `tools-ui`: How to visualize tool call lifecycle (pending/running/approval/success/error) in React
- `widgets-ui`: How to render dynamic JSON-defined UI — declarative widget pattern

All four use `allowed-tools: []`.

---

## Common Pitfalls

### Pitfall 1: Bearer Token for Write Operations
**What goes wrong:** Skill uses `X_BEARER_TOKEN` with `Authorization: Bearer` to POST a tweet and gets `403 Forbidden`.
**Why it happens:** Bearer token is application-only auth — read-only. Write operations require OAuth 1.0a user context.
**How to avoid:** Use all 4 OAuth 1.0a credentials. Never use Bearer token for write endpoints.
**Warning signs:** 403 response with message "Authenticating with OAuth 2.0 Application-Only is forbidden for this endpoint."

### Pitfall 2: OAuth 1.0a Signature in Bash
**What goes wrong:** Developer tries to build HMAC-SHA1 signature using `openssl dgst -sha1 -hmac` in bash — works on Linux but breaks on macOS or Windows Git Bash due to different openssl invocation syntax.
**Why it happens:** `openssl dgst -sha1 -hmac` vs `openssl dgst -sha1 -mac HMAC -macopt key:...` differ across versions.
**How to avoid:** Use Node.js `crypto.createHmac('sha1', signingKey)` — cross-platform, available everywhere Node.js is installed.
**Warning signs:** Signature mismatch errors (`401 Unauthorized: signature invalid`) that vary by platform.

### Pitfall 3: Overwriting Existing .env Keys in CLI
**What goes wrong:** `npx pocket-knife init` overwrites an existing `~/.claude/.env` that already has `GOOGLE_API_KEY` set, forcing the user to re-enter all keys.
**Why it happens:** Naive `fs.writeFileSync` replaces the entire file.
**How to avoid:** Read existing file first with `dotenv.parse()`, only add keys that are missing, append new keys with a comment separator.
**Warning signs:** Users report losing previously configured keys after running init.

### Pitfall 4: ESM + Shebang in Node.js CLI
**What goes wrong:** `npx pocket-knife init` fails with `SyntaxError: Cannot use import statement` because the shebang file is not recognized as ESM.
**Why it happens:** Without `"type": "module"` in `package.json`, `.js` files default to CommonJS.
**How to avoid:** Set `"type": "module"` in `cli/package.json`. Shebang must be exactly `#!/usr/bin/env node` on line 1 with no blank lines before it.
**Warning signs:** `SyntaxError: Cannot use import statement in a module` or `SyntaxError: Unexpected token 'import'`.

### Pitfall 5: Guide Skills With `allowed-tools: Bash`
**What goes wrong:** A UI or SDK skill with `allowed-tools: Bash(curl *)` causes Claude to try executing bash commands when the skill is invoked — but the content is pure documentation with no executable blocks.
**Why it happens:** Copying frontmatter from an API skill without adjusting.
**How to avoid:** Use `allowed-tools: []` for all guide skills (same as Phase 3 guide pattern).
**Warning signs:** Claude attempts to run undefined commands or produces errors about missing env vars.

### Pitfall 6: X API Free Tier Limitations
**What goes wrong:** twitter-automation skill tries to implement timeline reading, search, or user lookup — these fail silently or with a 403 on the free tier.
**Why it happens:** X free tier is write-only. Read endpoints (GET /2/tweets, search) require Basic tier ($200/month).
**How to avoid:** Limit skill operations to: post tweet, like tweet, retweet, delete tweet, get own user info (`/2/users/me`). Add explicit note in SKILL.md about free tier limitations.
**Warning signs:** 403 on GET endpoints.

---

## Code Examples

### Twitter OAuth 1.0a Node.js Helper (built-ins only)

```javascript
#!/usr/bin/env node
// Source: https://developer.x.com/en/docs/authentication/oauth-1-0a/creating-a-signature
import { createHmac, randomBytes } from 'node:crypto';

const {
  X_CONSUMER_KEY: consumerKey,
  X_CONSUMER_SECRET: consumerSecret,
  X_ACCESS_TOKEN: accessToken,
  X_ACCESS_TOKEN_SECRET: accessTokenSecret
} = process.env;

if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
  console.error('ERROR: Missing X OAuth credentials. Required: X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET');
  console.error('Run /pocket-knife:setup to configure your API keys.');
  process.exit(1);
}

function percentEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function buildOAuthHeader(method, url, bodyParams = {}) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomBytes(16).toString('hex');
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0'
  };
  const allParams = { ...oauthParams, ...bodyParams };
  const sortedParams = Object.keys(allParams).sort()
    .map(k => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join('&');
  const baseString = [method.toUpperCase(), percentEncode(url), percentEncode(sortedParams)].join('&');
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(accessTokenSecret)}`;
  const signature = createHmac('sha1', signingKey).update(baseString).digest('base64');
  const headerParams = { ...oauthParams, oauth_signature: signature };
  const headerStr = Object.keys(headerParams).sort()
    .map(k => `${k}="${percentEncode(headerParams[k])}"`)
    .join(', ');
  return `OAuth ${headerStr}`;
}
```

### CLI Entry Point (ESM)

```javascript
#!/usr/bin/env node
// Source: https://www.npmjs.com/package/@inquirer/prompts
import { select, input, password, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { readFileSync, existsSync } from 'node:fs';
import { writeFile } from 'fs-extra';
import { homedir } from 'node:os';
import { join } from 'node:path';
import * as dotenv from 'dotenv';

const ENV_PATH = join(homedir(), '.claude', '.env');

async function main() {
  console.log(chalk.bold.blue('pocket-knife init'));
  console.log('This will configure your API keys in ~/.claude/.env\n');
  // 1. Select categories
  // 2. For each category, prompt for keys
  // 3. Validate each key
  // 4. Merge with existing .env and write
}

main().catch(console.error);
```

### Key Validation (per-provider, HTTP status only)

```javascript
// Source: Verified against official provider docs (see Sources section)
async function validateKey(provider, key) {
  const checks = {
    google: () => fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=1`),
    elevenlabs: () => fetch('https://api.elevenlabs.io/v1/user', { headers: { 'xi-api-key': key } }),
    tavily: () => fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query: 'test' })
    }),
    exa: () => fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify({ query: 'test', num_results: 1 })
    })
  };
  try {
    const res = await checks[provider]();
    return res.ok;
  } catch { return false; }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `inquirer` (legacy CJS) | `@inquirer/prompts` (ESM, modular) | 2023 | ESM-only; much smaller bundle; each prompt type is a separate import |
| OAuth 2.0 Bearer token for all X API | OAuth 1.0a required for write ops | X API v2 launch (2020, enforced more strictly 2023+) | 4 credentials needed instead of 1; manual HMAC-SHA1 signing |
| X API free tier: 1500 tweets/month | X API free tier: ~500 tweets/month (write-only) | 2024 | Read endpoints blocked on free tier; Basic tier required for reads |
| `chalk` v4 (CJS) | `chalk` v5 (ESM-only) | chalk v5, 2021 | Cannot be used in CJS context; must use ESM |
| `dotenv` v15 | `dotenv` v17 | 2025 | Current stable; API unchanged for basic use cases |

---

## Open Questions

1. **fal.ai key validation without a real request**
   - What we know: fal.ai has no dedicated ping/auth-check endpoint; cheapest validation is a queued inference call which costs credits
   - What's unclear: Is there a no-cost endpoint (e.g., `GET /models` or similar) that validates the key without triggering billing?
   - Recommendation: Skip fal.ai key validation in SETUP-04, or use a known cheap model with minimal parameters. Document this limitation in the CLI.

2. **SDK and UI skills: adapt vs. wholesale rewrite**
   - What we know: The inference-sh originals reference `@inferencesh/sdk` heavily, which is a paid-proxy SDK. Content needs to be rewritten for direct API patterns.
   - What's unclear: How much content from the inference-sh originals is actually reusable?
   - Recommendation: Use inference-sh originals as structural templates only (headings, sections). Rewrite all code examples for direct API patterns.

3. **Twitter skill: which operations to include in v1**
   - What we know: Free tier supports only writes (post, like, retweet, delete). Read endpoints require Basic tier.
   - What's unclear: Should the skill include read operations with an explicit error if on free tier?
   - Recommendation: v1 includes post tweet + get own profile (`/2/users/me` for validation). Document additional operations as appendix with tier requirements.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 18+ | Twitter helper, CLI | Verify at runtime | Requires Claude Code | — (Claude Code requires Node 18+) |
| npm | CLI install | Available with Node.js | bundled | — |
| curl | All API skills | Yes (Git Bash on Windows) | system | — |
| `node:crypto` | OAuth 1.0a helper | Built-in | Node.js built-in | — |

Step 2.6: All CLI dependencies are npm packages installed in `cli/` — no global system tools beyond Node.js are required. Twitter helper uses Node.js built-ins only.

---

## Validation Architecture

> nyquist_validation check: no `.planning/config.json` found — treating as enabled.

### Test Framework

This phase produces SKILL.md files (manual invocation validation) and a Node.js CLI (unit-testable). No automated test framework was detected in the project.

| Property | Value |
|----------|-------|
| Framework | None detected — manual validation via Claude Code invocation |
| Config file | none |
| Quick run command | `node cli/bin/init.js` (manual smoke test) |
| Full suite command | Manual: invoke each skill via `/pocket-knife:twitter-automation`, etc. |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SOC-01 | `twitter-automation` invokable, `disable-model-invocation: true` | manual | `/pocket-knife:twitter-automation` in Claude Code | ❌ Wave 0 |
| SDK-01 | `javascript-sdk` invokable without API key | manual | `/pocket-knife:javascript-sdk` in Claude Code | ❌ Wave 0 |
| SDK-02 | `python-sdk` invokable without API key | manual | `/pocket-knife:python-sdk` in Claude Code | ❌ Wave 0 |
| UI-01 | `agent-ui` invokable without API key | manual | `/pocket-knife:agent-ui` in Claude Code | ❌ Wave 0 |
| UI-02 | `chat-ui` invokable without API key | manual | `/pocket-knife:chat-ui` in Claude Code | ❌ Wave 0 |
| UI-03 | `tools-ui` invokable without API key | manual | `/pocket-knife:tools-ui` in Claude Code | ❌ Wave 0 |
| UI-04 | `widgets-ui` invokable without API key | manual | `/pocket-knife:widgets-ui` in Claude Code | ❌ Wave 0 |
| SETUP-01 | `npx pocket-knife init` runs without error | smoke | `node cli/bin/init.js --dry-run` (if flag added) | ❌ Wave 0 |
| SETUP-04 | Key validation returns true for valid key | unit | `node -e "import('./cli/lib/validate.js').then(m => m.validateKey('google', process.env.GOOGLE_API_KEY)).then(console.log)"` | ❌ Wave 0 |

### Wave 0 Gaps

- [ ] `cli/` directory with `package.json`, `bin/init.js` — SETUP-01
- [ ] `cli/lib/validate.js` — SETUP-04
- [ ] `skills/social/twitter-automation/scripts/post-tweet.js` — SOC-01
- [ ] All 6 guide SKILL.md files (SDK + UI) — SDK-01, SDK-02, UI-01 through UI-04

---

## Sources

### Primary (HIGH confidence)

- [developer.x.com — OAuth 1.0a signature creation](https://developer.x.com/en/docs/authentication/oauth-1-0a/creating-a-signature) — HMAC-SHA1 signature construction, header format
- [developer.x.com — POST /2/tweets API reference](https://developer.x.com/en/docs/x-api/tweets/manage-tweets/api-reference) — endpoint URL, required auth, body schema
- [npmjs.com/@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts) — v8.3.2 verified, ESM-native, prompt types
- [elevenlabs.io/docs/api-reference/user/get](https://elevenlabs.io/docs/api-reference/user/get) — GET /v1/user for key validation
- [ai.google.dev/api/models](https://ai.google.dev/api/models) — GET /v1beta/models for Gemini key validation
- [docs.tavily.com](https://docs.tavily.com/documentation/api-reference/introduction) — POST /search for Tavily key validation
- [2ality.com — ESM shell scripts](https://2ality.com/2022/07/nodejs-esm-shell-scripts.html) — shebang + ESM Node.js CLI pattern

### Secondary (MEDIUM confidence)

- X Developer Community forums — confirmed Bearer token is read-only; OAuth 1.0a required for write ops (multiple threads, consistent)
- [medium.com — How to Get X API Key and Post with Free Tier (October 2025)](https://medium.com/@modernrobinhood1998/how-to-get-an-x-twitter-api-key-and-post-with-the-free-tier-october-2025-b428b23e3fa8) — free tier rate limits
- [zernio.com — X API Pricing 2026](https://zernio.com/blog/twitter-api-pricing) — free tier write-only, 500 tweets/month
- inference-sh GitHub repo: sdk/javascript-sdk/SKILL.md, sdk/python-sdk/SKILL.md — confirmed guide-only nature
- inference-sh GitHub repo: ui/agent-ui, chat-ui, tools-ui, widgets-ui SKILL.md files — confirmed guide + shadcn components pattern

### Tertiary (LOW confidence)

- fal.ai key validation — no dedicated endpoint found; validation approach is unverified; flagged as open question

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via `npm view`, patterns established in Phases 2-3
- Twitter OAuth: MEDIUM — endpoint and auth type confirmed; HMAC-SHA1 implementation pattern from official docs but complex
- SDK/UI skills as guides: HIGH — confirmed by fetching inference-sh source files directly
- CLI pattern: HIGH — ESM + `@inquirer/prompts` + `fs-extra` is well-established; verified package versions
- Key validation endpoints: MEDIUM — Google and ElevenLabs confirmed; fal.ai and Exa unclear

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable APIs; X API pricing could change sooner)
