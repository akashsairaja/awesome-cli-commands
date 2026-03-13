---
id: minikube-multi-node-setup
stackId: minikube
type: skill
name: Create Multi-Node Minikube Clusters
description: >-
  Set up multi-node Minikube clusters for testing distributed systems, pod
  anti-affinity, node selectors, and failure scenarios in local Kubernetes
  development.
difficulty: advanced
tags:
  - minikube
  - create
  - multi-node
  - clusters
  - testing
  - deployment
  - docker
  - kubernetes
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Create Multi-Node Minikube Clusters skill?"
    answer: >-
      Set up multi-node Minikube clusters for testing distributed systems, pod
      anti-affinity, node selectors, and failure scenarios in local Kubernetes
      development. This skill provides a structured workflow for development
      tasks.
  - question: "What tools and setup does Create Multi-Node Minikube Clusters require?"
    answer: >-
      Requires Docker, kubectl installed. Works with minikube projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Create Multi-Node Minikube Clusters

## Overview
Minikube supports multi-node clusters to simulate real distributed Kubernetes environments locally. This lets you test node affinity, pod anti-affinity, rolling updates across nodes, and node failure scenarios without a remote cluster.

## Why This Matters
- **Realistic testing** — test pod scheduling, affinity, and topology spread
- **Failure simulation** — stop nodes to test resilience and failover
- **Rolling updates** — verify zero-downtime deployments across nodes
- **Node selectors** — test workload placement rules locally

## How It Works

### Step 1: Create a Multi-Node Cluster
```bash
# Start a 3-node cluster
minikube start --nodes 3 --driver=docker --cpus=2 --memory=4096

# Verify all nodes are ready
kubectl get nodes
# NAME           STATUS   ROLES           AGE   VERSION
# minikube       Ready    control-plane   60s   v1.28.3
# minikube-m02   Ready    <none>          30s   v1.28.3
# minikube-m03   Ready    <none>          15s   v1.28.3
```

### Step 2: Label Nodes for Workload Placement
```bash
# Add labels for zone simulation
kubectl label node minikube topology.kubernetes.io/zone=zone-a
kubectl label node minikube-m02 topology.kubernetes.io/zone=zone-b
kubectl label node minikube-m03 topology.kubernetes.io/zone=zone-c
```

### Step 3: Deploy with Pod Anti-Affinity
```yaml
# spread-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: web
      containers:
        - name: nginx
          image: nginx:1.25-alpine
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
```

### Step 4: Simulate Node Failures
```bash
# Stop a worker node
minikube node stop minikube-m03

# Watch pods reschedule to remaining nodes
kubectl get pods -o wide --watch

# Restart the node
minikube node start minikube-m03
```

### Step 5: Add or Remove Nodes
```bash
# Add a new node to running cluster
minikube node add

# Remove a node
minikube node delete minikube-m04
```

## Best Practices
- Allocate enough host resources (each node needs CPU/memory)
- Use node labels to simulate zones and regions
- Test topology spread constraints before deploying to production
- Use `minikube node stop/start` to test failure recovery
- Clean up multi-node clusters when done to free resources

## Common Mistakes
- Allocating too much per node (host runs out of resources)
- Forgetting that control-plane node also runs workloads by default
- Not using topology spread constraints (all pods land on one node)
- Leaving multi-node clusters running (drains laptop battery)
