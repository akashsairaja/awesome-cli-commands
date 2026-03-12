---
id: checkov-baseline-policy
stackId: checkov
type: rule
name: Baseline Management Policy
description: >-
  Define standards for Checkov baseline usage — when baselines are required, how
  to manage baseline files, and the process for reducing baseline findings over
  time.
difficulty: intermediate
globs:
  - '**/.checkov.baseline'
  - '**/.checkov*'
tags:
  - baseline
  - incremental-adoption
  - technical-debt
  - remediation-plan
  - checkov
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
  - question: What is a Checkov baseline?
    answer: >-
      A baseline is a snapshot of current findings that tells Checkov to only
      report NEW issues. It enables incremental adoption — existing findings are
      tracked but do not block PRs. Over time, you fix baseline findings and
      regenerate the baseline until it reaches zero.
  - question: How do I reduce Checkov baseline findings over time?
    answer: >-
      Set quarterly reduction targets (25% per quarter is realistic). Prioritize
      CRITICAL findings first, then HIGH. After fixing findings, regenerate the
      baseline with '--create-baseline'. Track baseline finding count as a
      metric in your security dashboard.
relatedItems:
  - checkov-scan-all-iac
  - checkov-skip-check-rules
  - checkov-ci-integration
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Baseline Management Policy

## Rule
Projects with existing IaC MUST use Checkov baselines for incremental adoption. Baselines must be committed to version control and reduced by 10% per quarter.

## When to Use Baselines
- Adopting Checkov on an existing project with 50+ findings
- Onboarding a new team that cannot fix all findings immediately
- Migrating between Checkov versions with new check additions

## Baseline Workflow
```bash
# Step 1: Create baseline (snapshot current state)
checkov -d ./terraform/ --create-baseline
# Creates .checkov.baseline file

# Step 2: Commit baseline to version control
git add .checkov.baseline
git commit -m "chore: add Checkov baseline for incremental adoption"

# Step 3: Future scans only report NEW findings
checkov -d ./terraform/ --baseline .checkov.baseline
```

## Baseline Reduction Plan
| Quarter | Target | Action |
|---------|--------|--------|
| Q1 (adoption) | Create baseline | Fix 0 existing, block new |
| Q2 | Reduce by 25% | Fix CRITICAL findings |
| Q3 | Reduce by 50% | Fix HIGH findings |
| Q4 | Reduce by 75% | Fix remaining MEDIUM+ |
| Q5 | Zero baseline | All findings resolved |

## Rules
1. Baselines MUST be committed to version control
2. Baselines MUST be re-evaluated quarterly
3. New findings (not in baseline) always block the build
4. Baseline findings must decrease over time — never increase
5. When a baseline finding is fixed, update the baseline file

## Updating Baselines
```bash
# After fixing findings, regenerate baseline
checkov -d ./terraform/ --create-baseline

# Verify fewer findings than before
wc -l .checkov.baseline  # Should decrease over time
```

## Anti-Patterns
- Creating a baseline and never reducing it
- Adding new findings to the baseline instead of fixing them
- Not committing baselines to version control (baseline is lost)
- Using baselines as permanent ignore lists
