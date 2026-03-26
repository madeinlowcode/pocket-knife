---
name: javascript-sdk
description: "JavaScript/TypeScript patterns for AI API integration. fetch, streaming, Next.js proxy."
allowed-tools: []
disable-model-invocation: false
---

# JavaScript/TypeScript AI API Integration Guide

Patterns for calling AI providers directly from JavaScript/TypeScript without an intermediate SDK layer.

---

## Quick Start

Node.js 18+ includes `fetch` natively. No external HTTP library needed.

```javascript
// Basic fetch call (Node.js 18+)
const response = await fetch('https://api.provider.example/v1/chat', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Hello' })
});
const data = await response.json();
```

---

## TypeScript Types

```typescript
interface AIRequest<T = unknown> {
  model?: string;
  [key: string]: T;
}

interface AIResponse {
  id: string;
  choices?: Array<{ message: { role: string; content: string } }>;
  error?: { message: string; type: string };
}

interface StreamingChunk {
  choices?: Array<{ delta?: { content?: string } }>;
}
```

---

## Direct API Calls (fetch)

### Gemini (Google)

```javascript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Explain quantum computing' }] }]
    })
  }
);
const data = await response.json();
```

### ElevenLabs (TTS/STT)

```javascript
// Text-to-Speech
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: 'Hello, this is a test.',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    })
  }
);
const audioBuffer = await response.arrayBuffer();
```

### fal.ai

```javascript
const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
  method: 'POST',
  headers: {
    'Authorization': `Key ${process.env.FAL_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ prompt: 'A sunset over the ocean' })
});
const data = await response.json();
```

### Tavily (Web Search)

```javascript
const response = await fetch('https://api.tavily.com/search', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: 'latest AI news', num_results: 5 })
});
const data = await response.json();
```

---

## Streaming Responses

### LLM Streaming (for-await-of)

```javascript
const response = await fetch('https://api.provider.example/v1/chat', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'gpt-4', stream: true, messages: [{ role: 'user', content: 'Tell me a story' }] })
});

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error?.message || 'API request failed');
}

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value, { stream: true });
  // Parse SSE lines: data: {...}
  for (const line of chunk.split('\n')) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      process.stdout.write(data.choices?.[0]?.delta?.content || '');
    }
  }
}
```

---

## Next.js Proxy Route

Hide API keys from the frontend by calling APIs server-side.

```typescript
// app/api/ai/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { prompt, model } = await request.json();

  const response = await fetch('https://api.provider.example/v1/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PROVIDER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] })
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

Frontend calls `/api/ai` — keys stay server-side.

---

## Error Handling

```javascript
async function aiRequest(url, options) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch { /* use status text */ }
      throw new Error(`AI API error: ${errorMessage}`);
    }

    return await response.json();
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error(`Network error: ${err}`);
  }
}
```

---

## Key Management

| Rule | Implementation |
|------|----------------|
| Never expose keys in frontend | Use Next.js proxy routes or server-side only |
| Use environment variables | `process.env.API_KEY` in Node.js |
| Local development | Use `.env.local` with `dotenv` parsing |
| Production | Use hosting provider's secret management |

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
