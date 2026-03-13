---
id: minikube-multi-node-setup
stackId: minikube
type: skill
name: Create Multi-Node Minikube Clusters
description: >-
  Set up multi-node Minikube clusters for testing distributed systems — pod
  anti-affinity, topology spread constraints, node selectors, failure
  simulation, HA control planes, and resource management.
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
      Use multi-node Minikube clusters when you need to test Kubernetes
      scheduling behavior locally — pod anti-affinity, topology spread
      constraints, node selectors, rolling updates across nodes, and node
      failure recovery. Single-node clusters cannot validate any of these
      behaviors because every scheduling decision is trivial with one node.
  - question: "What tools and setup does Create Multi-Node Minikube Clusters require?"
    answer: >-
      Requires minikube, kubectl, and Docker (or another supported driver like
      HyperKit, Hyper-V, or KVM2). Each node consumes CPU and memory on the
      host — plan for 2 CPUs and 2-4GB RAM per node minimum.
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# Create Multi-Node Minikube Clusters

## Overview

Single-node Minikube cannot simulate distributed Kubernetes behavior. When there is only one node, every scheduling decision is trivial — affinity rules become no-ops, topology constraints have nothing to spread across, and node failure is total cluster failure. Multi-node clusters let you test the behaviors that matter in production: pod placement, rolling updates across nodes, zone-aware scheduling, and graceful node failure recovery.

## Create a Multi-Node Cluster

```bash
# 3-node cluster with Docker driver (recommended)
minikube start --nodes 3 --driver=docker --cpus=2 --memory=4096

# Verify all nodes are ready
kubectl get nodes -o wide
# NAME           STATUS   ROLES           AGE   VERSION   INTERNAL-IP
# minikube       Ready    control-plane   60s   v1.30.0   192.168.49.2
# minikube-m02   Ready    <none>          30s   v1.30.0   192.168.49.3
# minikube-m03   Ready    <none>          15s   v1.30.0   192.168.49.4
```

The `--cpus` and `--memory` flags apply per node. A 3-node cluster with `--cpus=2 --memory=4096` uses 6 CPUs and 12GB RAM total on your host. Plan accordingly.

### Driver Selection

```bash
# Docker (recommended — fastest, least overhead)
minikube start --nodes 3 --driver=docker

# Hyperkit (macOS — better network isolation)
minikube start --nodes 3 --driver=hyperkit

# KVM2 (Linux — full VM isolation)
minikube start --nodes 3 --driver=kvm2

# Hyper-V (Windows)
minikube start --nodes 3 --driver=hyperv
```

Docker driver creates container-based nodes (fastest startup, lowest overhead). VM-based drivers provide better isolation but consume more resources and take longer to start.

## Label Nodes for Zone Simulation

Production clusters span availability zones. Simulate this by labeling your minikube nodes:

```bash
# Simulate availability zones
kubectl label node minikube topology.kubernetes.io/zone=zone-a
kubectl label node minikube-m02 topology.kubernetes.io/zone=zone-b
kubectl label node minikube-m03 topology.kubernetes.io/zone=zone-c

# Simulate node roles
kubectl label node minikube-m02 workload=compute
kubectl label node minikube-m03 workload=compute

# Simulate instance types
kubectl label node minikube-m02 node.kubernetes.io/instance-type=m5.large
kubectl label node minikube-m03 node.kubernetes.io/instance-type=c5.xlarge

# Verify labels
kubectl get nodes --show-labels
```

These labels are identical to what cloud providers assign automatically. Code that works with these labels on minikube will work on EKS, GKE, or AKS without changes.

## Topology Spread Constraints

Topology spread constraints distribute pods evenly across topology domains (nodes, zones, regions). This is the modern replacement for pod anti-affinity for most use cases:

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
        # Spread evenly across nodes
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: web
        # Also spread across zones
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
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
            limits:
              cpu: 200m
              memory: 128Mi
```

```bash
# Apply and verify spread
kubectl apply -f spread-deployment.yaml
kubectl get pods -o wide
# Each pod should be on a different node
```

The `maxSkew: 1` with `DoNotSchedule` means the scheduler will not place a pod if it would create more than 1 pod difference between any two nodes. With 3 replicas and 3 nodes, you get exactly one pod per node.

## Pod Anti-Affinity

For more complex scheduling rules, use pod anti-affinity:

```yaml
# anti-affinity-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 3
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      affinity:
        # Hard rule: never two redis pods on the same node
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchExpressions:
                  - key: app
                    operator: In
                    values:
                      - redis
              topologyKey: kubernetes.io/hostname
        # Soft rule: prefer nodes in different zones
        podAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - web
                topologyKey: topology.kubernetes.io/zone
      containers:
        - name: redis
          image: redis:7-alpine
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
```

## Node Selectors and Taints

```bash
# Taint a node (only pods that tolerate the taint can schedule)
kubectl taint nodes minikube-m03 dedicated=gpu:NoSchedule

