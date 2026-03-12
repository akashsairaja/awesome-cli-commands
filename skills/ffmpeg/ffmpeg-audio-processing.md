---
id: ffmpeg-audio-processing
stackId: ffmpeg
type: skill
name: Audio Processing & Conversion
description: >-
  Process audio with FFmpeg — format conversion, normalization, noise reduction,
  splitting, merging, and metadata management for podcasts, music, and voice
  content.
difficulty: beginner
tags:
  - audio
  - conversion
  - normalization
  - podcast
  - mp3
  - aac
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - FFmpeg installed
faq:
  - question: What is the best audio format for web delivery?
    answer: >-
      AAC (.m4a) for broadest compatibility, or Opus for modern browsers (30%
      smaller at same quality). Use MP3 only when AAC/Opus are not supported.
      For lossless needs, use FLAC. Opus at 128kbps matches MP3 at 192kbps in
      perceived quality.
  - question: How do I normalize audio volume with FFmpeg?
    answer: >-
      Use the loudnorm filter with two passes: first pass analyzes levels
      (ffmpeg -i input -af loudnorm=print_format=json -f null /dev/null), second
      pass applies normalization. Target -16 LUFS for podcasts and -14 LUFS for
      music (broadcast standards).
  - question: How do I extract audio from a video file?
    answer: >-
      Use: ffmpeg -i video.mp4 -vn -c:a copy audio.aac. The -vn flag removes
      video, and -c:a copy extracts audio without re-encoding (fastest, no
      quality loss). Use -c:a libmp3lame -b:a 192k instead of copy if you need a
      specific format.
relatedItems:
  - ffmpeg-web-optimization
  - ffmpeg-batch-processing
  - ffmpeg-media-processor
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Audio Processing & Conversion

## Overview
FFmpeg handles every audio task: format conversion, volume normalization, noise reduction, silence detection, stream extraction, and metadata management. Master these patterns for podcast production, music processing, and voice content workflows.

## Why This Matters
- **Universal conversion** — any audio format to any other
- **Normalization** — consistent volume across episodes/tracks
- **Extraction** — pull audio from video files
- **Automation** — scriptable audio processing pipelines

## How It Works

### Step 1: Format Conversion
```bash
# Convert to MP3 (most compatible)
ffmpeg -i input.wav -c:a libmp3lame -b:a 192k output.mp3

# Convert to AAC (Apple/web)
ffmpeg -i input.wav -c:a aac -b:a 192k output.m4a

# Convert to Opus (smallest, modern)
ffmpeg -i input.wav -c:a libopus -b:a 128k output.opus

# Convert to FLAC (lossless)
ffmpeg -i input.wav -c:a flac output.flac

# Extract audio from video
ffmpeg -i video.mp4 -vn -c:a copy audio.aac    # Copy (no re-encode)
ffmpeg -i video.mp4 -vn -c:a libmp3lame -b:a 192k audio.mp3  # Re-encode
```

### Step 2: Volume Normalization
```bash
# Two-pass loudness normalization (broadcast standard)
# Pass 1: Analyze
ffmpeg -i input.mp3 -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null /dev/null

# Pass 2: Apply (use values from pass 1)
ffmpeg -i input.mp3 \
  -af loudnorm=I=-16:TP=-1.5:LRA=11 \
  -c:a libmp3lame -b:a 192k output.mp3

# Simple volume adjustment
ffmpeg -i input.mp3 -af "volume=1.5" louder.mp3    # 1.5x volume
ffmpeg -i input.mp3 -af "volume=-3dB" quieter.mp3  # Reduce by 3dB
```

### Step 3: Split and Merge
```bash
# Split audio at timestamps
ffmpeg -i podcast.mp3 -ss 00:05:00 -to 00:10:00 -c copy segment.mp3

# Merge multiple audio files
# Create file list
echo "file 'intro.mp3'" > list.txt
echo "file 'content.mp3'" >> list.txt
echo "file 'outro.mp3'" >> list.txt

ffmpeg -f concat -safe 0 -i list.txt -c copy merged.mp3

# Add silence between segments
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 2 silence.mp3
```

### Step 4: Trim Silence
```bash
# Detect silence
ffmpeg -i input.mp3 -af silencedetect=noise=-30dB:d=0.5 -f null /dev/null

# Remove leading/trailing silence
ffmpeg -i input.mp3 \
  -af "silenceremove=start_periods=1:start_duration=0.1:start_threshold=-40dB, \
       areverse,silenceremove=start_periods=1:start_duration=0.1:start_threshold=-40dB, \
       areverse" \
  trimmed.mp3
```

## Best Practices
- Use `-c:a copy` when only changing container (no quality loss)
- Normalize to -16 LUFS for podcasts, -14 LUFS for music
- Use Opus for modern applications (best quality per bit)
- Use FLAC for archival (lossless, smaller than WAV)
- Always specify sample rate (`-ar 44100`) for consistent output

## Common Mistakes
- Re-encoding when stream copy would work (`-c:a copy`)
- Not normalizing volume (inconsistent levels between tracks)
- Using MP3 at < 128kbps (audible quality loss)
- Lossy-to-lossy conversion (quality degrades each time)
- Missing metadata in output (`-map_metadata 0` to preserve)
