---
name: python-sdk
description: "Python patterns for AI API integration. requests, httpx, asyncio, dotenv."
allowed-tools: []
disable-model-invocation: false
---

# Python AI API Integration Guide

Patterns for calling AI providers directly from Python without an intermediate SDK layer.

---

## Quick Start

```bash
pip install requests python-dotenv
```

```python
import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.expanduser('~/.claude/.env'))

response = requests.post(
    'https://api.provider.example/v1/chat',
    headers={'Authorization': f'Bearer {os.environ["API_KEY"]}'},
    json={'prompt': 'Hello'}
)
data = response.json()
```

---

## Direct API Calls (requests)

### Gemini (Google)

```python
import os
import requests

api_key = os.environ['GOOGLE_API_KEY']
url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}'

response = requests.post(url, json={
    'contents': [{'parts': [{'text': 'Explain quantum computing'}]}]
})
data = response.json()
print(data['candidates'][0]['content']['parts'][0]['text'])
```

### ElevenLabs (TTS)

```python
import os
import requests

response = requests.post(
    f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}',
    headers={'xi-api-key': os.environ['ELEVENLABS_API_KEY']},
    json={
        'text': 'Hello, this is a test.',
        'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75}
    }
)

if response.ok:
    with open('output.mp3', 'wb') as f:
        f.write(response.content)
else:
    print(f'Error: {response.status_code} - {response.text}')
```

### fal.ai

```python
import os
import requests

response = requests.post(
    'https://fal.run/fal-ai/flux/schnell',
    headers={'Authorization': f'Key {os.environ["FAL_KEY"]}'},
    json={'prompt': 'A sunset over the ocean'}
)
data = response.json()
print(data.get('images', [{}])[0].get('url', ''))
```

### Tavily (Web Search)

```python
import os
import requests

response = requests.post(
    'https://api.tavily.com/search',
    headers={'Authorization': f'Bearer {os.environ["TAVILY_API_KEY"]}'},
    json={'query': 'latest AI news', 'num_results': 5}
)
results = response.json()['results']
for r in results:
    print(f"{r['title']} — {r['url']}")
```

---

## Async with httpx

```bash
pip install httpx
```

```python
import os
import asyncio
import httpx

async def call_gemini(prompt: str) -> str:
    api_key = os.environ['GOOGLE_API_KEY']
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}',
            json={'contents': [{'parts': [{'text': prompt}]}]},
            timeout=30.0
        )
        data = response.json()
        return data['candidates'][0]['content']['parts'][0]['text']

result = asyncio.run(call_gemini('Hello'))
print(result)
```

### Concurrent Requests

```python
async def call_multiple(prompts: list[str]) -> list[str]:
    async with httpx.AsyncClient() as client:
        tasks = [call_gemini(p) for p in prompts]
        return await asyncio.gather(*tasks)

results = asyncio.run(call_multiple(['Question 1?', 'Question 2?', 'Question 3?']))
```

---

## Streaming (SSE)

```python
import os
import requests

response = requests.post(
    'https://api.provider.example/v1/chat',
    headers={'Authorization': f'Bearer {os.environ["API_KEY"]}'},
    json={'model': 'gpt-4', 'stream': True, 'messages': [{'role': 'user', 'content': 'Tell me a story'}]},
    stream=True
)

if not response.ok:
    print(f'Error: {response.status_code}')
    exit(1)

for line in response.iter_lines():
    if line.startswith('data: '):
        data = line[6:]
        if data == '[DONE]':
            break
        import json
        chunk = json.loads(data)
        content = chunk.get('choices', [{}])[0].get('delta', {}).get('content', '')
        if content:
            print(content, end='', flush=True)
print()
```

---

## Key Management

```python
import os
from pathlib import Path
from dotenv import load_dotenv

# Load from ~/.claude/.env (project root or home directory)
env_path = Path.home() / '.claude' / '.env'
if env_path.exists():
    load_dotenv(env_path)

# Or load from current directory
load_dotenv()

# Access keys — never hardcode
api_key = os.environ.get('GOOGLE_API_KEY')
if not api_key:
    raise ValueError('GOOGLE_API_KEY not set in environment')
```

**Security rules:**
- Never commit `.env` files to version control
- Add `.env` to `.gitignore`
- Use `Path.home() / '.claude' / '.env'` for project-agnostic key storage

---

## Binary Output (audio/image)

```python
import os
import requests

response = requests.post(
    'https://api.elevenlabs.io/v1/text-to-speech/voice_id',
    headers={'xi-api-key': os.environ['ELEVENLABS_API_KEY']},
    json={'text': 'Hello, world!'}
)

if response.ok:
    # Save binary audio to file
    output_path = Path('~/Downloads/audio.mp3').expanduser()
    output_path.write_bytes(response.content)
    print(f'Saved to {output_path}')
else:
    raise RuntimeError(f'TTS failed: {response.status_code}')
```

---

## Error Handling

```python
import requests

def ai_request(url: str, **kwargs) -> dict:
    response = requests.post(url, **kwargs)

    if not response.ok:
        try:
            error_data = response.json()
            error_msg = error_data.get('error', {}).get('message') or error_data.get('message', '')
        except ValueError:
            error_msg = response.text[:200]

        raise RuntimeError(
            f'AI API error ({response.status_code}): {error_msg}'
        )

    return response.json()
```

---

## Provider Reference

| Provider | Base URL | Auth Header | Env Var |
|----------|----------|-------------|---------|
| Google Gemini | `https://generativelanguage.googleapis.com` | `x-goog-api-key: KEY` | `GOOGLE_API_KEY` |
| ElevenLabs | `https://api.elevenlabs.io/v1` | `xi-api-key: KEY` | `ELEVENLABS_API_KEY` |
| fal.ai | `https://fal.run` | `Authorization: Key KEY` | `FAL_KEY` |
| Tavily | `https://api.tavily.com` | `Authorization: Bearer KEY` | `TAVILY_API_KEY` |
| Exa | `https://api.exa.ai` | `x-api-key: KEY` | `EXA_API_KEY` |
| DashScope (Qwen) | `https://dashscope.aliyuncs.com/api/v1` | `Authorization: Bearer KEY` | `DASHSCOPE_API_KEY` |
