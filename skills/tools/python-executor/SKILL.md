---
name: python-executor
description: "Run Python code for data analysis, CSV processing, web scraping, file manipulation"
allowed-tools: Bash(python3 *)
disable-model-invocation: true
---

# Python Executor

Write and run Python scripts to perform tasks that require computation, data transformation, file processing, or API calls. Claude writes the script and executes it with `python3`.

## When to Use Python vs Bash

| Task | Use |
|---|---|
| CSV/JSON/XML processing | Python |
| Arithmetic or statistics | Python |
| Image processing | Python (Pillow) |
| HTTP requests + parsing JSON | Python (requests) |
| Text manipulation with regex | Python |
| File rename / copy / move (simple) | Bash |
| Running other CLI tools | Bash |
| Grepping or searching files | Bash |
| Git operations | Bash |

Choose Python when the logic is non-trivial, data structures are involved, or you need libraries.

## Running a Script

```bash
python3 -c "print('hello')"
```

```bash
python3 /path/to/script.py
```

Pass arguments:

```bash
python3 script.py --input data.csv --output result.json
```

## CSV Processing

### Read and Filter

```python
import csv
import sys

input_path = sys.argv[1]
min_value = float(sys.argv[2])

with open(input_path, newline="") as f:
    reader = csv.DictReader(f)
    rows = [row for row in reader if float(row["value"]) >= min_value]

writer = csv.DictWriter(sys.stdout, fieldnames=rows[0].keys())
writer.writeheader()
writer.writerows(rows)
```

```bash
python3 filter.py data.csv 100
```

### Aggregate with pandas

```python
import pandas as pd

df = pd.read_csv("sales.csv")
summary = df.groupby("region")["revenue"].agg(["sum", "mean", "count"])
print(summary.to_string())
```

### Convert CSV to JSON

```python
import csv, json, sys

with open(sys.argv[1]) as f:
    data = list(csv.DictReader(f))

print(json.dumps(data, indent=2, ensure_ascii=False))
```

## JSON Manipulation

### Pretty Print and Filter

```python
import json, sys

data = json.load(sys.stdin)

# Filter array elements
results = [item for item in data if item.get("status") == "active"]
print(json.dumps(results, indent=2))
```

```bash
cat data.json | python3 filter.py
```

### Merge JSON Files

```python
import json, sys, glob
from pathlib import Path

output = []
for path in glob.glob(sys.argv[1]):
    with open(path) as f:
        content = json.load(f)
        if isinstance(content, list):
            output.extend(content)
        else:
            output.append(content)

print(json.dumps(output, indent=2))
```

```bash
python3 merge.py "data/*.json"
```

## HTTP Requests

### Simple GET

```python
import requests, json, sys

url = sys.argv[1]
response = requests.get(url, timeout=10)
response.raise_for_status()
print(json.dumps(response.json(), indent=2))
```

```bash
python3 get.py https://api.example.com/items
```

### POST with Auth

```python
import requests, json, os, sys

url = sys.argv[1]
payload = json.loads(sys.argv[2])

headers = {
    "Authorization": f"Bearer {os.environ['API_TOKEN']}",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers, timeout=15)
response.raise_for_status()
print(json.dumps(response.json(), indent=2))
```

```bash
API_TOKEN=mytoken python3 post.py https://api.example.com/items '{"name":"test"}'
```

### Parallel Requests

```python
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import json, sys

urls = sys.stdin.read().splitlines()

def fetch(url):
    try:
        r = requests.get(url, timeout=10)
        return {"url": url, "status": r.status_code, "size": len(r.content)}
    except Exception as e:
        return {"url": url, "error": str(e)}

with ThreadPoolExecutor(max_workers=10) as pool:
    futures = {pool.submit(fetch, url): url for url in urls}
    results = [f.result() for f in as_completed(futures)]

print(json.dumps(results, indent=2))
```

## Image Processing with Pillow

### Install

```bash
python3 -m pip install Pillow --quiet
```

### Resize Images

```python
from PIL import Image
import sys, os

input_path = sys.argv[1]
width = int(sys.argv[2])

img = Image.open(input_path)
ratio = width / img.width
height = int(img.height * ratio)
resized = img.resize((width, height), Image.LANCZOS)

base, ext = os.path.splitext(input_path)
output = f"{base}_resized{ext}"
resized.save(output, quality=90, optimize=True)
print(f"Saved: {output} ({width}x{height})")
```

### Batch Convert to WebP

```python
from PIL import Image
import glob, sys

for path in glob.glob(sys.argv[1]):
    img = Image.open(path)
    out = path.rsplit(".", 1)[0] + ".webp"
    img.save(out, "WEBP", quality=85)
    print(f"Converted: {out}")
```

### Extract EXIF Data

```python
from PIL import Image
from PIL.ExifTags import TAGS
import json, sys

img = Image.open(sys.argv[1])
exif_raw = img._getexif()
if not exif_raw:
    print("No EXIF data")
    sys.exit(0)

exif = {TAGS.get(k, k): str(v) for k, v in exif_raw.items()}
print(json.dumps(exif, indent=2))
```

## Virtual Environment Setup

When you need packages not available system-wide:

```bash
python3 -m venv /tmp/venv && \
/tmp/venv/bin/pip install pandas requests Pillow --quiet && \
/tmp/venv/bin/python3 script.py
```

Or install into user site-packages for persistence across calls:

```bash
python3 -m pip install --user pandas requests Pillow --quiet
```

## pip Install Safety

Rules:
- Only install from PyPI (no `--extra-index-url` from unknown sources)
- Pin versions for reproducibility in production: `pip install pandas==2.2.0`
- Use `--quiet` to suppress noisy output
- Audit package names carefully — typosquatting is common (`reqeusts` vs `requests`)

Preferred safe packages for common tasks:

| Task | Package |
|---|---|
| Data analysis | `pandas`, `numpy` |
| HTTP | `requests`, `httpx` |
| Image processing | `Pillow` |
| HTML parsing | `beautifulsoup4`, `lxml` |
| PDF reading | `pypdf` |
| Excel | `openpyxl` |
| Date/time | `python-dateutil` |
| Progress bars | `tqdm` |

## Output Handling

### Structured Output (machine-readable)

Print JSON to stdout for downstream parsing:

```python
import json
result = {"rows_processed": 1200, "errors": 3, "output": "result.csv"}
print(json.dumps(result))
```

### Human-Readable Output

Use `print()` with clear labels:

```python
print(f"Processed: {count:,} rows")
print(f"Errors:    {errors}")
print(f"Output:    {output_path}")
```

### Write to File

```python
import sys

output_path = sys.argv[-1]
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Written to {output_path}")
```

## Error Handling Pattern

```python
import sys

def main():
    try:
        run()
    except FileNotFoundError as e:
        print(f"Error: file not found — {e}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("Interrupted", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
```

Always exit with a non-zero code on failure so calling scripts can detect errors.
