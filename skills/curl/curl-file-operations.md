---
id: curl-file-operations
stackId: curl
type: skill
name: >-
  File Upload & Download with cURL
description: >-
  Master file operations with cURL — multipart uploads, binary transfers,
  range requests for resume, progress bars, and large file handling for API
  integrations.
difficulty: intermediate
tags:
  - curl
  - file
  - upload
  - download
  - automation
  - monitoring
  - api
  - ci-cd
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the File Upload & Download with cURL skill?"
    answer: >-
      Master file operations with cURL — multipart uploads, binary transfers,
      range requests for resume, progress bars, and large file handling for
      API integrations. This skill provides a structured workflow for
      development tasks.
  - question: "What tools and setup does File Upload & Download with cURL require?"
    answer: >-
      Works with standard curl tooling (relevant CLI tools and frameworks). No
      special setup required beyond a working curl environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# File Upload & Download with cURL

## Overview
cURL handles every file transfer pattern: multipart form uploads, raw binary uploads, resumable downloads, and progress monitoring. Essential for API integrations that handle documents, images, and large data files.

## Why This Matters
- **API integration** — most APIs accept file uploads via multipart
- **Automation** — download artifacts, upload builds in CI/CD
- **Reliability** — resume interrupted transfers without starting over
- **Monitoring** — track progress for large file operations

## How It Works

### Step 1: Multipart File Upload
```bash
# Upload a file with form data
curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.pdf" \
  -F "description=Quarterly report" \
  -F "category=finance" \
  https://api.example.com/upload

# Upload multiple files
curl -sS -X POST \
  -F "files[]=@image1.jpg" \
  -F "files[]=@image2.jpg" \
  -F "files[]=@image3.jpg" \
  https://api.example.com/bulk-upload

# Upload with custom filename and MIME type
curl -sS -X POST \
  -F "avatar=@photo.jpg;filename=profile.jpg;type=image/jpeg" \
  https://api.example.com/users/123/avatar
```

### Step 2: Binary Upload
```bash
# Upload raw binary (no multipart wrapping)
curl -sS -X PUT \
  -H "Content-Type: application/octet-stream" \
  --data-binary @large-file.zip \
  https://storage.example.com/files/archive.zip

# Upload from stdin
cat generated_report.csv | curl -sS -X PUT \
  -H "Content-Type: text/csv" \
  --data-binary @- \
  https://api.example.com/reports/latest
```

### Step 3: Download Files
```bash
# Download to file
curl -sS -o report.pdf https://api.example.com/reports/latest

# Download with original filename
curl -sS -OJ https://api.example.com/download/12345

# Download with progress bar
curl -# -o large-file.zip https://cdn.example.com/files/archive.zip

# Resume interrupted download
curl -C - -o large-file.zip https://cdn.example.com/files/archive.zip
```

### Step 4: Large File Handling
```bash
# Download with speed limit (don't saturate bandwidth)
curl --limit-rate 10M -o backup.tar.gz https://storage.example.com/backup.tar.gz

# Upload with progress and retry
curl --retry 3 --retry-delay 5 \
  -# -X PUT \
  -H "Content-Type: application/gzip" \
  --data-binary @backup.tar.gz \
  https://storage.example.com/backups/latest.tar.gz

# Check file size before downloading
curl -sI https://cdn.example.com/files/archive.zip | grep -i content-length
```

## Best Practices
- Use `-F` for multipart uploads (most API-compatible)
- Use `--data-binary @file` for raw binary uploads (preserves file exactly)
- Use `-C -` for resumable downloads (auto-detects offset)
- Use `--retry 3` for unreliable networks
- Check Content-Length header before downloading large files
- Use `--limit-rate` to avoid saturating network bandwidth

## Common Mistakes
- Using `-d @file` instead of `--data-binary @file` (strips newlines)
- Missing Content-Type for binary uploads (server may reject)
- Not using -C - for large downloads (restarts from scratch on failure)
- Forgetting @ prefix for file references in -F and --data-binary
- No retry logic for network operations (one failure loses everything)