# Verify taint
kubectl describe node minikube-m03 | grep -A5 Taints
```

```yaml
# gpu-workload.yaml — only schedules on tainted node
apiVersion: v1
kind: Pod
metadata:
  name: gpu-job
spec:
  nodeSelector:
    workload: compute
  tolerations:
    - key: dedicated
      operator: Equal
      value: gpu
      effect: NoSchedule
  containers:
    - name: compute
      image: python:3.12-slim
      command: ["python", "-c", "print('Running on dedicated node')"]
```

## Simulate Node Failures

Testing resilience requires breaking things intentionally:

```bash
# Stop a worker node (simulates node failure)
minikube node stop minikube-m03

# Watch pods reschedule to remaining nodes
kubectl get pods -o wide --watch

# Check node status — should show NotReady
kubectl get nodes

# Restart the failed node
minikube node start minikube-m03

# Watch pods rebalance (depends on your scheduling rules)
kubectl get pods -o wide --watch
```

### Controlled Drain Test

```bash
# Gracefully drain a node (respects PodDisruptionBudgets)
kubectl drain minikube-m02 --ignore-daemonsets --delete-emptydir-data

# Verify pods moved to other nodes
kubectl get pods -o wide

# Uncordon the node to allow scheduling again
kubectl uncordon minikube-m02
```

The difference between `minikube node stop` and `kubectl drain` is important: `stop` simulates a sudden failure (crash, network partition), while `drain` simulates a planned maintenance event. Test both.

## Dynamic Node Management

```bash
# Add a new worker node to a running cluster
minikube node add

# Add a node with a specific name
minikube node add --worker

# Remove a node
minikube node delete minikube-m04

# List all nodes
minikube node list
```

## High Availability Control Plane

Minikube supports multi-control-plane clusters for testing HA configurations:

```bash
# Start with 3 control plane nodes and 2 workers
minikube start --ha --nodes 5 --driver=docker --cpus=2 --memory=4096

# Verify HA setup
kubectl get nodes
# 3 nodes with role control-plane, 2 with <none> (workers)
```

HA clusters require more resources but let you test control plane failure scenarios — what happens when a control plane node goes down, API server failover, etcd quorum loss.

## Resource Management

Multi-node clusters consume significant host resources. Manage them carefully:

```bash
# Check resource usage per node
kubectl top nodes

# Check resource allocation
kubectl describe node minikube | grep -A10 "Allocated resources"

# Pause the cluster (saves resources, preserves state)
minikube pause

# Resume the cluster
minikube unpause

# Stop the cluster entirely (frees all resources)
minikube stop

# Delete the cluster and all data
minikube delete
```

### Profile-Based Cluster Management

Run multiple named clusters for different testing scenarios:

```bash
# Create a profile for multi-node testing
minikube start -p multi-node --nodes 3 --driver=docker

# Create a separate profile for HA testing
minikube start -p ha-test --ha --nodes 5 --driver=docker

# Switch between profiles
minikube profile multi-node
minikube profile ha-test

# List all profiles
minikube profile list

# Delete a specific profile
minikube delete -p ha-test
```

## Testing Rolling Updates Across Nodes

```bash
# Deploy v1 across all nodes
kubectl apply -f spread-deployment.yaml
kubectl set image deployment/web nginx=nginx:1.24-alpine

# Trigger a rolling update and watch node-by-node progress
kubectl set image deployment/web nginx=nginx:1.25-alpine
kubectl rollout status deployment/web
kubectl get pods -o wide --watch
```

With topology spread constraints, the rolling update replaces one pod per node at a time, maintaining availability across all nodes throughout the update.

## Best Practices

- Allocate realistic resources per node — starving nodes masks scheduling issues. Use at least 2 CPUs and 2GB RAM per node.
- Use node labels that match your cloud provider's conventions (topology.kubernetes.io/zone, node.kubernetes.io/instance-type) so manifests are portable.
- Test both sudden failure (`minikube node stop`) and graceful drain (`kubectl drain`) — they exercise different code paths.
- Use topology spread constraints over pod anti-affinity for most use cases — they are more flexible and easier to reason about.
- Clean up multi-node clusters when done — three Docker containers consuming 12GB RAM will drain a laptop battery fast.
- Use profiles to maintain separate cluster configurations for different test scenarios.
- Set resource requests on all pods — without requests, the scheduler cannot make informed placement decisions.

## Common Pitfalls

- Allocating too much per node and running out of host resources — a swapping host gives misleading performance results.
- Forgetting that the control-plane node runs workloads by default in minikube — taint it if you want dedicated worker testing.
- Not setting resource requests on pods — without requests, topology spread constraints and affinity rules work but scheduling quality degrades.
- Testing scheduling on a single-node cluster — affinity, anti-affinity, and topology spread do nothing with one node. Syntax validates, but behavior does not.
- Leaving multi-node clusters running in the background — use `minikube pause` when not actively testing.
