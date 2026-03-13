---
id: github-dependabot-config
stackId: github
type: skill
name: Configure Dependabot with Auto-Merge and Grouping
description: >-
  Set up Dependabot for automated dependency updates with grouped PRs,
  auto-merge for safe updates, and custom schedules to reduce maintenance
  burden.
difficulty: intermediate
tags:
  - github
  - configure
  - dependabot
  - auto-merge
  - grouping
  - security
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Configure Dependabot with Auto-Merge and Grouping skill?"
    answer: >-
      Set up Dependabot for automated dependency updates with grouped PRs,
      auto-merge for safe updates, and custom schedules to reduce maintenance
      burden. This skill provides a structured workflow for CI/CD workflows,
      PR automation, issue management, and repository configuration.
  - question: "What tools and setup does Configure Dependabot with Auto-Merge and Grouping require?"
    answer: >-
      Requires npm/yarn/pnpm installed. Works with GitHub projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Configure Dependabot with Auto-Merge and Grouping

## Overview
Dependabot keeps your dependencies up to date by automatically creating pull requests for version updates and security patches. With grouping and auto-merge, you can reduce PR noise by 70-80% while staying secure.

## Why This Matters
- **Security** — patches vulnerable dependencies within hours
- **Maintenance** — automated updates reduce manual toil
- **Grouping** — batches related updates into single PRs
- **Auto-merge** — safe patch updates merge without human intervention

## How It Works

### Step 1: Create Dependabot Configuration
```yaml
# .github/dependabot.yml
version: 2

updates:
  # npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "America/New_York"
    open-pull-requests-limit: 10
    reviewers:
      - "org/engineering-leads"
    labels:
      - "dependencies"
      - "automated"
    groups:
      # Group minor and patch updates together
      production-dependencies:
        patterns:
          - "*"
        exclude-patterns:
          - "@types/*"
          - "eslint*"
          - "prettier"
        update-types:
          - "minor"
          - "patch"
      dev-tooling:
        patterns:
          - "@types/*"
          - "eslint*"
          - "prettier"
          - "typescript"
        update-types:
          - "minor"
          - "patch"
    ignore:
      # Ignore major versions (review manually)
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      actions:
        patterns:
          - "*"
```

### Step 2: Set Up Auto-Merge Workflow
```yaml
# .github/workflows/dependabot-auto-merge.yml
name: Dependabot Auto-Merge

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Fetch Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Auto-merge patch and minor updates
        if: steps.metadata.outputs.update-type == 'version-update:semver-patch' || steps.metadata.outputs.update-type == 'version-update:semver-minor'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Step 3: Configure Security Updates
```yaml
# In .github/dependabot.yml — security updates are separate
# They are enabled in repository Settings > Security > Dependabot

# To prioritize security updates, add to your config:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"  # Check security updates daily
    open-pull-requests-limit: 15
```

## Best Practices
- Group minor/patch updates to reduce PR volume
- Auto-merge patches that pass CI — they are lowest risk
- Review major version bumps manually (breaking changes)
- Schedule updates for Monday morning to batch weekend releases
- Keep GitHub Actions updated separately (supply chain security)
- Set `open-pull-requests-limit` to avoid PR overload

## Common Mistakes
- Not enabling Dependabot at all (most common security gap)
- Ignoring all Dependabot PRs (defeats the purpose)
- Auto-merging major version bumps (may contain breaking changes)
- Not grouping updates (creates dozens of individual PRs)
- Missing GitHub Actions ecosystem (Actions are dependencies too)
