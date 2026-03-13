---
id: scoop-cleanup-maintenance
stackId: scoop
type: skill
name: >-
  Scoop Cleanup & Maintenance
description: >-
  Keep Scoop installations clean and performant — cleanup old versions, reset
  broken apps, manage cache, and resolve common Windows-specific issues.
difficulty: intermediate
tags:
  - scoop
  - cleanup
  - maintenance
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Scoop Cleanup & Maintenance skill?"
    answer: >-
      Keep Scoop installations clean and performant — cleanup old versions,
      reset broken apps, manage cache, and resolve common Windows-specific
      issues. It includes practical examples for scoop development.
  - question: "What tools and setup does Scoop Cleanup & Maintenance require?"
    answer: >-
      Works with standard scoop tooling (relevant CLI tools and frameworks).
      No special setup required beyond a working scoop environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Scoop Cleanup & Maintenance

## Overview
Scoop keeps old versions of apps in its directory structure. Regular cleanup frees disk space, resolves shim issues, and keeps your installation healthy.

## Why This Matters
- **Disk space** — old versions accumulate quickly
- **Broken shims** — stale shims point to deleted executables
- **Cache bloat** — downloaded installers remain in cache
- **Stability** — regular maintenance prevents subtle issues

## Maintenance Commands

### Cleanup Old Versions
```powershell
# Clean specific app (remove old versions)
scoop cleanup nodejs

# Clean all apps
scoop cleanup *

# Clean and remove cache
scoop cleanup * --cache

# Preview what would be cleaned
scoop cleanup * --dry-run
```

### Cache Management
```powershell
# Show cache size and contents
scoop cache show

# Remove all cached downloads
scoop cache rm *

# Remove cache for specific app
scoop cache rm nodejs
```

### Reset Broken Apps
```powershell
# Reset app to clean state (re-creates shims and shortcuts)
scoop reset nodejs

# Reset all apps
scoop reset *

# Useful after PATH issues or broken shims
```

### Update Everything
```powershell
# Update Scoop itself and all buckets
scoop update

# Update specific app
scoop update nodejs

# Update all apps
scoop update *

# Check what's outdated
scoop status
```

### Hold/Unhold Versions
```powershell
# Prevent automatic updates
scoop hold nodejs
scoop hold python

# Release hold
scoop unhold nodejs

# Check held packages
scoop list | Select-String "held"
```

## Maintenance Routine
```powershell
# Weekly maintenance script
scoop update           # Update Scoop and buckets
scoop status           # Check for outdated apps
scoop update *         # Update all (after review)
scoop cleanup *        # Remove old versions
scoop cache rm *       # Clear download cache

# Monthly
scoop reset *          # Reset all shims
scoop checkup          # Health check
```

## Best Practices
- **Run `scoop cleanup *` monthly** — old versions waste space
- **Clear cache quarterly**: `scoop cache rm *`
- **Hold critical versions**: `scoop hold nodejs` for project stability
- **Check status before updating**: `scoop status`
- **Reset after issues**: `scoop reset *` fixes most shim problems

## Common Mistakes
- Never running cleanup (GB of old versions)
- Updating everything without checking status first
- Not holding version-sensitive tools
- Ignoring scoop checkup warnings
