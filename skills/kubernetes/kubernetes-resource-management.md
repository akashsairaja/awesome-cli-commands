---
id: kubernetes-resource-management
stackId: kubernetes
type: skill
name: >-
  Kubernetes Resource Requests & Limits
description: >-
  Configure CPU and memory requests and limits for Kubernetes workloads —
  prevent OOMKilled errors, avoid CPU throttling, optimize cluster
  utilization, and set up resource quotas.
difficulty: advanced
tags:
  - kubernetes
  - resource
  - requests
  - limits
  - api
  - machine-learning
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
  - question: "When should I use the Kubernetes Resource Requests & Limits skill?"
    answer: >-
      Configure CPU and memory requests and limits for Kubernetes workloads —
      prevent OOMKilled errors, avoid CPU throttling, optimize cluster
      utilization, and set up resource quotas. It includes practical examples
      for Kubernetes cluster development.
  - question: "What tools and setup does Kubernetes Resource Requests & Limits require?"
    answer: >-
      Works with standard Kubernetes tooling (kubectl, Helm). Review the setup
      section in the skill content for specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Kubernetes Resource Requests & Limits

## Overview
Resource requests and limits control how much CPU and memory each container can use. Requests guarantee minimum resources for scheduling. Limits cap maximum usage to prevent noisy neighbors. Misconfigured resources cause OOMKilled errors, CPU throttling, and scheduling failures.

## Why This Matters
- **Scheduling** — Kubernetes uses requests to decide which node can host a pod
- **Stability** — limits prevent runaway containers from consuming all node resources
- **Cost** — right-sized requests avoid wasting cluster capacity
- **QoS** — request/limit ratios determine eviction priority

## Resource Configuration
```yaml
containers:
  - name: api
    image: myapi:2.0
    resources:
      requests:
        memory: "256Mi"   # Guaranteed minimum
        cpu: "250m"       # 0.25 CPU cores
      limits:
        memory: "512Mi"   # Maximum before OOMKilled
        # Note: CPU limit omitted intentionally (see best practices)
```

## CPU vs Memory Behavior
| Resource | Over Request | Over Limit |
|----------|-------------|------------|
| CPU | Throttled (slowed down) | Throttled |
| Memory | OK if available | OOMKilled (container killed) |

## QoS Classes
```yaml
# Guaranteed: requests == limits (highest priority, last to be evicted)
resources:
  requests: { memory: "256Mi", cpu: "250m" }
  limits: { memory: "256Mi", cpu: "250m" }

# Burstable: requests < limits (medium priority)
resources:
  requests: { memory: "128Mi", cpu: "100m" }
  limits: { memory: "256Mi" }

# BestEffort: no requests or limits (lowest priority, first evicted)
# (never use in production)
```

## Namespace Resource Quotas
```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-quota
  namespace: team-a
spec:
  hard:
    requests.cpu: "10"
    requests.memory: "20Gi"
    limits.cpu: "20"
    limits.memory: "40Gi"
    pods: "50"
```

## LimitRange (Default Limits)
```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: production
spec:
  limits:
    - default:
        memory: "256Mi"
      defaultRequest:
        memory: "128Mi"
        cpu: "100m"
      max:
        memory: "2Gi"
        cpu: "2"
      min:
        memory: "64Mi"
        cpu: "50m"
      type: Container
```

## Sizing Guide
```bash
# Observe actual usage for 7 days before setting limits
kubectl top pods -n production --sort-by=memory

# Use Vertical Pod Autoscaler in recommendation mode
kubectl get vpa -n production -o yaml
```

## Best Practices
- Always set memory requests AND limits (OOMKilled is unrecoverable)
- Set CPU requests but consider omitting CPU limits (throttling causes latency)
- Start with requests = observed P95 usage, limits = 2x requests for memory
- Use LimitRange to set defaults for pods that forget to specify resources
- Use ResourceQuota to cap total namespace resource consumption
- Monitor with VPA recommendations before setting final values

## Common Mistakes
- Not setting any resources (BestEffort QoS, first to be evicted)
- Setting CPU limits too low (causes throttling and latency spikes)
- Setting memory limits equal to requests (no burst room, frequent OOMKilled)
- Overcommitting requests (scheduler thinks cluster is full, pods Pending)
