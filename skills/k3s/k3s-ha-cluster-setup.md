---
id: k3s-ha-cluster-setup
stackId: k3s
type: skill
name: Set Up a High-Availability K3s Cluster
description: >-
  Deploy a production-ready HA K3s cluster with embedded etcd, multiple server
  nodes, worker agents, and automated failover for lightweight Kubernetes.
difficulty: advanced
tags:
  - k3s
  - set
  - high-availability
  - cluster
  - api
  - kubernetes
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Set Up a High-Availability K3s Cluster skill?"
    answer: >-
      Deploy a production-ready HA K3s cluster with embedded etcd, multiple
      server nodes, worker agents, and automated failover for lightweight
      Kubernetes. This skill provides a structured workflow for development
      tasks.
  - question: "What tools and setup does Set Up a High-Availability K3s Cluster require?"
    answer: >-
      Requires kubectl installed. Works with k3s projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Set Up a High-Availability K3s Cluster

## Overview
A high-availability K3s cluster uses embedded etcd across 3+ server nodes to eliminate single points of failure. If one server goes down, the remaining nodes maintain quorum and the cluster continues operating. This setup is ideal for production workloads that need reliability without the overhead of full Kubernetes.

## Why This Matters
- **No single point of failure** — cluster survives server node loss
- **Automatic leader election** — etcd handles failover transparently
- **Production-grade** — same HA guarantees as upstream Kubernetes
- **Lightweight** — uses a fraction of the resources of kubeadm HA

## How It Works

### Step 1: Initialize the First Server Node
```bash
# On server-1 (initializes the embedded etcd cluster)
curl -sfL https://get.k3s.io | K3S_TOKEN="my-secure-token-change-me" sh -s - server \
  --cluster-init \
  --tls-san=k3s-api.example.com \
  --tls-san=10.0.0.10 \
  --node-taint CriticalAddonsOnly=true:NoExecute \
  --write-kubeconfig-mode 644

# Verify the first node is ready
sudo k3s kubectl get nodes
```

### Step 2: Join Additional Server Nodes
```bash
# On server-2 and server-3
curl -sfL https://get.k3s.io | K3S_TOKEN="my-secure-token-change-me" sh -s - server \
  --server https://10.0.0.10:6443 \
  --tls-san=k3s-api.example.com \
  --tls-san=10.0.0.10 \
  --node-taint CriticalAddonsOnly=true:NoExecute

# Verify all server nodes joined
sudo k3s kubectl get nodes
```

### Step 3: Join Worker Agent Nodes
```bash
# On worker nodes (agent-1, agent-2, etc.)
curl -sfL https://get.k3s.io | K3S_TOKEN="my-secure-token-change-me" \
  K3S_URL=https://10.0.0.10:6443 sh -

# Verify all nodes are visible
sudo k3s kubectl get nodes
```

### Step 4: Set Up Load Balancer for API Server
```bash
# Install HAProxy or use cloud LB pointing to all server nodes
# /etc/haproxy/haproxy.cfg
# frontend k3s-api
#   bind *:6443
#   default_backend k3s-servers
#
# backend k3s-servers
#   balance roundrobin
#   server server-1 10.0.0.10:6443 check
#   server server-2 10.0.0.11:6443 check
#   server server-3 10.0.0.12:6443 check
```

### Step 5: Configure Automated Backups
```bash
# K3s automatically snapshots etcd — configure retention
# Add to /etc/systemd/system/k3s.service or install script:
# --etcd-snapshot-schedule-cron="0 */6 * * *"
# --etcd-snapshot-retention=10

# Manual snapshot
sudo k3s etcd-snapshot save --name pre-upgrade-backup

# List snapshots
sudo k3s etcd-snapshot ls
```

## Best Practices
- Always use an odd number of server nodes (3 or 5) for etcd quorum
- Set `--node-taint` on server nodes to prevent workload scheduling
- Use `--tls-san` to add load balancer DNS/IP for external access
- Configure etcd snapshot scheduling for automated backups
- Use a load balancer in front of server nodes for API access
- Change the default token to a strong random value

## Common Mistakes
- Using 2 server nodes (no quorum — 1 failure kills the cluster)
- Not setting --tls-san (certificate errors when accessing via LB)
- Scheduling workloads on server nodes (resource contention with etcd)
- Using the same token across different clusters (security risk)
- Not configuring etcd backups (data loss on simultaneous failures)
