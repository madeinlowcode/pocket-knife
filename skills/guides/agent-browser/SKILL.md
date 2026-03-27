---
name: agent-browser
description: Guide for browser automation with AI agents using Playwright — navigation, scraping, forms.
---

# Agent Browser

Automate browser interactions programmatically with Playwright. Use this guide for scripted, deterministic automation tasks: form filling, scraping, screenshot capture, and test flows.

For autonomous, goal-driven browsing with adaptive decision-making, see /pocket-knife:agentic-browser.
For gathering data from the web, combine this guide with /pocket-knife:web-search.

## Setup

```bash
npm install playwright
npx playwright install chromium   # or firefox, webkit
```

Python:

```bash
pip install playwright
python -m playwright install chromium
```

## Page Navigation

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    page.goto("https://example.com")
    page.go_back()
    page.go_forward()
    page.reload()

    browser.close()
```

Set a custom viewport and user agent:

```python
page = browser.new_page(
    viewport={"width": 1280, "height": 800},
    user_agent="Mozilla/5.0 (compatible; MyBot/1.0)"
)
```

## Element Selection

### CSS Selectors

```python
# By tag + class
page.locator("button.submit-btn").click()

# By attribute
page.locator('input[name="email"]').fill("user@example.com")

# By text content
page.get_by_text("Sign in").click()
page.get_by_role("button", name="Submit").click()
page.get_by_label("Password").fill("secret")
page.get_by_placeholder("Search…").fill("query")
```

### XPath

```python
page.locator('xpath=//div[@data-testid="card"][1]').click()
```

Prefer `get_by_role`, `get_by_label`, `get_by_text` over XPath — they are more resilient to DOM changes.

### Chaining Locators

```python
form = page.locator("form#login")
form.get_by_label("Username").fill("alice")
form.get_by_label("Password").fill("hunter2")
```

## Form Filling

```python
# Text inputs
page.get_by_label("First name").fill("Alice")

# Select dropdowns
page.get_by_label("Country").select_option("BR")

# Checkboxes
page.get_by_label("I agree").check()

# File upload
page.get_by_label("Upload CSV").set_input_files("/path/to/file.csv")

# Submit
page.get_by_role("button", name="Submit").click()

# Wait for navigation after submit
page.wait_for_url("**/dashboard")
```

## Screenshot Capture

```python
# Full page
page.screenshot(path="full.png", full_page=True)

# Specific element
page.locator(".hero-section").screenshot(path="hero.png")

# With clip
page.screenshot(path="clip.png", clip={"x": 0, "y": 0, "width": 800, "height": 600})
```

## Waiting Strategies

Never use fixed `time.sleep()`. Use Playwright's built-in waits.

```python
# Wait for element to appear
page.wait_for_selector(".results-list")

# Wait for element to be visible
page.locator(".spinner").wait_for(state="hidden")

# Wait for network idle (no requests for 500ms)
page.wait_for_load_state("networkidle")

# Wait for a specific URL
page.wait_for_url("**/success")

# Wait for a response matching a URL pattern
with page.expect_response("**/api/data") as resp:
    page.get_by_role("button", name="Load").click()
data = resp.value.json()
```

## Handling Single-Page Applications (SPAs)

SPAs update the DOM without full navigation events. Adjust your approach:

```python
# After a client-side navigation, wait for a known element
page.get_by_role("link", name="Dashboard").click()
page.wait_for_selector('[data-page="dashboard"]')  # SPA marker

# Intercept API responses to know when data has loaded
with page.expect_response(lambda r: "/api/items" in r.url) as resp_info:
    page.get_by_role("button", name="Load Items").click()
items = resp_info.value.json()
```

## Cookie and Auth Management

### Save and Reuse Session

```python
# Save
context = browser.new_context()
page = context.new_page()
page.goto("https://example.com/login")
# ... perform login ...
context.storage_state(path="auth.json")

# Reuse
context = browser.new_context(storage_state="auth.json")
page = context.new_page()
page.goto("https://example.com/dashboard")  # already logged in
```

### Set Cookies Manually

```python
context.add_cookies([{
    "name": "session",
    "value": "abc123",
    "domain": "example.com",
    "path": "/"
}])
```

### HTTP Auth

```python
context = browser.new_context(http_credentials={"username": "user", "password": "pass"})
```

## Scraping Patterns

### Extract a List of Items

```python
items = page.locator(".product-card").all()
data = []
for item in items:
    data.append({
        "title": item.locator(".title").inner_text(),
        "price": item.locator(".price").inner_text(),
        "link": item.locator("a").get_attribute("href"),
    })
```

### Paginate

```python
results = []
while True:
    results.extend(scrape_current_page(page))
    next_btn = page.locator('a[rel="next"]')
    if not next_btn.is_visible():
        break
    next_btn.click()
    page.wait_for_load_state("networkidle")
```

### Intercept Network Requests

```python
def handle_response(response):
    if "/api/products" in response.url:
        print(response.json())

page.on("response", handle_response)
page.goto("https://example.com/shop")
```

## Error Recovery

```python
from playwright.sync_api import TimeoutError as PlaywrightTimeout

def safe_click(page, selector: str, retries: int = 3):
    for attempt in range(retries):
        try:
            page.locator(selector).click(timeout=5000)
            return
        except PlaywrightTimeout:
            if attempt == retries - 1:
                raise
            page.reload()
```

Common issues and fixes:

| Problem | Fix |
|---|---|
| Element not found | Increase timeout; wait for network idle first |
| Stale element | Re-query after navigation or DOM mutation |
| CORS / CSP blocking | Use `route` to intercept and modify headers |
| Modal blocking click | Dismiss modal before interacting with page |
| Captcha | Use a logged-in session (see Cookie section) or rotate user agents |

## Parallel Execution

```python
from playwright.sync_api import sync_playwright
from concurrent.futures import ThreadPoolExecutor

def scrape_url(url: str) -> dict:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url)
        result = {"url": url, "title": page.title()}
        browser.close()
        return result

urls = ["https://example.com/1", "https://example.com/2"]
with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(scrape_url, urls))
```
