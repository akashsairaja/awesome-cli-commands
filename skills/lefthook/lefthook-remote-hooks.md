---
id: lefthook-remote-hooks
stackId: lefthook
type: skill
name: Remote and Shared Hook Configurations
description: >-
  Share Lefthook configurations across repositories using remote hooks —
  centralized organizational standards, versioned hook templates, and
  per-project overrides.
difficulty: intermediate
tags:
  - lefthook
  - remote
  - shared
  - hook
  - configurations
  - security
  - machine-learning
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Remote and Shared Hook Configurations skill?"
    answer: >-
      Share Lefthook configurations across repositories using remote hooks —
      centralized organizational standards, versioned hook templates, and
      per-project overrides. It includes practical examples for lefthook
      development.
  - question: "What tools and setup does Remote and Shared Hook Configurations require?"
    answer: >-
      Works with standard lefthook tooling (relevant CLI tools and
      frameworks). Review the setup section in the skill content for specific
      configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Remote and Shared Hook Configurations

## Overview
Lefthook's remote hooks feature lets you share hook configurations across multiple repositories. Define organizational standards in a central repository and inherit them in every project — with per-project overrides for specific needs.

## How It Works

### Central Hook Repository
```yaml
# In github.com/org/shared-hooks/lefthook.yml
pre-commit:
  parallel: true
  commands:
    secrets-scan:
      run: gitleaks protect --staged --no-banner
    trailing-whitespace:
      run: "git diff --cached --check"
    large-files:
      run: "git diff --cached --stat | awk '/\|/ {if ($3 > 500) print $1}' | xargs -r false"

commit-msg:
  commands:
    conventional:
      run: npx commitlint --edit {1}
```

### Consuming Remote Hooks
```yaml
# lefthook.yml in consuming project
remotes:
  - git_url: https://github.com/org/shared-hooks
    ref: v1.2.0
    configs:
      - lefthook.yml

# Add project-specific hooks alongside remote ones
pre-commit:
  parallel: true
  commands:
    project-lint:
      glob: "*.{ts,tsx}"
      run: npx eslint {staged_files}
```

### Versioned Remote Hooks
```yaml
remotes:
  - git_url: https://github.com/org/shared-hooks
    ref: v2.0.0  # Pin to specific version
    configs:
      - lefthook.yml

  - git_url: https://github.com/org/security-hooks
    ref: main    # Always use latest (for security checks)
    configs:
      - security.yml
```

### Override Remote Commands
```yaml
# Override a remote command for this project
remotes:
  - git_url: https://github.com/org/shared-hooks
    ref: v1.0.0
    configs:
      - lefthook.yml

pre-commit:
  commands:
    secrets-scan:
      skip: true  # This project has its own secrets scanning
```

## Best Practices
- Pin remote hooks to tagged versions (not branch names) for stability
- Use `main` branch only for critical security checks that should update automatically
- Allow per-project overrides for commands that do not apply everywhere
- Version your shared hooks repository with semantic versioning
- Test shared hook changes in a staging project before rolling out org-wide
- Document available shared hooks in your organization's developer guide

## Common Mistakes
- Using `main` branch for all remote hooks (breaking changes affect all projects)
- Not allowing per-project overrides (forces one-size-fits-all)
- Not versioning the shared hooks repository (no rollback capability)
- Adding project-specific logic to shared hooks (should be generic)
