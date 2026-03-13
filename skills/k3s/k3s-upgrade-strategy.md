---
id: k3s-upgrade-strategy
stackId: k3s
type: skill
name: Automated K3s Upgrades with System Upgrade Controller
description: >-
  Implement automated rolling upgrades for K3s clusters using the System
  Upgrade Controller — plan-based upgrades with drain, cordon, and version
  pinning.
difficulty: intermediate
tags:
  - k3s
  - automated
  - upgrades
  - system
  - upgrade
  - controller
  - testing
  - kubernetes
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Automated K3s Upgrades with System Upgrade Controller skill?"
    answer: >-
      Implement automated rolling upgrades for K3s clusters using the System
      Upgrade Controller — plan-based upgrades with drain, cordon, and version
      pinning. This skill provides a structured workflow for development
      tasks.
  - question: "What tools and setup does Automated K3s Upgrades with System Upgrade Controller require?"
    answer: >-
      Requires kubectl installed. Works with k3s projects. No additional
      configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
