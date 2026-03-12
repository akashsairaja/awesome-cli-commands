---
id: ffmpeg-encoding-standards
stackId: ffmpeg
type: rule
name: Video Encoding Standards
description: >-
  Enforce consistent video encoding parameters — codec selection, CRF ranges,
  pixel formats, faststart flags, and profile/level settings for reliable
  cross-platform media output.
difficulty: intermediate
globs:
  - '**/*.sh'
  - '**/*.bash'
  - '**/Makefile'
tags:
  - encoding
  - standards
  - h264
  - crf
  - pixel-format
  - web-video
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: Why must I always specify -pix_fmt yuv420p?
    answer: >-
      Some input files use yuv444p or yuv422p pixel formats which aren't
      supported by most browsers and mobile devices. Explicitly setting yuv420p
      ensures the output is compatible with Safari, Chrome, Firefox, and all
      mobile players.
  - question: What CRF value should I use for web video?
    answer: >-
      CRF 23 is the default for H.264 and works well for most web content. Use
      CRF 18-20 for portfolio/hero content where quality is critical. Use CRF
      26-28 for background videos or previews where smaller size matters more
      than quality.
relatedItems:
  - ffmpeg-filter-naming-rules
  - ffmpeg-script-safety-rules
  - ffmpeg-web-optimization
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Video Encoding Standards

## Rule
All FFmpeg video encoding commands MUST specify codec, quality method (CRF/bitrate), pixel format, and include `-movflags +faststart` for web-targeted output.

## Required Parameters for Web Video
```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \          # REQUIRED: explicit codec
  -crf 23 \               # REQUIRED: quality level
  -preset medium \         # REQUIRED: speed/compression tradeoff
  -profile:v high \        # REQUIRED: compatibility profile
  -level 4.1 \            # REQUIRED: device compatibility level
  -pix_fmt yuv420p \      # REQUIRED: browser-compatible pixel format
  -c:a aac -b:a 128k \   # REQUIRED: audio codec and bitrate
  -movflags +faststart \  # REQUIRED: progressive download
  output.mp4
```

## CRF Ranges
| Codec | Excellent | Good | Acceptable | Max |
|-------|-----------|------|------------|-----|
| libx264 | 18 | 23 | 28 | 51 |
| libx265 | 20 | 28 | 32 | 51 |
| libsvtav1 | 20 | 30 | 38 | 63 |

## Good Example
```bash
ffmpeg -i raw.mov \
  -c:v libx264 -crf 22 -preset medium \
  -profile:v high -level 4.1 \
  -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  web_ready.mp4
```

## Bad Example
```bash
# Missing codec, CRF, pixel format, faststart
ffmpeg -i raw.mov output.mp4
# FFmpeg uses defaults which may not be web-compatible
```

## Anti-Patterns
- Encoding without explicit codec (unpredictable output)
- Missing `-pix_fmt yuv420p` (Safari won't play yuv444p)
- Missing `-movflags +faststart` for web delivery
- CRF > 28 for H.264 (visible quality loss)
- Using `-preset veryslow` for non-archival content (wastes hours)
- Re-encoding with stream copy available (`-c copy`)
