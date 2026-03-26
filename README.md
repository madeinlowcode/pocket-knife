# Pocket-Knife

85+ AI skills (image, video, audio, LLM, web search) using your own API keys — no paid proxy, no middleman.

## Installation

### Via Claude Code plugin marketplace

```
/plugin marketplace add pocket-knife
```

### Via direct GitHub install

```
/plugin install pocket-knife-dev/pocket-knife
```

### Via git clone (development)

```bash
git clone https://github.com/pocket-knife-dev/pocket-knife.git
claude --plugin-dir ./pocket-knife
```

## Setup

After installing, configure your API keys:

```
/pocket-knife:setup
```

This will guide you through creating `~/.claude/.env` with the keys for the skills you want to use.

## Requirements

- Claude Code >= 1.0.33
- curl (available on macOS, Linux, WSL, Git Bash)
- bash 4+ (for the env loader hook)

## Windows

Scripts use LF line endings (enforced via `.gitattributes`). Use WSL or Git Bash.
If `curl` resolves to PowerShell's `Invoke-WebRequest`, install real curl via: `winget install curl.curl`

## Skills

| Category | Skills |
|----------|--------|
| Image | ai-image-generation, flux-image, nano-banana, nano-banana-2, background-removal, image-upscaling, p-image, qwen-image-2, qwen-image-2-pro |
| Audio | elevenlabs-tts, elevenlabs-stt, elevenlabs-dialogue, elevenlabs-sound-effects, elevenlabs-voice-cloner, elevenlabs-voice-changer, elevenlabs-music, elevenlabs-dubbing |
| Video | ai-video-generation, google-veo, image-to-video |
| LLM | llm-models |
| Search | web-search |
| Social | twitter-automation |
| SDK | javascript-sdk, python-sdk |
| UI | agent-ui, chat-ui, tools-ui, widgets-ui |
| Guides | prompting-guide, design-guide, video-guide, writing-guide, social-guide, product-guide |

## License

MIT — see [LICENSE](./LICENSE)
