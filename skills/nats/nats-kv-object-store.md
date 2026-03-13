---
id: nats-kv-object-store
stackId: nats
type: skill
name: >-
  NATS Key-Value & Object Store
description: >-
  Use NATS built-in Key-Value and Object stores — storing configuration,
  feature flags, state data, and binary objects with history, TTL, and watch
  capabilities from the NATS CLI.
difficulty: beginner
tags:
  - nats
  - key-value
  - object
  - store
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the NATS Key-Value & Object Store skill?"
    answer: >-
      Use NATS built-in Key-Value and Object stores — storing configuration,
      feature flags, state data, and binary objects with history, TTL, and
      watch capabilities from the NATS CLI. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does NATS Key-Value & Object Store require?"
    answer: >-
      Works with standard nats tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# NATS Key-Value & Object Store

## Overview
NATS KV and Object stores provide distributed storage built on JetStream. KV stores key-value pairs with history and watch. Object store handles large binary objects with chunking.

## Why This Matters
- **Configuration** — distributed config with real-time updates via watch
- **Feature flags** — toggle features across services instantly
- **State management** — share state between service instances
- **Object storage** — store files and artifacts without external dependencies

## How It Works

### Step 1: Key-Value Store Basics
```bash
# Create KV bucket
nats kv add CONFIG --history=10 --ttl=0

# Put values
nats kv put CONFIG app.name "MyService"
nats kv put CONFIG app.version "2.1.0"
nats kv put CONFIG feature.dark_mode "true"
nats kv put CONFIG db.max_connections "50"

# Get values
nats kv get CONFIG app.name
nats kv get CONFIG app.version

# List all keys
nats kv ls CONFIG

# Delete a key
nats kv del CONFIG feature.dark_mode

# View bucket info
nats kv info CONFIG
```

### Step 2: History & Versioning
```bash
# Update a value (creates new version)
nats kv put CONFIG app.version "2.1.0"
nats kv put CONFIG app.version "2.2.0"
nats kv put CONFIG app.version "2.3.0"

# View history
nats kv history CONFIG app.version

# Get specific revision
nats kv get CONFIG app.version --revision=2
```

### Step 3: Watch for Changes
```bash
# Watch all keys
nats kv watch CONFIG

# Watch specific key pattern
nats kv watch CONFIG "app.>"

# Watch for feature flag changes
nats kv watch CONFIG "feature.>"
```

### Step 4: Object Store
```bash
# Create object store bucket
nats object add ARTIFACTS --max-bucket-size=1GB

# Upload object
nats object put ARTIFACTS config.tar.gz --file=./config.tar.gz
nats object put ARTIFACTS report.pdf --file=./report.pdf

# Download object
nats object get ARTIFACTS config.tar.gz --output=./downloaded.tar.gz

# List objects
nats object ls ARTIFACTS

# Object info
nats object info ARTIFACTS config.tar.gz

# Delete object
nats object rm ARTIFACTS config.tar.gz

# Seal bucket (read-only)
nats object seal ARTIFACTS
```

## Best Practices
- Use KV for small values (under 1MB), Object store for larger data
- Set --history on KV buckets for audit trail and rollback
- Use watch for reactive configuration updates
- Use TTL for cache-like data that should expire
- Use dot-separated key names for wildcard watching

## Common Mistakes
- Storing large values in KV (use Object store instead)
- No history on KV bucket (can't rollback bad config changes)
- Not using watch (polling for changes is inefficient)
- No max-bucket-size on Object store (unbounded growth)
- Using KV as a general-purpose database (it's for config/state)
