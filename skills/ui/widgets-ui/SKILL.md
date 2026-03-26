---
name: widgets-ui
description: "Declarative JSON-based UI widget renderer for AI-generated dynamic interfaces."
allowed-tools: []
disable-model-invocation: false
---

# Widgets UI Guide

## Concept

A widget renderer allows an AI to generate dynamic UI components by returning JSON that describes what to display. Instead of returning plain text, the LLM returns a structured JSON object defining widgets (cards, tables, buttons, charts) that the renderer assembles into a user interface.

**Key benefits:**
- AI can generate rich, interactive UIs on the fly
- Consistent rendering across different LLM providers
- Type-safe widget definitions with validation
- Extensible widget registry for custom components

## Widget Schema

```typescript
interface WidgetDef {
  type: string;                              // Widget type identifier
  id?: string;                               // Optional unique ID
  props: Record<string, unknown>;            // Widget-specific properties
  children?: WidgetDef[];                   // Nested widgets (for containers)
  actions?: WidgetAction[];                 // Interactive elements
}

interface WidgetAction {
  id: string;
  label: string;
  action: 'submit' | 'navigate' | 'callback' | 'toggle';
  payload?: unknown;                        // Data passed when action triggers
}

interface RenderContext {
  onAction: (widgetId: string, actionId: string, payload?: unknown) => void;
  getData?: (dataKey: string) => unknown;   // Lazy data fetching
}
```

## Built-in Widget Types

| Type | Description | Props |
|------|-------------|-------|
| `card` | Container with title and content | `title?`, `content?`, `style?` |
| `button` | Interactive button | `label`, `variant?` (primary/secondary/danger), `disabled?` |
| `text` | Text content | `content`, `size?` (sm/md/lg), `color?` |
| `heading` | Section heading | `content`, `level?` (1-6) |
| `list` | Bulleted or numbered list | `items[]`, `ordered?` |
| `table` | Tabular data | `headers[]`, `rows[][]`, `caption?` |
| `form` | Input form container | `children[]`, `onSubmit` action |
| `input` | Text input field | `name`, `label?`, `placeholder?`, `type?` |
| `chart` | Basic chart display | `type?` (bar/line/pie), `data` |
| `image` | Image display | `src`, `alt?`, `width?`, `height?` |
| `divider` | Horizontal separator | `style?` |
| `spacer` | Empty vertical space | `height?` |

## WidgetRenderer Component

```typescript
import React from 'react';

// Widget registry - maps type strings to React components
const widgetRegistry: Record<string, React.ComponentType<WidgetProps>> = {
  card: CardWidget,
  button: ButtonWidget,
  text: TextWidget,
  heading: HeadingWidget,
  list: ListWidget,
  table: TableWidget,
  form: FormWidget,
  input: InputWidget,
  chart: ChartWidget,
  image: ImageWidget,
  divider: DividerWidget,
  spacer: SpacerWidget,
};

interface WidgetProps {
  widget: WidgetDef;
  context: RenderContext;
}

export function WidgetRenderer({ widgets, context }: { widgets: WidgetDef[]; context: RenderContext }) {
  return (
    <div className="flex flex-col gap-4">
      {widgets.map((widget, index) => (
        <Widget key={widget.id ?? index} widget={widget} context={context} />
      ))}
    </div>
  );
}

function Widget({ widget, context }: WidgetProps) {
  const Component = widgetRegistry[widget.type];

  if (!Component) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
        Unknown widget type: <code>{widget.type}</code>
      </div>
    );
  }

  return <Component widget={widget} context={context} />;
}
```

## Built-in Widget Implementations

### Card Widget

