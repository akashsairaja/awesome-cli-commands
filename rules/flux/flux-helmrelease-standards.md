---
id: flux-helmrelease-standards
stackId: flux
type: rule
name: HelmRelease Configuration Standards
description: >-
  Enforce standards for Flux HelmRelease resources — version constraints,
  upgrade remediation, rollback policies, and values management for reliable
  Helm deployments.
difficulty: intermediate
globs:
  - '**/clusters/**/*.yaml'
  - '**/helmreleases/**/*.yaml'
  - '**/apps/**/*.yaml'
tags:
  - helmrelease
  - version-constraints
  - rollback-policy
  - upgrade-remediation
  - flux-cd
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Why should I pin Helm chart versions in Flux HelmReleases?
    answer: >-
      Unpinned versions (using '*') allow Flux to install any new chart version,
      including major versions with breaking changes. Use semver ranges in
      staging to test new versions automatically and exact pins in production
      for stability.
  - question: What does upgrade.remediation do in a Flux HelmRelease?
    answer: >-
      The remediation block controls how Flux handles failed Helm upgrades. It
      specifies the number of retries and whether to roll back to the last
      successful release after all retries are exhausted. Without it, a failed
      upgrade leaves the release in a broken state.
relatedItems:
  - flux-kustomization-standards
  - flux-source-standards
  - flux-helmrelease-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# HelmRelease Configuration Standards

## Rule
All Flux HelmRelease resources MUST include version constraints, upgrade remediation, and rollback configuration.

## Format
```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: <release-name>
  namespace: <namespace>
spec:
  interval: 5m
  chart:
    spec:
      chart: <chart-name>
      version: "<semver-constraint>"
      sourceRef:
        kind: HelmRepository
        name: <repo-name>
        namespace: flux-system
  values:
    # Chart-specific values
  upgrade:
    remediation:
      retries: 3
      remediateLastFailure: true
  rollback:
    cleanupOnFail: true
  test:
    enable: true
```

## Requirements
1. **Version constraint** — NEVER use `*` or omit version; use semver ranges in staging, exact pins in production
2. **upgrade.remediation** — ALWAYS configure retries (minimum 3) with remediateLastFailure
3. **rollback.cleanupOnFail** — ALWAYS set to true to clean failed release resources
4. **Sensitive values** — NEVER inline secrets; use `valuesFrom` with Secrets or `existingSecret` chart options
5. **Resource limits** — ALWAYS set in chart values for all workload containers

## Examples

### Good — Staging (semver range)
```yaml
chart:
  spec:
    chart: nginx-ingress
    version: ">=4.8.0 <5.0.0"
upgrade:
  remediation:
    retries: 3
    remediateLastFailure: true
rollback:
  cleanupOnFail: true
```

### Good — Production (exact pin)
```yaml
chart:
  spec:
    chart: nginx-ingress
    version: "4.8.3"
upgrade:
  remediation:
    retries: 5
    remediateLastFailure: true
rollback:
  cleanupOnFail: true
```

### Bad
```yaml
chart:
  spec:
    chart: nginx-ingress
    version: "*"          # Allows any version including breaking changes
# Missing upgrade.remediation — failed upgrades leave broken state
# Missing rollback — no cleanup on failure
values:
  admin:
    password: "my-secret" # Secret in plain text in Git
```

## Enforcement
Use CI validation to check HelmRelease manifests for required fields. Add OPA policies to reject HelmReleases without remediation and rollback configurations.
