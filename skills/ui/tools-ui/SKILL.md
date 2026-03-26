---
name: tools-ui
description: "React patterns to visualize AI tool call lifecycle: pending, running, approval, result."
allowed-tools: []
disable-model-invocation: false
---

# Tools UI Guide

## Overview

A tools UI visualizes the lifecycle of tool calls made by an AI agent. When an LLM with function-calling capability decides to use a tool (like search, calculation, or API call), the UI shows each step: what tool was called, what input was passed, what output came back, and whether it succeeded or failed.

**Key capabilities:**
- Display all available tools with descriptions
- Real-time visualization of tool call states
- Human-in-the-loop approval for sensitive operations
- JSON input/output display with formatting
- Error state display with helpful messages

## Tool Call Lifecycle

```
┌─────────────┐     ┌──────────────────┐     ┌───────────┐     ┌─────────────┐
│   PENDING   │────▶│ AWAITING_APPROVAL │────▶│  RUNNING  │────▶│   SUCCESS   │
└─────────────┘     └──────────────────┘     └───────────┘     └─────────────┘
                          │                       │                    │
                          │                       ▼                    │
                          │                 ┌───────────┐               │
                          └────────────────▶│   ERROR   │◀──────────────┘
                                            └───────────┘
```

### State Descriptions

| State | When | User Action | UI Indicator |
|-------|------|-------------|--------------|
| `pending` | LLM requested tool | None | Yellow badge, tool card appears |
| `awaiting_approval` | Human-in-the-loop enabled | Approve/Deny | Modal or inline buttons |
| `running` | Tool is executing | None | Spinner, animated border |
| `success` | Tool returned successfully | None | Green check, output displayed |
| `error` | Tool failed | Retry (optional) | Red X, error message |

## ToolCallCard Component

```typescript
interface ToolCall {
  id: string;
  name: string;
  description?: string;   // Human-readable description
  input: Record<string, unknown>;
  output?: unknown;
  status: 'pending' | 'awaiting_approval' | 'running' | 'success' | 'error';
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

interface ToolCallCardProps {
  toolCall: ToolCall;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
  onRetry?: (id: string) => void;
}

function ToolCallCard({ toolCall, onApprove, onDeny, onRetry }: ToolCallCardProps) {
  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    awaiting_approval: { icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    running: { icon: Loader, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300 animate-pulse' },
    success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
  };

  const config = statusConfig[toolCall.status];
  const StatusIcon = config.icon;

  return (
    <div className={`border rounded-lg p-4 ${config.bg} ${config.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${config.color} ${toolCall.status === 'running' ? 'animate-spin' : ''}`} />
          <span className="font-mono font-semibold">{toolCall.name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} border`}>
          {toolCall.status.replace('_', ' ')}
        </span>
      </div>

      {toolCall.description && (
        <p className="text-sm text-gray-600 mb-3">{toolCall.description}</p>
      )}

      {/* Timing */}
      {(toolCall.startedAt || toolCall.completedAt) && (
        <div className="text-xs text-gray-500 mb-3">
          {toolCall.startedAt && `Started: ${toolCall.startedAt.toLocaleTimeString()}`}
          {toolCall.completedAt && ` • Duration: ${toolCall.completedAt - (toolCall.startedAt ?? 0)}ms`}
        </div>
      )}

      {/* Input */}
      <details className="mb-3" open={toolCall.status === 'pending'}>
        <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-1">
          Input
        </summary>
        <JsonViewer data={toolCall.input} />
      </details>

      {/* Output */}
      {toolCall.output && (
        <details className="mb-3" open={toolCall.status === 'success'}>
          <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-1">
            Output
          </summary>
          <JsonViewer data={toolCall.output} />
        </details>
      )}

      {/* Error */}
      {toolCall.error && (
        <div className="mb-3 p-3 bg-red-100 border border-red-200 rounded text-red-700 text-sm">
          <strong>Error:</strong> {toolCall.error}
        </div>
      )}

      {/* Actions */}
      {toolCall.status === 'awaiting_approval' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onApprove?.(toolCall.id)}
            className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium"
          >
            Approve
          </button>
          <button
            onClick={() => onDeny?.(toolCall.id)}
            className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium"
          >
            Deny
          </button>
        </div>
      )}

      {toolCall.status === 'error' && onRetry && (
        <button
          onClick={() => onRetry(toolCall.id)}
          className="mt-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
        >
          Retry
        </button>
      )}
    </div>
  );
}
```

## Status Icons

```typescript
import { Clock, HelpCircle, Loader, CheckCircle, XCircle } from 'lucide-react';