```typescript
function CardWidget({ widget }: WidgetProps) {
  const { title, content, style = 'default' } = widget.props as {
    title?: string;
    content?: string;
    style?: 'default' | 'bordered' | 'elevated';
  };

  const styleClasses = {
    default: 'bg-white border border-gray-200',
    bordered: 'border-2 border-gray-300',
    elevated: 'bg-white shadow-lg'
  };

  return (
    <div className={`rounded-lg p-4 ${styleClasses[style]}`}>
      {title && <h3 className="font-semibold text-lg mb-2">{title}</h3>}
      {content && <p className="text-gray-700">{content}</p>}
      {widget.children && (
        <div className="mt-4 flex flex-col gap-2">
          {widget.children.map((child, i) => (
            <Widget key={i} widget={child} context={widget.props as RenderContext} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Table Widget

```typescript
function TableWidget({ widget }: WidgetProps) {
  const { headers = [], rows = [], caption } = widget.props as {
    headers: string[];
    rows: string[][];
    caption?: string;
  };

  if (!headers.length || !rows.length) {
    return <div className="text-gray-500 text-sm">No data to display</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {caption && <caption className="text-sm text-gray-500 mb-2 text-left">{caption}</caption>}
        <thead>
          <tr className="bg-gray-100">
            {headers.map((h, i) => (
              <th key={i} className="border border-gray-300 px-3 py-2 text-left font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-gray-300 px-3 py-2 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Form Widget

```typescript
function FormWidget({ widget, context }: WidgetProps) {
  const [values, setValues] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitAction = widget.actions?.find(a => a.action === 'submit');
    if (submitAction) {
      context.onAction(widget.id!, submitAction.id, values);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
      {widget.children?.map((child, i) => (
        <Widget key={i} widget={child} context={{ ...context, values, setValues }} />
      ))}
      {widget.actions?.find(a => a.action === 'submit') && (
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          {widget.actions.find(a => a.action === 'submit')?.label ?? 'Submit'}
        </button>
      )}
    </form>
  );
}
```

### Button Widget

```typescript
function ButtonWidget({ widget, context }: WidgetProps) {
  const { label, variant = 'primary', disabled = false } = widget.props as {
    label: string;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const handleClick = () => {
    const clickAction = widget.actions?.[0];
    if (clickAction && !disabled) {
      context.onAction(widget.id!, clickAction.id, clickAction.payload);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 ${variantClasses[variant]}`}
    >
      {label}
    </button>
  );
}
```

### Chart Widget (Basic)

```typescript
function ChartWidget({ widget }: WidgetProps) {
  const { type = 'bar', data = [] } = widget.props as {
    type?: 'bar' | 'line' | 'pie';
    data: { label: string; value: number }[];
  };

  // Simple bar chart using div widths
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-end gap-2 h-40">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div
              className="w-full bg-blue-500 rounded-t"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            />
            <span className="text-xs text-gray-600 mt-1 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Safety Considerations

### Input Sanitization

```typescript
// NEVER render HTML content directly
// ALWAYS treat LLM output as untrusted

function sanitizeString(str: unknown): string {
  if (typeof str !== 'string') return '';
  // Remove potential XSS vectors
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// For text content that should allow markdown:
function SafeText({ content }: { content: string }) {
  return <span>{sanitizeString(content)}</span>;
}
```

### Type Whitelisting

```typescript
const ALLOWED_WIDGET_TYPES = new Set([
  'card', 'button', 'text', 'heading', 'list', 'table',
  'form', 'input', 'chart', 'image', 'divider', 'spacer'
]);

function Widget({ widget, context }: WidgetProps) {
  if (!ALLOWED_WIDGET_TYPES.has(widget.type)) {
    return (
      <div className="text-red-500 text-sm">
        Blocked unknown widget type: {widget.type}
      </div>
    );
  }
  // ... render widget
}
```

### Props Validation

```typescript
function validateWidgetProps(type: string, props: Record<string, unknown>): boolean {
  const schemas: Record<string, (p: Record<string, unknown>) => boolean> = {
    button: (p) => typeof p.label === 'string',
    table: (p) => Array.isArray(p.headers) && Array.isArray(p.rows),
    image: (p) => typeof p.src === 'string',
    input: (p) => typeof p.name === 'string',
    // ... add validation for each type
  };

  const validator = schemas[type];
  if (!validator) return true; // Unknown types are rejected elsewhere
  return validator(props);
}
```

## Extending the Registry

### Adding Custom Widgets

```typescript
import { GaugeChart } from './components/GaugeChart';

const extendedRegistry = {
  ...widgetRegistry,
  gauge: GaugeChartWidget,  // Custom gauge component
};

function GaugeChartWidget({ widget }: WidgetProps) {
  const { value, min = 0, max = 100, label } = widget.props as {
    value: number;
    min?: number;
    max?: number;
    label?: string;
  };
  return <GaugeChart value={value} min={min} max={max} label={label} />;
}

// Usage
<WidgetRenderer widgets={llmResponse.widgets} context={context} registry={extendedRegistry} />
```

## LLM Prompt Template

To get good JSON widget output from an LLM:

```markdown
You are a UI generator. Return your response as a JSON array of widget definitions.

Rules:
- Use only these widget types: card, button, text, heading, list, table, form, input, chart, image, divider, spacer
- Each widget MUST have: type, props
- Each widget MAY have: id, children, actions
- Props must match the widget type (see docs below)
- NEVER use HTML, markdown code blocks, or backticks in widget content
- Text content should be plain strings, not formatted

Widget schemas:
- card: { title?: string, content?: string, style?: "default" | "bordered" | "elevated" }
- button: { label: string, variant?: "primary" | "secondary" | "danger" }
- text: { content: string, size?: "sm" | "md" | "lg" }
- heading: { content: string, level?: 1 | 2 | 3 }
- list: { items: string[], ordered?: boolean }
- table: { headers: string[], rows: string[][] }
- chart: { type?: "bar" | "line" | "pie", data: { label: string, value: number }[] }
```

## Example Flow

**User asks:** "Show me a dashboard of my recent tasks"

**LLM returns JSON:**
```json
[
  {
    "type": "card",
    "id": "summary-card",
    "props": { "title": "Task Summary", "style": "elevated" },
    "children": [
      { "type": "text", "props": { "content": "You have 12 tasks pending, 5 completed this week." } }
    ]
  },
  {
    "type": "table",
    "id": "tasks-table",
    "props": {
      "headers": ["Task", "Status", "Due"],
      "rows": [
        ["Review PR #123", "In Progress", "Today"],
        ["Update docs", "Pending", "Tomorrow"],
        ["Team meeting", "Completed", "Yesterday"]
      ]
    }
  },
  {
    "type": "button",
    "id": "new-task-btn",
    "props": { "label": "Add New Task", "variant": "primary" },
    "actions": [{ "id": "create", "label": "Add", "action": "navigate", "payload": "/tasks/new" }]
  }
]
```

**Renderer produces:**

```
┌─────────────────────────────────────────┐
│ Task Summary                            │
│ You have 12 tasks pending, 5 completed  │
│ this week.                              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Task          │ Status      │ Due       │
├─────────────────────────────────────────┤
│ Review PR #123│ In Progress │ Today     │
│ Update docs   │ Pending     │ Tomorrow  │
│ Team meeting  │ Completed   │ Yesterday │
└─────────────────────────────────────────┘

[ Add New Task ]
```

## Complete Renderer Example

```typescript
export function DynamicUI({ jsonOutput, onAction }: { jsonOutput: string; onAction: ActionHandler }) {
  let widgets: WidgetDef[];

  try {
    widgets = JSON.parse(jsonOutput);
    if (!Array.isArray(widgets)) widgets = [widgets];
  } catch {
    return <div className="text-red-500">Invalid widget JSON</div>;
  }

  const context: RenderContext = {
    onAction: (widgetId, actionId, payload) => {
      onAction({ widgetId, actionId, payload });
    }
  };

  return (
    <div className="p-4">
      <WidgetRenderer widgets={widgets} context={context} />
    </div>
  );
}
```
