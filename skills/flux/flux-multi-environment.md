---
id: flux-multi-environment
stackId: flux
type: skill
name: Multi-Environment Promotion with Flux
description: >-
  Design a GitOps promotion pipeline from dev to staging to production using
  Flux Kustomize overlays, dependency chains, and controlled reconciliation.
difficulty: advanced
tags:
  - multi-environment
  - kustomize-overlays
  - promotion-pipeline
  - gitops
  - flux-cd
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Flux bootstrapped on target clusters
  - Kustomize familiarity
  - Git branching strategy
faq:
  - question: How do I promote deployments from staging to production with Flux?
    answer: >-
      Use Kustomize overlays with a shared base directory. Staging and
      production each have their own overlay with environment-specific patches.
      Promote changes by updating the production overlay (via PR) with the same
      image tag or config that was validated in staging.
  - question: Should I use one Git repository or multiple for multi-environment Flux?
    answer: >-
      A mono-repo with path-based separation (clusters/staging,
      clusters/production) works well for most teams. Use separate repos only
      when teams need different access controls per environment or when the repo
      becomes too large for fast Git operations.
relatedItems:
  - flux-bootstrap-cluster
  - flux-helmrelease-setup
  - flux-gitops-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Multi-Environment Promotion with Flux

## Overview
Multi-environment promotion with Flux uses Kustomize overlays to manage different configurations per environment while sharing a common base. Changes flow from development through staging to production via Git branch strategies and controlled reconciliation.

## Why This Matters
- **Environment parity** — same base manifests with targeted overrides
- **Controlled promotion** — explicit Git operations move changes between environments
- **Audit trail** — every promotion is a Git commit
- **Rollback simplicity** — git revert to undo a promotion

## How It Works

### Step 1: Repository Structure
```
fleet-infra/
├── apps/
│   ├── base/
│   │   ├── my-app/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── kustomization.yaml
│   │   └── redis/
│   │       └── kustomization.yaml
│   ├── staging/
│   │   ├── my-app-patch.yaml
│   │   └── kustomization.yaml
│   └── production/
│       ├── my-app-patch.yaml
│       └── kustomization.yaml
├── infrastructure/
│   ├── base/
│   │   ├── cert-manager/
│   │   └── ingress-nginx/
│   ├── staging/
│   └── production/
└── clusters/
    ├── staging/
    │   ├── apps.yaml
    │   └── infrastructure.yaml
    └── production/
        ├── apps.yaml
        └── infrastructure.yaml
```

### Step 2: Define Base Manifests
```yaml
# apps/base/my-app/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 1
  template:
    spec:
      containers:
        - name: app
          image: ghcr.io/my-org/my-app:1.0.0
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
```

### Step 3: Environment-Specific Overlays
```yaml
# apps/staging/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: staging
resources:
  - ../base/my-app
patches:
  - path: my-app-patch.yaml

# apps/staging/my-app-patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 2

# apps/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: production
resources:
  - ../base/my-app
patches:
  - path: my-app-patch.yaml

# apps/production/my-app-patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 5
  template:
    spec:
      containers:
        - name: app
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: "1"
              memory: 1Gi
```

### Step 4: Cluster Kustomizations with Dependencies
```yaml
# clusters/production/infrastructure.yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: infrastructure
  namespace: flux-system
spec:
  interval: 10m
  sourceRef:
    kind: GitRepository
    name: flux-system
  path: ./infrastructure/production
  prune: true
  wait: true

# clusters/production/apps.yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: apps
  namespace: flux-system
spec:
  interval: 10m
  dependsOn:
    - name: infrastructure    # Apps deploy AFTER infrastructure
  sourceRef:
    kind: GitRepository
    name: flux-system
  path: ./apps/production
  prune: true
  wait: true
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: my-app
      namespace: production
```

## Best Practices
- Keep base manifests minimal — override only what changes per environment
- Use `dependsOn` to ensure infrastructure deploys before applications
- Add health checks to verify deployments succeed
- Use Git tags or semver branches for production promotions
- Automate staging deploys, require manual PR for production

## Common Mistakes
- Duplicating full manifests per environment instead of using overlays
- Missing `dependsOn` chains (apps deploy before infrastructure is ready)
- Not using namespaces to isolate environments on shared clusters
- Forgetting `prune: true` (removed apps leave orphaned resources)
