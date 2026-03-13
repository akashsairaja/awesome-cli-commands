---
id: snyk-fix-workflow
stackId: snyk
type: skill
name: Automated Fix PR Workflow
description: >-
  Manage Snyk automated fix pull requests — review upgrade recommendations,
  test fixes, handle breaking changes, and use .snyk policies for deferred
  vulnerabilities.
difficulty: intermediate
tags:
  - snyk
  - automated
  - fix
  - workflow
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
  - question: "When should I use the Automated Fix PR Workflow skill?"
    answer: >-
      Manage Snyk automated fix pull requests — review upgrade
      recommendations, test fixes, handle breaking changes, and use .snyk
      policies for deferred vulnerabilities. This skill provides a structured
      workflow for dependency scanning, SAST analysis, container scanning, and
      vulnerability remediation.
  - question: "What tools and setup does Automated Fix PR Workflow require?"
    answer: >-
      Works with standard Snyk tooling (Snyk CLI, Snyk API). Review the setup
      section in the skill content for specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Automated Fix PR Workflow

## Overview
Snyk automatically creates pull requests that fix known vulnerabilities by upgrading dependencies to the minimum version that resolves the issue. Managing these PRs efficiently is key to maintaining a secure codebase without disrupting development.

## How It Works

### Step 1: Enable Automated Fix PRs
```
1. Import your repository in the Snyk dashboard
2. Go to Settings → Integration → GitHub
3. Enable "Automatic fix pull requests"
4. Configure: new vulnerabilities only, or all existing
5. Set dependency type: direct, transitive, or both
```

### Step 2: Review Fix PRs
```
Snyk fix PRs include:
- CVE details and severity
- The dependency path (how the vulnerability is introduced)
- The version change (e.g., lodash 4.17.20 → 4.17.21)
- Whether it is a direct or transitive dependency fix
- Release notes for the upgraded package
```

### Step 3: Handle Different Fix Types
```bash
# Direct dependency fix — straightforward
# Snyk upgrades: "lodash": "4.17.20" → "4.17.21" in package.json

# Transitive dependency fix via override
# Snyk adds to package.json:
# "overrides": { "minimist": "1.2.8" }

# Patch-based fix (when no upgrade available)
snyk protect  # Applies runtime patches
```

### Step 4: Use .snyk Policy for Deferred Fixes
```yaml
# .snyk — ignore with expiration
version: v1.25.0
ignore:
  SNYK-JS-LODASH-1018905:
    - '*':
        reason: 'Low risk — function not called in our code paths'
        expires: 2026-06-01T00:00:00.000Z
        created: 2026-03-11T00:00:00.000Z
patch: {}
```

### Step 5: Verify Fixes
```bash
# After merging a fix PR, verify the vulnerability is resolved
snyk test

# Check that the specific CVE no longer appears
snyk test --json | jq '.vulnerabilities[] | select(.id == "SNYK-JS-LODASH-1018905")'
```

## Best Practices
- Review fix PRs within 48 hours — security patches should not wait
- Run full test suite on fix PRs before merging
- Use `snyk fix` for batch fixing multiple vulnerabilities at once
- Set .snyk ignore expiration dates to 90 days max
- Track fix PR merge rate as a security health metric
- Prefer upgrades over patches — patches are temporary workarounds

## Common Mistakes
- Auto-merging fix PRs without running tests (minor bumps can break things)
- Ignoring fix PRs until they accumulate (harder to merge, more conflicts)
- Using .snyk ignore without expiration dates (permanent risk acceptance)
- Not verifying fixes after merge (the CVE may still appear in transitive deps)
