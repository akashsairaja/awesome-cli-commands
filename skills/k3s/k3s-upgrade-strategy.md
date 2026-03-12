---
id: k3s-upgrade-strategy
stackId: k3s
type: skill
name: Automated K3s Upgrades with System Upgrade Controller
description: >-
  Implement automated rolling upgrades for K3s clusters using the System Upgrade
  Controller — plan-based upgrades with drain, cordon, and version pinning.
difficulty: intermediate
tags:
  - k3s-upgrade
  - system-upgrade-controller
  - rolling-upgrade
  - version-management
  - kubernetes-maintenance
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Running K3s cluster
  - kubectl access
  - Target K3s version identified
faq:
  - question: How does the K3s System Upgrade Controller work?
    answer: >-
      The System Upgrade Controller watches for Plan resources that specify a
      target K3s version. It cordons and drains nodes one at a time, runs the
      upgrade container, and uncordons after success. Server nodes are upgraded
      before agents using the prepare step.
  - question: Can I roll back a K3s upgrade?
    answer: >-
      Yes, but it requires manual steps. Restore the etcd snapshot taken before
      the upgrade with 'k3s server --cluster-reset
      --cluster-reset-restore-path=/path/to/snapshot', then reinstall the
      previous K3s version on each node. This is why pre-upgrade snapshots are
      critical.
relatedItems:
  - k3s-ha-cluster-setup
  - k3s-cluster-architect
  - k3s-storage-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Automated K3s Upgrades with System Upgrade Controller

## Overview
The K3s System Upgrade Controller (SUC) automates cluster upgrades by applying Plan resources that define target versions, node selectors, and upgrade strategies. It performs rolling upgrades — draining and cordoning nodes one at a time to maintain availability.

## Why This Matters
- **Zero-downtime upgrades** — rolling strategy keeps workloads running
- **Declarative** — upgrade plans are Kubernetes resources managed via GitOps
- **Safe** — drain and cordon prevent scheduling during upgrades
- **Automated** — no SSH-ing into nodes to run upgrade scripts

## How It Works

### Step 1: Install the System Upgrade Controller
```bash
# Apply the SUC manifest
kubectl apply -f https://github.com/rancher/system-upgrade-controller/releases/latest/download/system-upgrade-controller.yaml

# Verify it is running
kubectl -n system-upgrade get pods
```

### Step 2: Create Server Upgrade Plan
```yaml
# server-plan.yaml
apiVersion: upgrade.cattle.io/v1
kind: Plan
metadata:
  name: server-plan
  namespace: system-upgrade
spec:
  concurrency: 1
  cordon: true
  nodeSelector:
    matchExpressions:
      - key: node-role.kubernetes.io/master
        operator: In
        values: ["true"]
  serviceAccountName: system-upgrade
  upgrade:
    image: rancher/k3s-upgrade
  version: v1.29.2+k3s1
```

### Step 3: Create Agent Upgrade Plan
```yaml
# agent-plan.yaml
apiVersion: upgrade.cattle.io/v1
kind: Plan
metadata:
  name: agent-plan
  namespace: system-upgrade
spec:
  concurrency: 1
  cordon: true
  nodeSelector:
    matchExpressions:
      - key: node-role.kubernetes.io/master
        operator: DoesNotExist
  prepare:
    args: ["prepare", "server-plan"]
    image: rancher/k3s-upgrade
  serviceAccountName: system-upgrade
  upgrade:
    image: rancher/k3s-upgrade
  version: v1.29.2+k3s1
```

### Step 4: Apply and Monitor
```bash
# Apply upgrade plans
kubectl apply -f server-plan.yaml
kubectl apply -f agent-plan.yaml

# Monitor upgrade progress
watch kubectl get nodes -o wide
kubectl -n system-upgrade get plans
kubectl -n system-upgrade get jobs
```

## Best Practices
- Always upgrade server nodes before agent nodes (use prepare step)
- Set concurrency to 1 for safe rolling upgrades
- Test target version on a staging cluster first
- Create an etcd snapshot before starting the upgrade
- Use the channel field instead of version for automatic latest stable

## Common Mistakes
- Upgrading agents before servers (version skew issues)
- Setting concurrency too high (multiple nodes down simultaneously)
- Not testing the target version in staging first
- Forgetting to snapshot etcd before upgrade (no rollback point)
- Skipping minor versions (always upgrade incrementally)
