---
id: scoop-cleanup-maintenance
stackId: scoop
type: skill
name: Scoop Cleanup & Maintenance
description: >-
  Keep Scoop installations clean and performant — cleanup old versions, reset
  broken apps, manage cache, and resolve common Windows-specific issues.
difficulty: beginner
tags:
  - scoop-cleanup
  - maintenance
  - cache
  - disk-space
  - shims
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Scoop installed on Windows
faq:
  - question: How do I clean up disk space used by Scoop?
    answer: >-
      Run 'scoop cleanup *' to remove old versions of all apps. Add '--cache' to
      also clear downloaded files. Check space with 'scoop cache show'. Monthly
      cleanup typically recovers 500MB-2GB. Use 'scoop cleanup * --dry-run' to
      preview before cleaning.
  - question: How do I fix broken Scoop shims?
    answer: >-
      Run 'scoop reset <app>' to recreate shims and shortcuts for a specific
      app, or 'scoop reset *' for all apps. This fixes PATH issues, missing
      executables, and stale shim pointers. It's the Scoop equivalent of 'brew
      link --overwrite'.
relatedItems:
  - scoop-environment-manager
  - scoop-export-import
  - scoop-bucket-management
version: 1.0.0
lastUpdated: '2026-03-11'
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
