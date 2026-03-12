---
id: ffmpeg-filter-naming-rules
stackId: ffmpeg
type: rule
name: Filter Graph Naming Conventions
description: >-
  Standards for FFmpeg filter graphs — named pads, readable chain formatting,
  complex graph organization, and documentation requirements for maintainable
  media processing commands.
difficulty: intermediate
globs:
  - '**/*.sh'
  - '**/*.bash'
tags:
  - filters
  - naming
  - formatting
  - readability
  - conventions
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: Why should FFmpeg filter pads be named descriptively?
    answer: >-
      Complex filter graphs with [a], [b], [c] pads are impossible to debug or
      modify. Descriptive names like [v_scaled], [v_watermarked], [v_final] make
      the processing pipeline self-documenting and easy to troubleshoot when
      output isn't as expected.
  - question: How should complex FFmpeg commands be formatted?
    answer: >-
      Place one filter per line, align input/output pads vertically, use line
      continuation (backslash) for the overall command, and add comments for
      non-obvious operations. This makes complex graphs readable and
      maintainable, especially in shared scripts.
relatedItems:
  - ffmpeg-encoding-standards
  - ffmpeg-script-safety-rules
  - ffmpeg-filter-designer
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Filter Graph Naming Conventions

## Rule
All FFmpeg complex filter graphs MUST use named pads, one filter per line for readability, and include comments documenting the filter purpose.

## Pad Naming Convention
```bash
# Use descriptive names for filter pads
# Format: [type_description] — e.g., [v_scaled], [a_normalized], [overlay_result]

# Good — named and readable
ffmpeg -i main.mp4 -i watermark.png -filter_complex "
  [0:v]scale=1920:1080[v_scaled];
  [v_scaled][1:v]overlay=W-w-10:H-h-10[v_watermarked]
" -map "[v_watermarked]" -map 0:a output.mp4

# Bad — unnamed and cramped
ffmpeg -i main.mp4 -i wm.png -filter_complex "[0:v]scale=1920:1080[a];[a][1:v]overlay=W-w-10:H-h-10[b]" -map "[b]" -map 0:a out.mp4
```

## Formatting Rules
```bash
# Rule 1: One filter per line for complex graphs
# Rule 2: Align input/output pads vertically
# Rule 3: Use descriptive pad names, not [a], [b], [c]
# Rule 4: Add comments for non-obvious operations

ffmpeg -i input.mp4 -i overlay.png -i logo.png \
  -filter_complex "
    [0:v]scale=1920:1080[v_base];
    [v_base][1:v]overlay=10:10:enable='between(t,5,15)'[v_with_overlay];
    [v_with_overlay][2:v]overlay=W-w-10:10[v_final]
  " \
  -map "[v_final]" -map 0:a \
  -c:v libx264 -crf 22 \
  output.mp4
```

## Good Pad Names
```
[v_scaled]       — video after scaling
[v_cropped]      — video after cropping
[v_watermarked]  — video with watermark applied
[a_normalized]   — audio after loudness normalization
[v_final]        — final video output
```

## Bad Pad Names
```
[a] [b] [c]      — meaningless
[out1] [out2]    — no context
[tmp] [temp]     — undescriptive
[x] [y] [z]     — random letters
```

## Anti-Patterns
- Single-line complex filter graphs (unreadable beyond 2 filters)
- Unnamed pads [a], [b], [c] (impossible to debug)
- No comments on non-obvious filter operations
- Mixing simple (-vf) and complex (-filter_complex) syntax
- Not testing with -t 10 before full processing
