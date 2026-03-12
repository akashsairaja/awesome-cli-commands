---
id: ffmpeg-batch-processing
stackId: ffmpeg
type: skill
name: Batch Media Processing Scripts
description: >-
  Build batch processing scripts with FFmpeg — directory traversal, format
  conversion, thumbnail generation, metadata extraction, and parallel processing
  for media libraries.
difficulty: intermediate
tags:
  - batch-processing
  - scripting
  - automation
  - thumbnails
  - parallel
  - media-library
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - FFmpeg installed
  - Bash shell (Linux/macOS/WSL)
faq:
  - question: How do I batch convert videos with FFmpeg?
    answer: >-
      Use a bash loop: for file in ./input/*.mp4; do ffmpeg -i "$file" [options]
      "./output/$(basename "$file")"; done. Add error handling with || echo
      "Failed: $file", use -y for automatic overwrite, and -loglevel error for
      cleaner output.
  - question: How do I speed up batch FFmpeg processing?
    answer: >-
      Three approaches: (1) Use -preset fast or veryfast instead of medium. (2)
      Process files in parallel with xargs -P or GNU parallel. (3) Use hardware
      encoding (NVENC, QSV) for 5-10x speed improvement at the cost of slightly
      larger files.
  - question: How do I generate thumbnails from videos with FFmpeg?
    answer: >-
      Use: ffmpeg -i video.mp4 -ss 5 -vframes 1 -vf 'scale=640:-1'
      thumbnail.jpg. The -ss flag seeks to the timestamp (5 seconds), -vframes 1
      extracts one frame, and scale resizes. For better thumbnails, seek to 10%
      of video duration.
relatedItems:
  - ffmpeg-web-optimization
  - ffmpeg-audio-processing
  - ffmpeg-media-processor
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Batch Media Processing Scripts

## Overview
Process entire media libraries with FFmpeg batch scripts — convert formats, generate thumbnails, extract metadata, normalize audio, and resize videos across hundreds or thousands of files.

## Why This Matters
- **Automation** — process media libraries without manual intervention
- **Consistency** — same settings applied uniformly across all files
- **Efficiency** — parallel processing for multi-core utilization
- **Workflow** — integrate with CI/CD and media management systems

## How It Works

### Step 1: Convert All Videos in a Directory
```bash
#!/bin/bash
# Convert all videos to web-ready MP4
INPUT_DIR="./raw"
OUTPUT_DIR="./processed"
mkdir -p "$OUTPUT_DIR"

for file in "$INPUT_DIR"/*.{mp4,avi,mov,mkv,wmv}; do
  [ -f "$file" ] || continue
  filename=$(basename "$file")
  name="${filename%.*}"

  echo "Processing: $filename"
  ffmpeg -i "$file" \
    -c:v libx264 -crf 23 -preset medium \
    -c:a aac -b:a 128k \
    -movflags +faststart \
    -y "$OUTPUT_DIR/${name}.mp4"
done
echo "Done! Processed $(ls "$OUTPUT_DIR"/*.mp4 | wc -l) files."
```

### Step 2: Generate Thumbnails
```bash
#!/bin/bash
# Extract thumbnail at 10% of video duration
for file in ./videos/*.mp4; do
  [ -f "$file" ] || continue
  name=$(basename "$file" .mp4)

  # Get duration and calculate 10% position
  duration=$(ffprobe -v error -show_entries format=duration \
    -of default=noprint_wrappers=1:nokey=1 "$file")
  timestamp=$(echo "$duration * 0.1" | bc)

  ffmpeg -i "$file" -ss "$timestamp" -vframes 1 \
    -vf "scale=640:-1" \
    -y "./thumbnails/${name}.jpg"
done
```

### Step 3: Parallel Processing
```bash
#!/bin/bash
# Process files in parallel (use GNU parallel or xargs)
find ./raw -name "*.mp4" | xargs -P 4 -I {} bash -c '
  file="{}"
  name=$(basename "$file" .mp4)
  ffmpeg -i "$file" \
    -c:v libx264 -crf 23 -preset fast \
    -c:a aac -b:a 128k \
    -movflags +faststart \
    -y "./processed/${name}.mp4" 2>/dev/null
  echo "Done: $name"
'
```

### Step 4: Extract Metadata Report
```bash
#!/bin/bash
# Generate CSV report of all media files
echo "filename,duration,resolution,codec,size_mb" > report.csv

for file in ./media/*.{mp4,mkv,avi}; do
  [ -f "$file" ] || continue
  name=$(basename "$file")
  duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$file")
  resolution=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$file")
  codec=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$file")
  size_mb=$(echo "scale=2; $(stat -f%z "$file" 2>/dev/null || stat --printf="%s" "$file") / 1048576" | bc)

  echo "$name,$duration,$resolution,$codec,$size_mb" >> report.csv
done
```

## Best Practices
- Use `-preset fast` or `-preset veryfast` for batch jobs (speed over compression)
- Process in parallel (`xargs -P` or GNU parallel) for multi-core machines
- Add `-y` flag to overwrite output files without prompting
- Use `-loglevel error` to reduce output noise in batch scripts
- Test script on 3-5 files before running on full library

## Common Mistakes
- No error handling (one failed file stops the entire batch)
- Using `-preset veryslow` for batch jobs (extremely slow for marginal gain)
- Not using parallel processing (wastes multi-core CPUs)
- Processing in place (overwriting originals without backup)
- Missing `mkdir -p` for output directories (script fails on first file)