// Alternative: simple emoji-based icons (no npm dependency needed)
const statusIcons = {
  pending: '⏳',
  awaiting_approval: '⚠️',
  running: '🔄',
  success: '✅',
  error: '❌'
};
```

## Human Approval UI

### Inline Approval Pattern

For non-blocking approvals where the tool can wait:

```typescript
function InlineApprovalCard({ toolCall, onApprove, onDeny }: ToolCallCardProps) {
  return (
    <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <p className="font-medium text-blue-900">
            Tool requires approval: {toolCall.name}
          </p>
          <p className="text-sm text-blue-700 mt-1 mb-3">
            This tool will execute an external action. Do you want to proceed?
          </p>

          <details className="mb-3">
            <summary className="text-sm text-blue-600 cursor-pointer">View input parameters</summary>
            <JsonViewer data={toolCall.input} />
          </details>

          <div className="flex gap-2">
            <button
              onClick={() => onApprove(toolCall.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Allow once
            </button>
            <button
              onClick={() => onDeny(toolCall.id)}
              className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Deny
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Modal Approval Pattern

For critical operations that need full attention:

```typescript
function ApprovalModal({ toolCall, onApprove, onDeny }: ToolCallCardProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
        <h2 className="text-xl font-bold mb-2">Tool Approval Required</h2>
        <p className="text-gray-600 mb-4">
          The AI wants to run: <code className="font-mono bg-gray-100 px-1 rounded">{toolCall.name}</code>
        </p>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Input Parameters</label>
          <JsonViewer data={toolCall.input} maxHeight="200px" />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onDeny}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Deny
          </button>
          <button
            onClick={onApprove}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Input/Output Display

### JSON Viewer Component

```typescript
function JsonViewer({ data, maxHeight = '300px' }: { data: unknown; maxHeight?: string }) {
  const formatted = JSON.stringify(data, null, 2);
  const isLong = formatted.split('\n').length > 20;

  return (
    <div className="relative">
      <pre
        className="p-3 bg-gray-900 text-gray-100 rounded text-xs font-mono overflow-auto"
        style={{ maxHeight }}
      >
        <code>{formatted}</code>
      </pre>
      {isLong && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
```

### Truncating Long Outputs

```typescript
function truncateOutput(output: unknown, maxLength = 500): string {
  const str = typeof output === 'string' ? output : JSON.stringify(output);
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '... (truncated)';
}
```

## Tool List Sidebar

```typescript
interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

function ToolSidebar({
  tools,
  activeToolId,
  onToolClick
}: {
  tools: Tool[];
  activeToolId: string | null;
  onToolClick: (name: string) => void;
}) {
  return (
    <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
      <h3 className="font-semibold text-gray-900 mb-3">Available Tools</h3>
      <div className="space-y-2">
        {tools.map(tool => (
          <button
            key={tool.name}
            onClick={() => onToolClick(tool.name)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              activeToolId === tool.name
                ? 'bg-blue-100 border border-blue-300'
                : 'bg-white border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-mono text-sm font-medium">{tool.name}</div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
              {tool.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Provider Tool Call Formats

### Claude (tool_use)

```typescript
// Claude response format for tool_use
interface ClaudeToolUse {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

// Parse Claude tool_use for display
function parseClaudeToolUse(toolUse: ClaudeToolUse): ToolCall {
  return {
    id: toolUse.id,
    name: toolUse.name,
    input: toolUse.input,
    status: 'pending',
    startedAt: new Date()
  };
}
```

### OpenAI (function_call / tool_calls)

```typescript
// OpenAI response format for function calling
interface OpenAIFunctionCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;  // JSON string
  };
}

// Parse OpenAI function_call for display
function parseOpenAIFunctionCall(fc: OpenAIFunctionCall): ToolCall {
  return {
    id: fc.id,
    name: fc.function.name,
    input: JSON.parse(fc.function.arguments),
    status: 'pending',
    startedAt: new Date()
  };
}
```

### Gemini (function_call)

```typescript
// Gemini response format for function calling
interface GeminiFunctionCall {
  name: string;
  args: Record<string, unknown>;
}

// Parse Gemini function call for display
function parseGeminiFunctionCall(fc: GeminiFunctionCall): ToolCall {
  return {
    id: crypto.randomUUID(),
    name: fc.name,
    input: fc.args,
    status: 'pending',
    startedAt: new Date()
  };
}
```

## Tool Call Provider Comparison

| Provider | Tool Call Feature | Tool Format | Human Approval |
|----------|------------------|-------------|----------------|
| Claude | Tool Use | `tool_use` blocks | Via `disable_parallel_tool_use: false` + UI |
| OpenAI | Function Calling | `function_call` or `tool_calls` | Via `confirmation_absolute` mode |
| Gemini | Function Calling | `function_call` | Via `safety_settings` |
| Vercel AI SDK | Tools | Provider-agnostic unified format | Via `dangerouslySkipRequiredChecks()` |

## Complete Tool Panel Example

```typescript
interface ToolPanelProps {
  toolCalls: ToolCall[];
  availableTools: Tool[];
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  onRetry: (id: string) => void;
}

export function ToolPanel({ toolCalls, availableTools, onApprove, onDeny, onRetry }: ToolPanelProps) {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <ToolSidebar
        tools={availableTools}
        activeToolId={toolCalls.find(t => t.status === 'running')?.name ?? null}
        onToolClick={(name) => console.log('Selected tool:', name)}
      />

      {/* Main content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          Tool Calls ({toolCalls.length})
        </h2>

        <div className="space-y-4">
          {toolCalls.map(tc => (
            <ToolCallCard
              key={tc.id}
              toolCall={tc}
              onApprove={onApprove}
              onDeny={onDeny}
              onRetry={onRetry}
            />
          ))}
        </div>

        {toolCalls.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No tool calls yet. Start a conversation to see tools in action.
          </div>
        )}
      </div>
    </div>
  );
}
```
