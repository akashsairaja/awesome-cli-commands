---
id: xh-download-progress
stackId: xh
type: skill
name: >-
  File Downloads & Progress with xh
description: >-
  Download files with xh — progress bars, output control, authenticated
  downloads, large file handling, and integrating downloads into automation
  scripts.
difficulty: beginner
tags:
  - xh
  - file
  - downloads
  - progress
  - automation
  - api
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the File Downloads & Progress with xh skill?"
    answer: >-
      Download files with xh — progress bars, output control, authenticated
      downloads, large file handling, and integrating downloads into
      automation scripts. This skill provides a structured workflow for
      development tasks.
  - question: "What tools and setup does File Downloads & Progress with xh require?"
    answer: >-
      Requires pip/poetry installed. Works with xh projects. No additional
      configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# File Downloads & Progress with xh

## Overview
xh provides a simple download experience with progress bars, automatic filename detection, and output control. Use it for downloading API exports, artifacts, and large files from the command line.

## Why This Matters
- **Progress tracking** — see download progress for large files
- **Automation** — download files in scripts with error handling
- **Authentication** — download protected resources with auth headers
- **Simplicity** — cleaner syntax than cURL for downloads

## How It Works

### Step 1: Basic Downloads
```bash
# Download with auto-detected filename
xh --download https://cdn.example.com/report.pdf

# Download to specific file
xh --download --output=report.pdf https://cdn.example.com/data

# Download to current directory
xh --download https://releases.example.com/v1.2.3/app.tar.gz

# Download silently (no progress bar)
xh --download --quiet https://cdn.example.com/data.csv
```

### Step 2: Authenticated Downloads
```bash
# Bearer token download
xh --download -A bearer -a "$TOKEN" \
  https://api.example.com/exports/latest.csv

# Basic auth download
xh --download -a user:password \
  https://private.example.com/artifact.zip

# API key download
xh --download https://api.example.com/data \
  X-API-Key:"$API_KEY"
```

### Step 3: Script Integration
```bash
#!/bin/bash
set -euo pipefail

# Download with error handling
if xh --check-status --download --output=data.json \
  https://api.example.com/export 2>/dev/null; then
  echo "Download successful: data.json"
  wc -c data.json
else
  echo "Download failed"
  exit 1
fi

# Download multiple files
urls=(
  "https://cdn.example.com/file1.csv"
  "https://cdn.example.com/file2.csv"
  "https://cdn.example.com/file3.csv"
)

for url in "${urls[@]}"; do
  filename=$(basename "$url")
  xh --download --output="$filename" --check-status "$url"
  echo "Downloaded: $filename"
done
```

### Step 4: Conditional Downloads
```bash
# Download only if file doesn't exist
[ -f report.pdf ] || xh --download --output=report.pdf \
  https://api.example.com/reports/latest

# Download if remote is newer (If-Modified-Since)
xh --download --output=data.json \
  https://api.example.com/data \
  If-Modified-Since:"Mon, 01 Jan 2024 00:00:00 GMT"

# Check content before downloading
size=$(xh --print=h HEAD https://cdn.example.com/large.zip | \
  grep -i content-length | awk '{print $2}' | tr -d '\r')
echo "File size: $size bytes"
```

## Best Practices
- Use --download flag for binary files (don't print to terminal)
- Use --output to control the filename
- Use --check-status in scripts for error handling
- Use HEAD request to check size before downloading
- Use --quiet for scripted downloads (cleaner output)

## Common Mistakes
- Not using --download for binary files (garbage in terminal)
- Missing --check-status (no error on 404)
- Not checking disk space before large downloads
- Downloading without --output (server-suggested name may conflict)
- No error handling in download scripts (partial files on failure)
