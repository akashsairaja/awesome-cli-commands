---
id: flux-source-standards
stackId: flux
type: rule
name: Flux Source Repository Standards
description: >-
  Enforce standards for Flux GitRepository and HelmRepository sources —
  authentication, intervals, branch references, and verification for secure
  GitOps pipelines.
difficulty: intermediate
globs:
  - '**/clusters/**/sources/**/*.yaml'
  - '**/flux-system/**/*.yaml'
tags:
  - flux-sources
  - git-repository
  - helm-repository
  - authentication
  - gitops-security
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: How often should Flux poll Git repositories?
    answer: >-
      Use 1m intervals for development, 5m for staging and production. Intervals
      under 1m risk hitting API rate limits. For faster detection, use webhook
      Receivers to trigger immediate reconciliation on push instead of reducing
      the poll interval.
  - question: Should I use HTTPS or SSH for Flux GitRepository sources?
    answer: >-
      HTTPS with token authentication is recommended for most setups. It is
      simpler to configure, works through corporate proxies, and token rotation
      is straightforward. Use SSH only when HTTPS is not available or when you
      need deploy key authentication.
relatedItems:
  - flux-kustomization-standards
  - flux-helmrelease-standards
  - flux-bootstrap-cluster
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Flux Source Repository Standards

## Rule
All Flux source resources MUST use authenticated access, appropriate poll intervals, and branch/tag pinning for production workloads.

## Format
```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: <name>
  namespace: flux-system
spec:
  interval: <1m-10m>
  url: <https-or-ssh-url>
  ref:
    branch: <branch>    # or tag/semver
  secretRef:
    name: <auth-secret>
  verify:
    provider: cosign     # Optional: verify commit signatures
```

## Requirements
1. **Authentication** — ALWAYS use secretRef for private repositories
2. **Branch pinning** — specify exact branch, tag, or semver reference
3. **Interval** — 1m minimum; 5m+ for production stability
4. **HTTPS preferred** — use HTTPS URLs with token auth over SSH where possible
5. **Verification** — use commit signature verification for production sources

## Examples

### Good
```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: app-manifests
  namespace: flux-system
spec:
  interval: 5m
  url: https://github.com/my-org/manifests.git
  ref:
    branch: main
  secretRef:
    name: github-token
---
apiVersion: source.toolkit.fluxcd.io/v1
kind: HelmRepository
metadata:
  name: bitnami
  namespace: flux-system
spec:
  interval: 1h
  url: https://charts.bitnami.com/bitnami
  type: default
```

### Bad
```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: app-manifests
  namespace: flux-system
spec:
  interval: 10s          # Too frequent — API rate limiting
  url: https://github.com/my-org/manifests.git
  # Missing ref — defaults to HEAD of default branch
  # Missing secretRef — fails for private repos
```

## Enforcement
Validate source manifests in CI. Reject sources without secretRef for private repos, without explicit ref, or with intervals under 1m.
