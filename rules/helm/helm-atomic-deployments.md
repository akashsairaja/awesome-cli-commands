---
id: helm-atomic-deployments
stackId: helm
type: rule
name: Use Atomic Deployments in CI/CD
description: >-
  All Helm deployments in CI/CD pipelines must use --atomic and --wait flags to
  ensure automatic rollback on failure and verification that resources are ready
  before reporting success.
difficulty: beginner
globs:
  - '**/.github/**'
  - '**/.gitlab-ci*'
  - '**/Jenkinsfile*'
  - '**/pipeline*'
  - '**/deploy*'
tags:
  - atomic
  - deployment-safety
  - rollback
  - ci-cd
  - helm-upgrade
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
  - question: What does --atomic do in Helm deployments?
    answer: >-
      The --atomic flag tells Helm to automatically rollback to the previous
      release version if the upgrade fails. It enables --wait, monitors all
      resources for readiness, and if any pod fails to start within the timeout,
      it rolls back the entire release and returns a non-zero exit code. Always
      use it in CI/CD to prevent broken deployments.
  - question: What happens if I deploy without --atomic?
    answer: >-
      Without --atomic, a failed upgrade leaves the release in a FAILED state.
      Pods may be in CrashLoopBackOff, services may be unreachable, and the CI
      pipeline may report success (if --wait was not set). You must manually
      rollback with 'helm rollback' or fix the issue. --atomic prevents this
      entire class of problems.
relatedItems:
  - helm-release-manager
  - helm-chart-standards
  - kubernetes-health-probes
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Use Atomic Deployments in CI/CD

## Rule
All Helm upgrade/install commands in CI/CD MUST use `--atomic` and `--timeout` flags. Production deployments MUST also use `--wait` to verify resource readiness.

## Required Flags
```bash
helm upgrade --install myapp ./chart \
  --namespace production \
  --atomic \              # Auto-rollback on failure
  --wait \                # Wait for resources to be ready
  --timeout 5m \          # Maximum wait time
  --history-max 5          # Limit release history
```

## Good Examples
```bash
# CI/CD deployment (all safety flags)
helm upgrade --install myapp ./chart \
  -f values-production.yaml \
  --namespace production \
  --create-namespace \
  --atomic \
  --wait \
  --timeout 10m \
  --history-max 5

# With diff check first
helm diff upgrade myapp ./chart -f values-production.yaml -n production
helm upgrade --install myapp ./chart -f values-production.yaml -n production --atomic --timeout 5m
```

## Bad Examples
```bash
# BAD: No atomic flag (broken releases stay broken)
helm upgrade myapp ./chart -f values.yaml

# BAD: No timeout (waits forever on stuck pods)
helm upgrade --install myapp ./chart --wait

# BAD: No wait (reports success before pods are ready)
helm upgrade --install myapp ./chart --atomic
```

## What --atomic Does
1. Sets `--wait` automatically
2. Monitors pod rollout status
3. If ANY resource fails to become ready within timeout:
   - Automatically rolls back to the previous release
   - Marks the release as FAILED
   - Returns non-zero exit code (fails CI pipeline)

## Enforcement
- CI/CD templates must include --atomic --timeout flags
- Code review for deployment scripts
- Wrapper scripts that enforce these flags by default
