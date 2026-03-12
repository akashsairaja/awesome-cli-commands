---
id: scoop-manifest-standards
stackId: scoop
type: rule
name: Scoop Manifest Standards
description: >-
  Standards for creating Scoop manifests — required fields, hash verification,
  autoupdate configuration, proper bin declarations, and installer/uninstaller
  patterns.
difficulty: intermediate
globs:
  - '**/bucket/*.json'
  - '**/scoop/**/*.json'
tags:
  - manifest
  - json-schema
  - autoupdate
  - hash-verification
  - packaging
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - zed
faq:
  - question: What fields are required in a Scoop manifest?
    answer: >-
      Required: version, description, homepage, license, url with hash, and bin.
      Strongly recommended: checkver (version detection) and autoupdate
      (automatic URL updates). Without checkver/autoupdate, manifests must be
      manually updated for each release.
  - question: How do I add hash verification to a Scoop manifest?
    answer: >-
      Download the file and compute its SHA256 hash: 'Get-FileHash file.zip
      -Algorithm SHA256'. Add to the manifest as '"hash": "sha256:abc123..."'.
      Scoop verifies the hash on install to prevent corrupted or tampered
      downloads.
relatedItems:
  - scoop-bucket-management
  - scoop-environment-manager
  - scoop-automation-agent
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Scoop Manifest Standards

## Rule
All custom Scoop manifests MUST include version, description, URL with hash, bin declarations, and autoupdate configuration for maintainability.

## Format
```json
{
  "version": "1.2.3",
  "description": "Short description of the tool",
  "homepage": "https://tool.example.com",
  "license": "MIT",
  "architecture": {
    "64bit": {
      "url": "https://releases.example.com/tool-1.2.3-win64.zip",
      "hash": "sha256:abc123..."
    },
    "32bit": {
      "url": "https://releases.example.com/tool-1.2.3-win32.zip",
      "hash": "sha256:def456..."
    }
  },
  "bin": "tool.exe",
  "checkver": {
    "url": "https://api.github.com/repos/org/tool/releases/latest",
    "jsonpath": "$.tag_name",
    "regex": "v([\\d.]+)"
  },
  "autoupdate": {
    "architecture": {
      "64bit": {
        "url": "https://releases.example.com/tool-$version-win64.zip"
      }
    }
  }
}
```

## Required Fields
| Field | Purpose |
|-------|---------|
| version | Current version string |
| description | What the tool does |
| homepage | Project website |
| license | SPDX license identifier |
| url + hash | Download URL with SHA256 |
| bin | Executable(s) to shim |
| checkver | How to detect new versions |
| autoupdate | URL pattern for updates |

## Good
```json
{
  "version": "2.1.0",
  "description": "Fast file searcher",
  "url": "https://github.com/org/tool/releases/download/v2.1.0/tool-win64.zip",
  "hash": "sha256:abc123...",
  "bin": "tool.exe",
  "checkver": { "github": "https://github.com/org/tool" },
  "autoupdate": { "url": "https://github.com/org/tool/releases/download/v$version/tool-win64.zip" }
}
```

## Bad
```json
{
  "version": "2.1.0",
  "url": "https://example.com/tool.zip",
  "bin": "tool.exe"
}
```
Missing: description, hash, license, checkver, autoupdate
