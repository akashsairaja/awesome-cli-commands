---
id: flux-kustomization-standards
stackId: flux
type: rule
name: Flux Kustomization Standards
description: >-
  Enforce best practices for Flux Kustomization resources — pruning, health
  checks, dependency ordering, interval settings, and reconciliation
  configuration.
difficulty: intermediate
globs:
  - '**/clusters/**/*.yaml'
  - '**/clusters/**/*.yml'
  - '**/flux-system/**/*.yaml'
tags:
  - flux-kustomization
  - gitops-standards
  - health-checks
  - pruning
  - reconciliation
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: 'Why is prune: true required on Flux Kustomizations?'
    answer: >-
      Without prune: true, Flux never deletes resources that are removed from
      Git. This causes orphaned resources to accumulate in the cluster — old
      ConfigMaps, Services, and Deployments remain running even after their
      manifests are deleted from the repository.
  - question: What reconciliation interval should I use for Flux Kustomizations?
    answer: >-
      Use 5m for application workloads that change frequently, 10m for
      infrastructure components like cert-manager or ingress controllers, and
      30m for slow-changing resources. Avoid intervals under 1m as they create
      unnecessary API server load.
relatedItems:
  - flux-helmrelease-standards
  - flux-source-standards
  - flux-gitops-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Flux Kustomization Standards

## Rule
All Flux Kustomization resources MUST include pruning, health checks, and appropriate reconciliation intervals.

## Format
```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: <app-name>
  namespace: flux-system
spec:
  interval: <5m-30m>
  sourceRef:
    kind: GitRepository
    name: flux-system
  path: ./<environment-path>
  prune: true
  wait: true
  timeout: 5m
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: <deployment-name>
      namespace: <namespace>
```

## Requirements
1. **prune: true** — ALWAYS set to garbage-collect removed resources
2. **Health checks** — ALWAYS define for Deployments and StatefulSets
3. **wait: true** — set when other Kustomizations depend on this one
4. **timeout** — set explicit timeout (default 5m is usually sufficient)
5. **dependsOn** — use when resources require other Kustomizations first
6. **interval** — 5m for apps, 10m for infrastructure, 30m for slow-changing resources

## Examples

### Good
```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: my-app
  namespace: flux-system
spec:
  interval: 5m
  dependsOn:
    - name: infrastructure
  sourceRef:
    kind: GitRepository
    name: flux-system
  path: ./apps/production
  prune: true
  wait: true
  timeout: 5m
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: my-app
      namespace: production
```

### Bad
```yaml
# Missing prune, health checks, timeout, and dependency
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: my-app
  namespace: flux-system
spec:
  interval: 1m  # Too frequent
  sourceRef:
    kind: GitRepository
    name: flux-system
  path: ./apps/production
```

## Enforcement
Review all Kustomization manifests in CI with a YAML linter that checks for required fields. Use OPA/Gatekeeper policies to reject Kustomizations without prune and health checks.
