# Pocket-Knife

**38 AI skills for Claude Code using your own API keys — no paid proxy, no middleman.**

Generate images, create videos, synthesize speech, search the web, post tweets, and more. Each skill calls the provider API directly via `curl` using keys you configure once in `~/.claude/.env`.

Inspired by [inference.sh/skills](https://github.com/inference-sh/skills) (MIT) — same capabilities, zero intermediary costs.

---

## Quick Start

### 1. Install the plugin

```
/plugin install madeinlowcode/pocket-knife
```

Or via marketplace:

```
/plugin marketplace add madeinlowcode/pocket-knife
```

### 2. Configure your API keys

**Option A — Interactive CLI (recommended for first setup):**

```bash
npx github:madeinlowcode/pocket-knife
```

The CLI asks which skill categories you want, prompts only the relevant API keys, validates them, and writes `~/.claude/.env`.

**Option B — Conversational skill (inside Claude Code):**

```
/pocket-knife:setup
```

Claude guides you through creating or updating `~/.claude/.env` step by step.

**Option C — Manual:**

Create `~/.claude/.env` and add the keys you need:

```env
# Google (Gemini, Imagen, Veo)
GOOGLE_API_KEY=your-key-here

# ElevenLabs (TTS, STT, voice cloning, dubbing, music)
ELEVENLABS_API_KEY=your-key-here

# fal.ai (FLUX, Kling, Wan, Seedance, upscaling, background removal)
FAL_KEY=your-key-here

# Alibaba DashScope (Qwen image models)
DASHSCOPE_API_KEY=your-key-here

# Tavily (web search)
TAVILY_API_KEY=your-key-here

# Exa (web search — alternative to Tavily)
EXA_API_KEY=your-key-here

# X/Twitter (OAuth 1.0a — all 4 required for posting)
X_CONSUMER_KEY=your-key
X_CONSUMER_SECRET=your-secret
X_ACCESS_TOKEN=your-token
X_ACCESS_TOKEN_SECRET=your-token-secret

# Google Cloud (required only for Google Veo video generation)
GOOGLE_CLOUD_PROJECT=your-project-id
```

### 3. Use any skill

```
/pocket-knife:nano-banana
/pocket-knife:elevenlabs-tts
/pocket-knife:web-search
/pocket-knife:flux-image
```

---

## Skills (38 total)

### Image Generation (9 skills)

| Skill | Provider | Key Required |
|-------|----------|-------------|
| `ai-image-generation` | Google Imagen 4 | `GOOGLE_API_KEY` |
| `nano-banana` | Google Gemini 3 Pro Image | `GOOGLE_API_KEY` |
| `nano-banana-2` | Google Gemini 3.1 Flash | `GOOGLE_API_KEY` |
| `flux-image` | fal.ai FLUX Dev LoRA | `FAL_KEY` |
| `image-upscaling` | fal.ai Topaz Upscaler | `FAL_KEY` |
| `background-removal` | fal.ai BiRefNet | `FAL_KEY` |
| `p-image` | fal.ai Pruna P-Image | `FAL_KEY` |
| `qwen-image-2` | Alibaba DashScope Qwen | `DASHSCOPE_API_KEY` |
| `qwen-image-2-pro` | Alibaba DashScope Qwen Pro | `DASHSCOPE_API_KEY` |

### Audio (9 skills)

| Skill | What it does | Key Required |
|-------|-------------|-------------|
| `elevenlabs-tts` | Text to speech | `ELEVENLABS_API_KEY` |
| `elevenlabs-stt` | Speech to text (transcription) | `ELEVENLABS_API_KEY` |
| `elevenlabs-dialogue` | Multi-speaker audio generation | `ELEVENLABS_API_KEY` |
| `elevenlabs-sound-effects` | Sound effect generation | `ELEVENLABS_API_KEY` |
| `elevenlabs-voice-cloner` | Clone a voice from audio sample | `ELEVENLABS_API_KEY` |
| `elevenlabs-voice-changer` | Transform voice in audio file | `ELEVENLABS_API_KEY` |
| `elevenlabs-music` | Music generation from prompt | `ELEVENLABS_API_KEY` |
| `elevenlabs-dubbing` | Automatic audio dubbing/translation | `ELEVENLABS_API_KEY` |
| `elevenlabs-voice-isolator` | Isolate voice from noisy audio | `ELEVENLABS_API_KEY` |

### Video (4 skills)

| Skill | Provider | Key Required |
|-------|----------|-------------|
| `ai-video-generation` | fal.ai Kling 1.6 | `FAL_KEY` |
| `google-veo` | Google Veo 3.1 (Vertex AI) | `GOOGLE_CLOUD_PROJECT` + gcloud |
| `image-to-video` | fal.ai Wan 2.2 | `FAL_KEY` |
| `p-video` | fal.ai Seedance 1.0 Lite | `FAL_KEY` |

### LLM & Search (2 skills)

| Skill | What it does | Key Required |
|-------|-------------|-------------|
| `llm-models` | Multi-provider LLM (Claude, Gemini, Kimi, GLM) | Provider-specific key |
| `web-search` | Web search via Tavily or Exa | `TAVILY_API_KEY` or `EXA_API_KEY` |

### Social (1 skill)

| Skill | What it does | Key Required |
|-------|-------------|-------------|
| `twitter-automation` | Post tweets, like, retweet via X API v2 | 4 `X_*` OAuth keys |

### SDK Guides (2 skills)

| Skill | What it covers |
|-------|---------------|
| `javascript-sdk` | Building AI apps with JS/TS — fetch, streaming, error handling |
| `python-sdk` | Building AI apps with Python — requests, async, providers |

### UI Guides (4 skills)

| Skill | What it covers |
|-------|---------------|
| `agent-ui` | Building AI agent interfaces with React |
| `chat-ui` | Chat interface patterns and components |
| `tools-ui` | Tool result rendering and display |
| `widgets-ui` | Reusable AI-powered widget components |

### Reference Guides (7 skills) — no API key needed

| Skill | Topic |
|-------|-------|
| `prompting-guide` | Prompt engineering techniques (chain-of-thought, few-shot, etc.) |
| `design-guide` | AI-assisted design workflows and tools |
| `video-guide` | Video production with AI models |
| `writing-guide` | AI-powered content writing frameworks |
| `social-guide` | Social media content strategy with AI |
| `product-guide` | AI in product development and strategy |
| `content-guide` | Content repurposing and multi-format pipelines |

---

## How It Works

```
~/.claude/.env          (your API keys — configured once)
       |
       v
hooks/hooks.json        (SessionStart hook)
       |
       v
scripts/load-env.sh     (loads keys into environment — runs once per session)
       |
       v
skills/*/SKILL.md       (each skill uses curl to call provider API directly)
```

1. When Claude Code starts a session, the **SessionStart hook** runs `load-env.sh`
2. `load-env.sh` reads `~/.claude/.env` and exports all variables
3. Each skill uses `curl` with the appropriate API key to call the provider directly
4. No proxy, no middleman — your key, your cost, your data

### Security

- API keys live in `~/.claude/.env` (outside any git repository)
- `load-env.sh` never uses `set -x` (would leak keys to stderr)
- `load-env.sh` never echoes key values
- All API-calling skills use `disable-model-invocation: true` — Claude won't trigger them without your explicit command
- Skills use `allowed-tools: Bash(curl *)` — scoped to curl only

---

## Requirements

- **Claude Code** >= 1.0.33
- **curl** (macOS, Linux, WSL, Git Bash)
- **bash** 4+ (for the env loader hook)
- **Node.js** 18+ (only for CLI installer and Twitter OAuth helper)

### Windows

Scripts use LF line endings (enforced via `.gitattributes`). Use **WSL** or **Git Bash**.

If `curl` resolves to PowerShell's `Invoke-WebRequest`, install real curl:

```powershell
winget install curl.curl
```

---

## API Keys — Where to Get Them

| Provider | Key | Get it at |
|----------|-----|-----------|
| Google AI | `GOOGLE_API_KEY` | [aistudio.google.com](https://aistudio.google.com/apikey) |
| ElevenLabs | `ELEVENLABS_API_KEY` | [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys) |
| fal.ai | `FAL_KEY` | [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) |
| DashScope | `DASHSCOPE_API_KEY` | [dashscope.console.aliyun.com](https://dashscope.console.aliyun.com/) |
| Tavily | `TAVILY_API_KEY` | [app.tavily.com](https://app.tavily.com/) |
| Exa | `EXA_API_KEY` | [dashboard.exa.ai](https://dashboard.exa.ai/) |
| X/Twitter | 4 OAuth keys | [developer.x.com](https://developer.x.com/en/portal/dashboard) |
| Google Cloud | `GOOGLE_CLOUD_PROJECT` | [console.cloud.google.com](https://console.cloud.google.com/) |

---

## Project Structure

```
pocket-knife/
  .claude-plugin/
    plugin.json             # Plugin manifest (namespace: pocket-knife)
    marketplace.json        # Marketplace distribution config
  hooks/
    hooks.json              # SessionStart hook to load env
  scripts/
    load-env.sh             # Loads ~/.claude/.env into environment
    validate-plugin.sh      # Structural validation script
  commands/
    setup.md                # /pocket-knife:setup conversational wizard
  skills/
    image/                  # 9 image generation skills
    audio/                  # 9 ElevenLabs audio skills
    video/                  # 4 video generation skills
    llm/                    # LLM multi-provider skill
    search/                 # Web search (Tavily + Exa)
    social/                 # Twitter automation + OAuth helper
    sdk/                    # JS and Python SDK guides
    ui/                     # UI component guides
    guides/                 # 7 reference guides (no API key needed)
  cli/
    package.json            # npx pocket-knife init
    bin/init.js             # CLI entry point
    lib/                    # prompts, validation, env writer
  .gitattributes            # LF line endings for scripts
  LICENSE                   # MIT
  README.md
```

---

## Contributing

1. Fork the repo
2. Create a skill in the appropriate category directory
3. Follow the SKILL.md pattern (frontmatter + instructions)
4. Ensure `disable-model-invocation: true` for any skill that makes API calls
5. Keep descriptions under 100 characters
6. Submit a PR

### Adding a new provider

1. Add the env var to `cli/lib/categories.json`
2. Add validation logic to `cli/lib/validate.js`
3. Create skills in the appropriate category
4. Update this README

---

## Comparison with inference.sh

| | inference.sh | Pocket-Knife |
|---|---|---|
| **Cost** | Paid proxy (per-request billing) | Free — you pay providers directly |
| **API calls** | Via `infsh app run` CLI | Direct `curl` to provider |
| **API keys** | Managed by Inference | Your own keys in `~/.claude/.env` |
| **Skills** | 85+ | 38 (and growing) |
| **License** | MIT | MIT |
| **Vendor lock-in** | Yes (infsh CLI required) | None (standard curl) |

---

## License

MIT — see [LICENSE](./LICENSE)

---

Built with Claude Code. Inspired by [inference.sh](https://inference.sh).
