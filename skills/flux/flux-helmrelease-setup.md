---
id: flux-helmrelease-setup
stackId: flux
type: skill
name: Deploy Helm Charts with Flux HelmRelease
description: >-
  Configure Flux HelmRelease resources to deploy and manage Helm charts from
  repositories with values overrides, upgrade strategies, and rollback policies.
difficulty: intermediate
tags:
  - helmrelease
  - helm-charts
  - flux-cd
  - gitops
  - kubernetes-deployment
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Flux 2.0+ installed on cluster
  - Helm chart repository URL
  - Basic Helm knowledge
faq:
  - question: How does Flux HelmRelease differ from helm install?
    answer: >-
      Flux HelmRelease is a declarative Kubernetes resource that describes the
      desired Helm chart state. Flux continuously reconciles the actual state
      with the desired state, handling installs, upgrades, rollbacks, and drift
      correction automatically. Unlike 'helm install', changes are tracked in
      Git and applied through GitOps.
  - question: How does Flux handle failed Helm upgrades?
    answer: >-
      Configure spec.upgrade.remediation with retries and remediateLastFailure:
      true. When an upgrade fails, Flux retries the specified number of times
      and can automatically roll back to the last successful release if all
      retries fail.
relatedItems:
  - flux-bootstrap-cluster
  - flux-multi-environment
  - flux-gitops-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Deploy Helm Charts with Flux HelmRelease

## Overview
Flux HelmRelease is a declarative way to manage Helm chart installations through GitOps. Instead of running `helm install` manually, you define HelmRelease resources in Git and Flux handles installation, upgrades, rollbacks, and drift correction automatically.

## Why This Matters
- **Declarative Helm** — no imperative `helm install/upgrade` commands
- **Drift detection** — Flux corrects manual changes automatically
- **Rollback policies** — automatic rollback on failed upgrades
- **Values from ConfigMaps/Secrets** — dynamic configuration without rebuilding

## How It Works

### Step 1: Add a Helm Repository Source
```yaml
# clusters/staging/sources/bitnami.yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: HelmRepository
metadata:
  name: bitnami
  namespace: flux-system
spec:
  interval: 1h
  url: https://charts.bitnami.com/bitnami
```

### Step 2: Create a HelmRelease
```yaml
# clusters/staging/apps/redis.yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: redis
  namespace: default
spec:
  interval: 5m
  chart:
    spec:
      chart: redis
      version: ">=18.0.0 <19.0.0"
      sourceRef:
        kind: HelmRepository
        name: bitnami
        namespace: flux-system
  values:
    architecture: standalone
    auth:
      enabled: true
      existingSecret: redis-credentials
    master:
      persistence:
        size: 8Gi
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 500m
          memory: 512Mi
  upgrade:
    remediation:
      retries: 3
      remediateLastFailure: true
  rollback:
    cleanupOnFail: true
```

### Step 3: Override Values per Environment
```yaml
# clusters/production/apps/redis.yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: redis
  namespace: default
spec:
  interval: 5m
  chart:
    spec:
      chart: redis
      version: "18.6.1"  # Pin exact version in production
      sourceRef:
        kind: HelmRepository
        name: bitnami
        namespace: flux-system
  values:
    architecture: replication
    replica:
      replicaCount: 3
    master:
      persistence:
        size: 50Gi
      resources:
        requests:
          cpu: 500m
          memory: 1Gi
```

### Step 4: Monitor HelmRelease Status
```bash
# Check HelmRelease status
flux get helmreleases -A

# View detailed status
kubectl describe helmrelease redis -n default

# Check the underlying HelmChart
flux get sources chart -A

# View Helm release history
helm history redis -n default
```

## Best Practices
- Use semver ranges in staging (`>=18.0.0 <19.0.0`) and pin exact versions in production
- Always configure `upgrade.remediation` with retries and rollback
- Use `valuesFrom` to inject environment-specific ConfigMaps or Secrets
- Set `spec.timeout` for charts that take long to install
- Define `spec.dependsOn` for charts that require other releases first

## Common Mistakes
- Using `*` version constraint (installs any version including breaking changes)
- Missing `upgrade.remediation` (failed upgrades leave broken state)
- Not setting resource requests/limits in chart values
- Forgetting to create the target namespace before the HelmRelease
- Hardcoding secrets in values instead of using `existingSecret` references
