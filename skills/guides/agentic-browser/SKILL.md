---
name: agentic-browser
description: Guide for autonomous browser navigation with AI — plan, observe, decide loops and safety.
---

# Agentic Browser

Agentic browsing is autonomous web navigation where an AI model observes the browser state and decides what to do next — without a pre-scripted sequence of steps. Use this guide for goal-driven tasks where the path is unknown in advance.

For deterministic, scripted automation (known selectors, known flow), use /pocket-knife:agent-browser instead.

## The Core Loop

```
Goal
  │
  ▼
Plan          → decompose goal into sub-tasks
  │
  ▼
Navigate      → load URL or click element
  │
  ▼
Observe       → screenshot + DOM snapshot
  │
  ▼
Decide        → which action moves toward the goal?
  │
  ▼
Act           → click / type / scroll / extract
  │
  ▼
Evaluate      → is the goal satisfied? If yes → done. If no → loop.
```

Each iteration the model receives:
1. The current goal and sub-task
2. A screenshot (visual grounding) or accessibility tree (DOM analysis)
3. The action history so far
4. Available actions

## Visual Grounding

Visual grounding lets the model identify elements by what they look like, not by CSS selectors.

```python
import base64
from openai import OpenAI
from playwright.sync_api import Page

def observe(page: Page) -> str:
    screenshot = page.screenshot()
    b64 = base64.b64encode(screenshot).decode()
    return f"data:image/png;base64,{b64}"

def decide(client: OpenAI, goal: str, screenshot_b64: str, history: list) -> dict:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You control a browser. Return a JSON action."},
            {"role": "user", "content": [
                {"type": "text", "text": f"Goal: {goal}\nHistory: {history}\nWhat is the next action?"},
                {"type": "image_url", "image_url": {"url": screenshot_b64}}
            ]}
        ],
        response_format={"type": "json_object"}
    )
    return response.choices[0].message.content
```

Action schema returned by the model:

```json
{
  "action": "click",
  "description": "Click the blue Login button",
  "coordinate": [640, 420]
}
```

```json
{
  "action": "type",
  "selector": "input[name='email']",
  "text": "user@example.com"
}
```

```json
{
  "action": "navigate",
  "url": "https://example.com/dashboard"
}
```

```json
{
  "action": "done",
  "result": "Extracted product list successfully"
}
```

## DOM Analysis

When visual grounding is too coarse, use the accessibility tree for precise element identification.

```python
def get_accessibility_tree(page) -> str:
    snapshot = page.accessibility.snapshot()
    return format_tree(snapshot, indent=0)

def format_tree(node: dict, indent: int) -> str:
    if node is None:
        return ""
    line = "  " * indent + f"[{node.get('role','?')}] {node.get('name','')}".strip()
    children = "\n".join(format_tree(c, indent + 1) for c in node.get("children", []))
    return line + ("\n" + children if children else "")
```

Pass the formatted tree to the model alongside (or instead of) the screenshot. Useful for forms, menus, and tables that are hard to click precisely by coordinate.

## Multi-Step Task Execution

Decompose complex goals before the loop starts:

```python
def decompose(client, goal: str) -> list[str]:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": f"Break this web task into ordered sub-tasks (JSON array of strings):\n{goal}"
        }],
        response_format={"type": "json_object"}
    )
    return response.choices[0].message.content["steps"]
```

Execute each sub-task independently. This prevents context window overflow on long tasks and makes error recovery easier (resume from the failed step).

## Handling CAPTCHAs and Popups

### Cookie Consent Popups

At the start of every session, attempt to dismiss common consent dialogs:

```python
def dismiss_popups(page):
    candidates = [
        'button:has-text("Accept")',
        'button:has-text("Accept all")',
        'button:has-text("Agree")',
        '[aria-label="Close"]',
        '.cookie-banner button',
    ]
    for selector in candidates:
        try:
            btn = page.locator(selector).first
            if btn.is_visible(timeout=1000):
                btn.click()
                return
        except Exception:
            continue
```

### Modal Dialogs

```python
page.on("dialog", lambda dialog: dialog.dismiss())  # auto-dismiss JS alerts
```

### CAPTCHAs

Autonomous agents cannot solve visual CAPTCHAs reliably. Mitigation strategies:

1. Use authenticated sessions (see /pocket-knife:agent-browser for cookie management)
2. Rotate user agents and introduce human-like delays
3. Use services with CAPTCHA-free APIs instead of scraping
4. Fall back to human-in-the-loop: pause, alert user, resume

```python
def human_in_the_loop(page, message: str):
    print(f"[AGENT PAUSED] {message}")
    print(f"Please solve the CAPTCHA at: {page.url}")
    input("Press Enter when ready to continue...")
```

## Session Persistence

Persist the full browser context (cookies, localStorage, sessionStorage) between runs:

```python
# Save after completing authentication
context.storage_state(path="session.json")

# Restore in next run
context = browser.new_context(storage_state="session.json")
```

Check session validity before starting a task:

```python
def is_authenticated(page, indicator_selector: str) -> bool:
    try:
        page.wait_for_selector(indicator_selector, timeout=3000)
        return True
    except Exception:
        return False
```

## Goal Decomposition for Web Tasks

Use a structured prompt for goal decomposition:

```
You are a browser agent. The user wants to: [GOAL]

Break this into concrete sub-tasks. Each sub-task must be:
- Atomic (single page or single action group)
- Verifiable (you can confirm completion by observing the page)
- Ordered (earlier steps enable later steps)

Return JSON: {"steps": ["step 1", "step 2", ...]}
```

Examples of good decompositions:

**Goal**: "Find the cheapest flight from São Paulo to Lisbon next month"
1. Navigate to Google Flights
2. Set origin to GRU, destination to LIS
3. Set departure date to first day of next month, flexible ±3 days
4. Extract the 5 cheapest results including airline, price, duration

**Goal**: "Submit a support ticket on Acme Corp's help desk"
1. Navigate to support.acme.com
2. Log in with stored credentials
3. Click "New Ticket"
4. Fill in subject and description from provided text
5. Submit and confirm the ticket number

## Safety Guardrails

Agentic browsers can cause unintended side effects. Apply these constraints:

### Read-Only Mode (default)

By default, only allow navigation, scrolling, clicking non-destructive elements, and data extraction. Block form submission, purchases, and deletions unless explicitly enabled.

```python
DESTRUCTIVE_ACTIONS = {"submit_form", "delete", "purchase", "send_message"}

def execute_action(action: dict, allow_destructive: bool = False):
    if action["action"] in DESTRUCTIVE_ACTIONS and not allow_destructive:
        raise PermissionError(f"Destructive action blocked: {action['action']}")
    # proceed with execution
```

### Action Logging

```python
action_log = []

def log_action(action: dict, result: str):
    action_log.append({"action": action, "result": result, "timestamp": time.time()})
```

Always log every action for audit and debugging.

### Max Iterations

Prevent infinite loops:

```python
MAX_ITERATIONS = 20

for i in range(MAX_ITERATIONS):
    action = decide(client, goal, observe(page), history)
    if action["action"] == "done":
        break
    execute_action(action)
else:
    raise RuntimeError(f"Goal not reached within {MAX_ITERATIONS} iterations")
```

### URL Allowlist

```python
ALLOWED_DOMAINS = {"example.com", "api.example.com"}

def safe_navigate(page, url: str):
    from urllib.parse import urlparse
    domain = urlparse(url).netloc
    if domain not in ALLOWED_DOMAINS:
        raise PermissionError(f"Navigation to {domain} is not allowed")
    page.goto(url)
```
