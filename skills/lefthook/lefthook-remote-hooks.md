---
id: lefthook-remote-hooks
stackId: lefthook
type: skill
name: Remote and Shared Hook Configurations
description: >-
  Share Lefthook configurations across repositories using remote hooks —
  centralized organizational standards, versioned hook templates, and
  per-project overrides.
difficulty: advanced
tags:
  - remote-hooks
  - shared-configuration
  - organizational-standards
  - versioning
  - lefthook
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Lefthook 1.4+
  - Git repository for shared hooks
  - Organization with multiple repositories
faq:
  - question: What are Lefthook remote hooks?
    answer: >-
      Remote hooks let you inherit Lefthook configurations from a central Git
      repository. Define organizational standards (secrets scanning, commit
      conventions, formatting) once and share across all projects. Each project
      can override or extend the shared configuration.
  - question: Should I pin remote hooks to a specific version?
    answer: >-
      Yes — pin to tagged versions (v1.0.0) for stability. Changes to shared
      hooks should not break projects without explicit opt-in. The exception is
      critical security hooks (secrets scanning) which can track 'main' branch
      for immediate updates.
  - question: Can I combine remote hooks with local hooks?
    answer: >-
      Yes. Define remotes in lefthook.yml alongside local commands. Local
      commands are merged with remote commands. You can also override specific
      remote commands by defining a command with the same name locally — use
      'skip: true' to disable a remote command.
relatedItems:
  - lefthook-config-patterns
  - lefthook-monorepo-setup
  - lefthook-hook-architect
version: 1.0.0
lastUpdated: '2026-03-11'
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
