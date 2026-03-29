---
name: twitter-automation
description: "Post tweets, like, retweet on X/Twitter. Use for: social media automation, posting"
allowed-tools: Bash(node *)
disable-model-invocation: true
---

Post tweets, like, retweet, delete tweets, and get your own profile via X/Twitter API v2 using OAuth 1.0a HMAC-SHA1 authentication.

**Required environment variables (4):**
- `X_CONSUMER_KEY` — API Key from X Developer Portal
- `X_CONSUMER_SECRET` — API Secret from X Developer Portal
- `X_ACCESS_TOKEN` — Access Token generated for your account
- `X_ACCESS_TOKEN_SECRET` — Access Token Secret

**Free tier limitations:** Write-only (~500 tweets/month). No reading of timeline, search, or user lookups without Basic tier ($200/month).

**Supported operations:**

| Action | Description |
|--------|-------------|
| `post` | Post a new tweet (text up to 280 chars) |
| `like` | Like a tweet |
| `retweet` | Retweet a tweet |
| `delete` | Delete one of your own tweets |
| `me` | Get your own profile (`/2/users/me`) |

---

## Usage

### Step 1 — Check credentials

Make sure all 4 environment variables are set before running:

```bash
if [ -z "$X_CONSUMER_KEY" ] || [ -z "$X_CONSUMER_SECRET" ] || [ -z "$X_ACCESS_TOKEN" ] || [ -z "$X_ACCESS_TOKEN_SECRET" ]; then
  echo "ERROR: Missing X OAuth credentials."
  echo "Required: X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET"
  echo "Run /pocket-knife:setup to configure your API keys."
  exit 1
fi
```

### Step 2 — Locate the helper script

```bash
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$SKILL_DIR/scripts/post-tweet.mjs"
```

### Step 3 — Execute the operation

**Post a tweet:**
```bash
ACTION="post" TWEET_TEXT="Hello from Pocket-Knife!" node "$SCRIPT"
```

**Like a tweet:**
```bash
ACTION="like" TWEET_ID="1234567890" USER_ID="123456789" node "$SCRIPT"
```

**Retweet a tweet:**
```bash
ACTION="retweet" TWEET_ID="1234567890" USER_ID="123456789" node "$SCRIPT"
```

**Delete a tweet:**
```bash
ACTION="delete" TWEET_ID="1234567890" node "$SCRIPT"
```

**Get your profile:**
```bash
ACTION="me" node "$SCRIPT"
```

### Step 4 — Report result

The script returns JSON with the API response. Report it to the user.

---

## Rate Limits (Free Tier)

| Endpoint | Limit |
|----------|-------|
| POST /2/tweets | ~17 requests per 24 hours, ~500/month |
| POST /2/users/:id/likes | ~17 per 24 hours |
| POST /2/users/:id/retweets | ~17 per 24 hours |
| DELETE /2/tweets/:id | ~50 per 24 hours |
| GET /2/users/me | ~15 per 15 minutes |

---

## Basic Tier Operations (not available on free tier)

With Basic tier ($200/month), additional operations become available:
- Read tweets and timeline
- Search tweets
- User lookup
- Follow/unfollow

See: https://developer.x.com/en/docs/tiers
