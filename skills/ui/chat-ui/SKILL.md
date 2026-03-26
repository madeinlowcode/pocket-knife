---
name: chat-ui
description: "React/Next.js patterns for chat interface: messages, streaming, role-based display."
allowed-tools: []
disable-model-invocation: false
---

# Chat UI Guide

## Overview

A chat UI is a message-based interface for conversational AI. Unlike agent UIs, chat interfaces are typically stateless (each message is independent) and focus on message display rather than tool execution. The core challenge is handling streaming tokens, role-based rendering, and scroll management.

**Key capabilities:**
- Role-based message bubbles (user, assistant, system)
- Real-time token streaming (text appears progressively)
- Markdown rendering for assistant responses
- Code blocks with syntax highlighting
- Auto-scroll to latest message

## Component Structure

```
ChatContainer
  MessageList
    MessageBubble (role: user | assistant | system)
      Avatar
      Content (markdown rendered, code highlighted)
      Timestamp
    TypingIndicator (animated dots when assistant is responding)
  InputArea
    Textarea (Enter to send, Shift+Enter for newline)
    SendButton
    CharacterCount (optional)
```

## Message State

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;   // True while tokens are still arriving
  timestamp: Date;
  attachments?: Attachment[];  // For future file upload support
}

interface Attachment {
  type: 'image' | 'file';
  url: string;
  name?: string;
}

interface ChatState {
  messages: Message[];
  inputValue: string;
  isStreaming: boolean;
  error: string | null;
}
```

## Streaming Tokens

### Concept

When the LLM streams a response, tokens arrive progressively. The UI must append each token to the last assistant message without creating new messages until the stream is complete.

### Implementation

```typescript
function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const streamAssistantMessage = async (userMessage: Message) => {
    // Add placeholder for assistant response
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, assistantMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE token and append to message
        const token = parseToken(chunk);

        setMessages(prev => prev.map(msg =>
          msg.id === assistantId
            ? { ...msg, content: msg.content + token }
            : msg
        ));
      }

      // Mark stream as complete
      setMessages(prev => prev.map(msg =>
        msg.id === assistantId ? { ...msg, isStreaming: false } : msg
      ));

    } finally {
      setIsStreaming(false);
    }
  };

  return { messages, streamAssistantMessage, isStreaming };
}
```

### Token Parsing

```typescript
// Parse token from SSE chunk (OpenAI-compatible)
function parseToken(chunk: string): string {
  const lines = chunk.split('\n').filter(l => l.trim());

  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const data = line.slice(6);
    if (data === '[DONE]') return '';
    try {
      const parsed = JSON.parse(data);
      return parsed.choices?.[0]?.delta?.content ?? '';
    } catch {}
  }
  return '';
}
```

## Scroll Behavior

```typescript
function useAutoScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const scrollToBottom = () => {
    if (containerRef.current && shouldAutoScroll.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Auto-scroll if user is within 100px of bottom
    shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 100;
  };

  return { containerRef, scrollToBottom, handleScroll };
}

// Usage in component
useEffect(() => {
  scrollToBottom();
}, [messages]);
```

## Input Handling

### Textarea with Smart Submit

```typescript
function ChatInput({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend(value.trim());
        setValue('');
      }
    }
  };

  // Auto-resize textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex gap-2 p-4 border-t">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
        disabled={disabled}
        rows={1}
        className="flex-1 p-2 border rounded resize-none max-h-32"
      />
      <button
        onClick={() => { onSend(value.trim()); setValue(''); }}
        disabled={disabled || !value.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
```

## Markdown Rendering

### Setup with react-markdown

```bash
npm install react-markdown remark-gfm
```

```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function MessageContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Custom renderers for specific elements
        h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-semibold mt-3 mb-2">{children}</h2>,
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        code: CodeBlock,  // Custom code block component
        pre: ({ children }) => <pre className="mb-2">{children}</pre>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="text-blue-500 underline">{children}</a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

## Code Highlighting

### Setup with react-syntax-highlighter

```bash
npm install react-syntax-highlighter
```

```typescript
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeBlock({ className, children }: { className?: string; children: string }) {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  // Detect if inside a pre (block code) or inline
  if (!className) {
    return <code className="px-1 py-0.5 bg-gray-100 rounded text-sm font-mono">{children}</code>;
  }

  return (
    <SyntaxHighlighter
      style={vscDarkPlus}
      language={language || 'text'}
      PreTag="div"
      className="rounded-lg text-sm my-2"
    >
      {String(children).trim()}
    </SyntaxHighlighter>
  );
}
```

## Persistence

### localStorage (Simple)

```typescript
const STORAGE_KEY = 'chat_messages';

function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: Message[]) {
  try {
    // Keep only last 100 messages to avoid quota issues
    const toSave = messages.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Storage full or unavailable
  }
}

// Usage
const [messages, setMessages] = useState<Message[]>(loadMessages);

useEffect(() => {
  saveMessages(messages);
}, [messages]);
```

### IndexedDB (Large Histories)

```typescript
import { openDB } from 'idb';

const db = await openDB('chat_db', 1, {
  upgrade(db) {
    db.createObjectStore('messages', { keyPath: 'id' });
    db.createObjectStore('conversations', { keyPath: 'id' });
  }
});

async function saveMessage(message: Message) {
  await db.put('messages', message);
}

async function loadConversation(conversationId: string): Promise<Message[]> {
  return db.getAllFromIndex('messages', 'conversationId', conversationId);
}
```

## Message Bubble Styles by Role

```typescript
const roleStyles = {
  user: {
    container: 'bg-blue-500 text-white rounded-2xl rounded-br-sm px-4 py-2',
    alignment: 'justify-end',
  },
  assistant: {
    container: 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm px-4 py-2',
    alignment: 'justify-start',
  },
  system: {
    container: 'bg-yellow-50 text-yellow-800 border border-yellow-200 rounded px-4 py-2',
    alignment: 'justify-center',
  }
};
```

## Complete Chat Component Example

```typescript
export function ChatUI() {
  const { messages, sendMessage, isLoading } = useChatStream();
  const { containerRef, scrollToBottom, handleScroll } = useAutoScroll();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      {/* Header */}
      <header className="p-4 border-b flex items-center justify-between">
        <h1 className="text-lg font-semibold">Chat</h1>
        <button onClick={() => {/* clear messages */}} className="text-sm text-gray-500">
          Clear
        </button>
      </header>

      {/* Message List */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
```
