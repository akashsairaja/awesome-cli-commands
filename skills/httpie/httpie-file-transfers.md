---
id: httpie-file-transfers
stackId: httpie
type: skill
name: File Uploads & Downloads with HTTPie
description: >-
  Transfer files with HTTPie — multipart form uploads, binary streaming, file
  downloads with progress, and handling large file operations for API
  integrations.
difficulty: intermediate
tags:
  - file-upload
  - file-download
  - multipart
  - streaming
  - binary
  - progress
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - HTTPie installed
faq:
  - question: How do I upload a file with HTTPie?
    answer: >-
      Use -f flag with @ prefix: http -f POST url file@document.pdf. The -f
      switches to multipart/form-data mode. Add form fields alongside: http -f
      POST url file@doc.pdf title='My Doc'. Without -f, HTTPie sends JSON, not
      multipart.
  - question: How do I download files with HTTPie?
    answer: >-
      Use --download: http --download url. HTTPie shows a progress bar and saves
      with the server-suggested filename. Use --output=name.ext to specify the
      filename. For authenticated downloads: http --download -A bearer -a $TOKEN
      url.
  - question: How do I upload JSON from a file with HTTPie?
    answer: >-
      Use input redirection: http POST url < payload.json. HTTPie reads the
      file, sets Content-Type: application/json, and sends it as the request
      body. This is different from -f file@ which does multipart form upload.
relatedItems:
  - httpie-json-api-testing
  - httpie-auth-methods
  - httpie-api-expert
version: 1.0.0
lastUpdated: '2026-03-12'
---

# File Uploads & Downloads with HTTPie

## Overview
HTTPie handles file uploads and downloads with intuitive syntax — form uploads with @, streaming from stdin, and downloads with progress bars.

## Why This Matters
- **API integration** — upload documents, images, and data files
- **Automation** — batch file operations in scripts
- **Large files** — download with progress and resume
- **Flexibility** — multiple upload formats for different API requirements

## How It Works

### Step 1: Form File Upload
```bash
# Single file upload
http -f POST https://api.example.com/upload file@document.pdf

# File with additional form fields
http -f POST https://api.example.com/upload \
  file@photo.jpg \
  description="Profile photo" \
  category="avatar"

# Multiple files
http -f POST https://api.example.com/upload \
  files@image1.jpg \
  files@image2.jpg

# Specify content type for upload
http -f POST https://api.example.com/upload \
  file@data.csv;type=text/csv
```

### Step 2: Stdin Upload
```bash
# Pipe JSON from file
http POST https://api.example.com/data < payload.json

# Pipe from command
echo '{"name":"test"}' | http POST https://api.example.com/data

# Pipe binary data
cat image.png | http PUT https://api.example.com/images/1 \
  Content-Type:image/png
```

### Step 3: File Downloads
```bash
# Download with progress bar
http --download https://cdn.example.com/report.pdf

# Download to specific file
http --download --output=report.pdf https://cdn.example.com/data

# Download with auth
http --download -A bearer -a $TOKEN \
  https://api.example.com/exports/latest.csv

# Quiet download (no progress)
http --download --output=data.zip \
  https://cdn.example.com/data.zip --quiet
```

### Step 4: Streaming Responses
```bash
# Stream large response to file
http --download https://api.example.com/large-export

# Stream and pipe through processing
http --body https://api.example.com/data.ndjson | \
  while IFS= read -r line; do
    echo "$line" | jq '.id'
  done
```

## Best Practices
- Use -f flag for form uploads (multipart/form-data)
- Use < for JSON body from file (application/json)
- Use --download for binary files (shows progress)
- Specify content type for non-standard file uploads
- Use --output to control download filename

## Common Mistakes
- Forgetting -f flag for file uploads (sends as JSON instead)
- Using @ without -f (interpreted as JSON, not file upload)
- Not specifying Content-Type for binary stdin uploads
- Missing --download flag for large responses (buffers in memory)
- Not using --output for downloads (uses server-suggested name)
