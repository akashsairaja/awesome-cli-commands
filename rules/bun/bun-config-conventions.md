---
id: bun-config-conventions
stackId: bun
type: rule
name: bunfig.toml Configuration Standards
description: >-
  Every Bun project must use bunfig.toml for runtime and package manager
  configuration — install behavior, registry settings, and test configuration in
  one canonical file.
difficulty: beginner
globs:
  - '**/bunfig.toml'
  - '**/*.ts'
  - '**/*.tsx'
  - '**/package.json'
tags:
  - bunfig
  - configuration
  - package-manager
  - toml
  - project-setup
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: What is bunfig.toml and why should I use it?
    answer: >-
      bunfig.toml is Bun's project-level configuration file. It replaces
      scattered CLI flags and environment variables with a single source of
      truth for install behavior, test settings, registry configuration, and
      runtime options. Committing it to version control ensures consistent
      behavior across all environments.
  - question: Can bunfig.toml replace .npmrc for registry configuration?
    answer: >-
      Yes. Bun reads bunfig.toml for registry and scoped package configuration.
      Use [install.scopes] to configure private registries with tokens. This
      replaces .npmrc for Bun projects while keeping configuration in a single
      file.
relatedItems:
  - bun-workspace-conventions
  - bun-test-patterns
  - npm-package-json-standards
version: 1.0.0
lastUpdated: '2026-03-12'
---

# bunfig.toml Configuration Standards

## Rule
All Bun projects MUST use bunfig.toml for configuration. Never scatter settings across environment variables when bunfig.toml options exist.

## Format
```toml
# bunfig.toml — project root
[install]
peer = false
optional = true

[install.lockfile]
print = "yarn"

[test]
coverage = true
coverageThreshold = { line = 80, function = 80, statement = 80 }

[run]
# Automatically load .env files
dotenv = ".env"
```

## Good Examples
```toml
# Production-ready bunfig.toml
[install]
peer = false
optional = true
production = false

[install.scopes]
"@mycompany" = { url = "https://npm.mycompany.com/", token = "$NPM_TOKEN" }

[test]
preload = ["./test/setup.ts"]
coverage = true
coverageReporter = ["text", "lcov"]
timeout = 30000

[run]
dotenv = ".env"
```

## Bad Examples
```bash
# BAD: Using env vars for things bunfig.toml handles
BUN_CONFIG_REGISTRY=https://npm.mycompany.com bun install

# BAD: No bunfig.toml — scattered configuration
bun test --coverage --timeout 30000 --preload ./setup.ts
# Should be in bunfig.toml, not repeated in every command
```

## Enforcement
- Commit bunfig.toml to version control
- CI validates bunfig.toml exists in project root
- Use `bun pm ls` to verify dependency resolution matches expectations
