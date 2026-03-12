---
id: ffmpeg-web-optimization
stackId: ffmpeg
type: skill
name: Video Optimization for Web Delivery
description: >-
  Optimize video files for web delivery with FFmpeg — H.264/H.265 encoding, CRF
  quality tuning, faststart for progressive download, and multi-resolution
  adaptive streaming.
difficulty: intermediate
tags:
  - web-video
  - h264
  - crf
  - hls
  - optimization
  - streaming
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - FFmpeg installed with libx264
faq:
  - question: What is CRF encoding in FFmpeg?
    answer: >-
      CRF (Constant Rate Factor) is quality-based encoding where FFmpeg adjusts
      bitrate per frame to maintain consistent visual quality. Lower CRF =
      higher quality and larger files. CRF 23 is the default for H.264 — a good
      balance for web content. CRF 18 is visually lossless.
  - question: Why do I need -movflags +faststart?
    answer: >-
      The +faststart flag moves the MP4 metadata (moov atom) to the beginning of
      the file. Without it, browsers must download the entire file before
      playback starts. With it, video begins playing immediately as it downloads
      (progressive download).
  - question: What is HLS adaptive streaming?
    answer: >-
      HLS (HTTP Live Streaming) splits video into small segments at multiple
      quality levels. The player automatically switches between quality levels
      based on the viewer's bandwidth. Use FFmpeg to generate HLS manifests and
      segments for seamless adaptive playback.
relatedItems:
  - ffmpeg-batch-processing
  - ffmpeg-audio-processing
  - ffmpeg-media-processor
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Video Optimization for Web Delivery

## Overview
Web video must balance quality, file size, and compatibility. FFmpeg provides precise control over encoding parameters to produce videos that load fast, play smoothly, and look great across all browsers and devices.

## Why This Matters
- **Load time** — optimized video starts playing 2-5x faster
- **Bandwidth** — CRF encoding reduces file size 30-60% vs default
- **Compatibility** — correct settings ensure playback on all devices
- **SEO** — Google Core Web Vitals penalize slow-loading media

## How It Works

### Step 1: Basic Web-Ready Encoding
```bash
# H.264 with CRF quality, web-optimized
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -crf 23 \
  -preset medium \
  -profile:v high \
  -level 4.1 \
  -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  output.mp4
```

### Step 2: Resolution Variants for Responsive Video
```bash
# Generate multiple resolutions
for res in "1920:1080" "1280:720" "854:480"; do
  ffmpeg -i input.mp4 \
    -vf "scale=$res:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2" \
    -c:v libx264 -crf 23 -preset medium \
    -c:a aac -b:a 128k \
    -movflags +faststart \
    "output_$(echo $res | tr ':' 'x').mp4"
done
```

### Step 3: HLS Streaming (Adaptive Bitrate)
```bash
# Generate HLS with multiple quality levels
ffmpeg -i input.mp4 \
  -filter_complex "[0:v]split=3[v1][v2][v3]; \
    [v1]scale=1920:1080[v1out]; \
    [v2]scale=1280:720[v2out]; \
    [v3]scale=854:480[v3out]" \
  -map "[v1out]" -c:v:0 libx264 -b:v:0 5M -maxrate:v:0 5M -bufsize:v:0 10M \
  -map "[v2out]" -c:v:1 libx264 -b:v:1 2.5M -maxrate:v:1 2.5M -bufsize:v:1 5M \
  -map "[v3out]" -c:v:2 libx264 -b:v:2 1M -maxrate:v:2 1M -bufsize:v:2 2M \
  -map 0:a -c:a aac -b:a 128k \
  -f hls \
  -hls_time 6 \
  -hls_playlist_type vod \
  -master_pl_name master.m3u8 \
  -var_stream_map "v:0,a:0 v:1,a:0 v:2,a:0" \
  stream_%v/playlist.m3u8
```

### Step 4: Two-Pass Encoding (Maximum Quality)
```bash
# Pass 1: Analyze content
ffmpeg -i input.mp4 -c:v libx264 -b:v 4M -pass 1 -an -f null /dev/null

# Pass 2: Encode with analysis data
ffmpeg -i input.mp4 \
  -c:v libx264 -b:v 4M -pass 2 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  output.mp4
```

## CRF Quality Guide
| CRF Value | Quality | Use Case |
|-----------|---------|----------|
| 18 | Visually lossless | Archive, source masters |
| 20 | Excellent | Portfolio, hero videos |
| 23 | Good (default) | General web content |
| 26 | Acceptable | Background video, thumbnails |
| 28+ | Noticeable loss | Preview, low-bandwidth |

## Best Practices
- Always use `-movflags +faststart` for web video (enables progressive download)
- Use `-pix_fmt yuv420p` for maximum browser compatibility
- Set `-profile:v high -level 4.1` for broad device support
- Test on mobile devices — they have the tightest constraints
- Use CRF encoding unless you need a specific file size

## Common Mistakes
- Missing `-movflags +faststart` (video must fully download before playing)
- Wrong pixel format (`yuv444p` doesn't play in most browsers)
- Using CBR for non-streaming content (wastes bandwidth on static scenes)
- Encoding at source resolution without downscaling (unnecessary for web)
- Not testing on Safari/iOS (strictest codec requirements)
