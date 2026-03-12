---
id: ffmpeg-script-safety-rules
stackId: ffmpeg
type: rule
name: FFmpeg Script Safety Rules
description: >-
  Safety standards for FFmpeg scripts — input validation, output protection,
  error handling, disk space checks, and testing patterns to prevent data loss
  in media processing pipelines.
difficulty: beginner
globs:
  - '**/*.sh'
  - '**/*.bash'
  - '**/Makefile'
tags:
  - safety
  - scripts
  - error-handling
  - validation
  - batch-processing
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: How do I prevent FFmpeg from overwriting original files?
    answer: >-
      Always write output to a separate directory (mkdir -p ./processed/). Never
      use -y flag without directory separation. In batch scripts, validate that
      input and output paths are different. Keep originals until you verify all
      outputs are correct.
  - question: What should every FFmpeg batch script include?
    answer: >-
      Input validation (file exists, is valid media), output protection
      (separate directory, overwrite confirmation), error handling (check exit
      codes, clean up partial files), disk space check, and sample testing
      (process 10 seconds or 3 files first). Use set -euo pipefail in bash.
relatedItems:
  - ffmpeg-encoding-standards
  - ffmpeg-filter-naming-rules
  - ffmpeg-batch-processing
version: 1.0.0
lastUpdated: '2026-03-11'
---

# FFmpeg Script Safety Rules

## Rule
All FFmpeg scripts MUST validate inputs, protect against output overwrite, handle errors, check disk space, and test on samples before full processing.

## Input Validation
```bash
# Good — validate input exists and is a media file
if [ ! -f "$input" ]; then
  echo "Error: Input file not found: $input"
  exit 1
fi

# Verify it's a valid media file
if ! ffprobe -v error "$input" 2>/dev/null; then
  echo "Error: Not a valid media file: $input"
  exit 1
fi
```

## Output Protection
```bash
# Good — check before overwriting
if [ -f "$output" ]; then
  echo "Warning: Output exists: $output"
  read -p "Overwrite? (y/N) " confirm
  [ "$confirm" = "y" ] || exit 0
fi

# In batch scripts, use a separate output directory
# NEVER process files in place
OUTPUT_DIR="./processed"
mkdir -p "$OUTPUT_DIR"
```

## Error Handling
```bash
# Good — check FFmpeg exit code
ffmpeg -i "$input" [options] "$output" 2>>"$LOG_FILE"
if [ $? -ne 0 ]; then
  echo "Error: Failed to process $input" >> "$LOG_FILE"
  rm -f "$output"  # Clean up partial output
  continue  # In loops, skip to next file
fi
```

## Disk Space Check
```bash
# Check available space before batch processing
input_size=$(du -sm "$INPUT_DIR" | cut -f1)
available=$(df -m "$OUTPUT_DIR" | awk 'NR==2{print $4}')

if [ "$available" -lt "$((input_size * 2))" ]; then
  echo "Error: Insufficient disk space. Need ${input_size}MB+, have ${available}MB"
  exit 1
fi
```

## Test Before Full Run
```bash
# ALWAYS test on a sample first
# Process only first 10 seconds
ffmpeg -i "$input" -t 10 [options] test_output.mp4

# Process first 3 files in batch
ls "$INPUT_DIR"/*.mp4 | head -3 | while read file; do
  process_file "$file"
done
echo "Test complete. Review output before running full batch."
```

## Good Script Structure
```bash
#!/bin/bash
set -euo pipefail  # Exit on error, undefined vars, pipe failures

INPUT_DIR="${1:?Usage: $0 <input_dir>}"
OUTPUT_DIR="./processed"
LOG_FILE="./processing.log"

# Validate
[ -d "$INPUT_DIR" ] || { echo "Input directory not found"; exit 1; }
mkdir -p "$OUTPUT_DIR"

# Process
for file in "$INPUT_DIR"/*.mp4; do
  [ -f "$file" ] || continue
  output="$OUTPUT_DIR/$(basename "$file")"

  ffmpeg -i "$file" [options] -y "$output" 2>>"$LOG_FILE" || {
    echo "Failed: $file" >> "$LOG_FILE"
    rm -f "$output"
    continue
  }
done
```

## Anti-Patterns
- Processing in place (overwriting original files)
- No error handling (partial files left on failure)
- No disk space check (fills disk, corrupts output)
- Running full batch without testing on samples
- Using `-y` without output directory separation (overwrites originals)
- No logging (can't debug failures after batch completes)
