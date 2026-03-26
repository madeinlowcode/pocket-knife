---
name: agent-ui
description: "React/Next.js patterns for AI agent UI with streaming and tool calls display."
allowed-tools: []
disable-model-invocation: false
---

# Agent UI Guide

## Overview

An agent UI displays an AI assistant that can stream text in real-time, show thinking/reasoning steps, and execute tool calls on behalf of the user. Unlike a simple chat interface, an agent UI visualizes the full agent loop: think -> decide -> act -> respond.

**Key capabilities:**
- Real-time text streaming from the LLM
- Thinking/reasoning display (chain-of-thought visible to user)
- Tool call cards showing what tools are being used
- Status indicators for pending, running, success, and error states

## Component Structure

```
AgentContainer
  Header (agent name, status badge)
  MessageList
    AgentMessage (streaming text, markdown rendered)
    ThinkingIndicator (animated dots during reasoning)
    ToolCallCard (name, input, output, status)
    UserMessage (echo of user input)
  InputArea (textarea, send button, streaming indicator)
```

## Streaming Setup

### Using ReadableStream + TextDecoder

```typescript
async function* streamText(response: Response): AsyncGenerator<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}

// SSE parsing for OpenAI-compatible endpoints
async function parseSSE chunks(chunks: AsyncGenerator<string>): AsyncGenerator<string> {
  let buffer = '';

  for await (const chunk of chunks) {
    buffer += chunk;

    while (buffer.includes('\n')) {
      const lineEnd = buffer.indexOf('\n');
      const line = buffer.slice(0, lineEnd).trim();
      buffer = buffer.slice(lineEnd + 1);

      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          yield parsed.choices?.[0]?.delta?.content ?? '';
        } catch {}
      }
    }
  }
}
```

### Provider SSE Formats

| Provider | Format | Example |
|----------|--------|---------|
| OpenAI-compatible | `data: {"choices":[{"delta":{"content":"..."}}]}` | text-completion stream |
| Gemini | Server-sent events, `event: chunk` | `data: {"chunk": {"content": "..."}}` |
| Claude | Line-delimited JSON | `{"type":"content_block_delta","delta":{"text":"..."}}` |

## State Management

```typescript
interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string;        // Chain-of-thought before final answer
  toolCalls?: ToolCall[];
  timestamp: Date;
}

interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
  status: 'pending' | 'running' | 'success' | 'error';
  error?: string;
}

interface AgentState {
  messages: AgentMessage[];
  isThinking: boolean;
  activeToolCall: string | null;  // tool call id currently executing
  inputValue: string;
}
```

### Recommended Hook Pattern

```typescript
function useAgentState() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    const userMsg: AgentMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    // Stream response, update messages progressively
    const assistantMsg = await streamAssistantResponse([...messages, userMsg]);
    setMessages(prev => [...prev, assistantMsg]);
    setIsThinking(false);
  };

  return { messages, isThinking, activeTool, sendMessage };
}
```

## Tool Call Display

### ToolCallCard Component

```typescript
interface ToolCallCardProps {
  toolCall: ToolCall;
  onApprove?: (id: string) => void;   // For human-in-the-loop
  onDeny?: (id: string) => void;
}

function ToolCallCard({ toolCall, onApprove, onDeny }: ToolCallCardProps) {
  const statusStyles = {
    pending: 'border-yellow-300 bg-yellow-50',
    running: 'border-blue-300 bg-blue-50 animate-pulse',
    success: 'border-green-300 bg-green-50',
    error: 'border-red-300 bg-red-50'
  };

  return (
    <div className={`border rounded-lg p-4 ${statusStyles[toolCall.status]}`}>
      <div className="flex items-center gap-2 mb-2">
        <ToolIcon name={toolCall.name} />
        <span className="font-mono font-semibold">{toolCall.name}</span>
        <StatusBadge status={toolCall.status} />
      </div>

      <details className="mb-2">
        <summary className="cursor-pointer text-sm text-gray-600">Input</summary>
        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
          {JSON.stringify(toolCall.input, null, 2)}
        </pre>
      </details>

      {toolCall.output && (
        <details className="mb-2">
          <summary className="cursor-pointer text-sm text-gray-600">Output</summary>
          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
            {JSON.stringify(toolCall.output, null, 2)}
          </pre>
        </details>
      )}

      {toolCall.error && (
        <div className="text-red-600 text-sm mt-2">
          Error: {toolCall.error}
        </div>
      )}

      {toolCall.status === 'pending' && onApprove && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => onApprove(toolCall.id)}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm">
            Approve
          </button>
          <button onClick={() => onDeny(toolCall.id)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm">
            Deny
          </button>
        </div>
      )}
    </div>
  );
}
```

## Example: Vercel AI SDK

```typescript
import { useChat } from 'ai/react';
import { ToolCallCard } from './components';

export function AgentChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/agent',
    onToolCall: ({ toolCallName, toolCallArgs }) => {
      // Show tool call card when LLM requests a tool
      console.log('Tool requested:', toolCallName, toolCallArgs);
    }
  });

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />

      {isLoading && <ThinkingIndicator />}

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Ask the agent..."
          className="w-full p-2 border rounded"
        />
      </form>
    </div>
  );
}
```

## Example: Direct Fetch

```typescript
async function sendToProvider(messages: Message[], tools?: Tool[]) {
  const response = await fetch('https://api.provider.com/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      tools: tools?.map(t => ({ type: 'function', function: t.schema })),
      stream: true
    })
  });

  const streamedMessage: AgentMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '',
    toolCalls: [],
    timestamp: new Date()
  };

  for await (const token of parseSSE(streamText(response))) {
    streamedMessage.content += token;
    // Update UI progressively
    setMessages(prev => [...prev.slice(0, -1), { ...streamedMessage }]);
  }

  return streamedMessage;
}
```

## Accessibility

### aria-live Regions

```tsx
<div aria-live="polite" aria-atomic="false" className="sr-only">
  {/* Screen reader announcements during streaming */}
  {isThinking && 'Agent is thinking'}
  {activeTool && `Running tool: ${activeTool}`}
</div>
```

### Best Practices

| Practice | Implementation |
|----------|---------------|
| Announce new messages | `aria-live="polite"` on message list |
| Announce tool status changes | `aria-live="assertive"` for errors |
| Keyboard navigation | Tab through messages, Enter to expand tool details |
| Reduced motion | Respect `prefers-reduced-motion` for streaming animations |
| Focus management | Auto-scroll should not steal focus from input |

## Provider Streaming Support

| Provider | Streaming | Tool Calls | SDK / Native |
|----------|-----------|-----------|--------------|
| OpenAI (GPT-4o) | Yes | Yes (function calling) | `openai` npm package |
| Google Gemini | Yes | Yes (function declarations) | `@google/generative-ai` |
| Anthropic Claude | Yes | Yes (tool use) | `@anthropic-ai/sdk` |
| xAI Grok | Yes | Yes | Direct API |
| Vercel AI SDK | Yes | Yes | `ai` npm package (provider-agnostic) |

All major providers support streaming and tool calls. Use a provider-agnostic SDK like Vercel AI SDK to avoid locking into a single provider.
