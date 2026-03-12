---
id: kubernetes-resource-requirements
stackId: kubernetes
type: rule
name: Always Set Resource Requests and Limits
description: >-
  Every container in a Kubernetes pod specification must define CPU and memory
  requests and limits to ensure predictable scheduling, prevent resource
  starvation, and enable cluster autoscaling.
difficulty: beginner
globs:
  - '**/*.yaml'
  - '**/*.yml'
  - '**/k8s/**'
  - '**/kubernetes/**'
  - '**/manifests/**'
  - '**/helm/**'
tags:
  - resource-requests
  - resource-limits
  - scheduling
  - oomkilled
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: Why must every Kubernetes container have resource requests and limits?
    answer: >-
      Without requests, the scheduler cannot make informed placement decisions
      and pods get BestEffort QoS (first evicted under pressure). Without memory
      limits, a single container can consume all node memory and crash other
      workloads. Resource specs are required for predictable scheduling,
      autoscaling, and stability.
  - question: What happens if I set Kubernetes resource limits too low?
    answer: >-
      Memory limits too low cause OOMKilled errors — the container is killed and
      restarted. CPU limits too low cause throttling — the container runs slowly
      but is not killed. Start with observed P95 usage for requests and 1.5-2x
      for memory limits.
relatedItems:
  - kubernetes-pod-labels
  - kubernetes-health-probes
  - kubernetes-resource-management
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Always Set Resource Requests and Limits

## Rule
Every container MUST define resource requests for CPU and memory. Memory limits MUST be set. CPU limits SHOULD be set in multi-tenant clusters.

## Format
```yaml
resources:
  requests:
    memory: "<amount>"
    cpu: "<amount>"
  limits:
    memory: "<amount>"
```

## Good Examples
```yaml
# Web API
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"

# Worker/background job
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"

# Database sidecar
resources:
  requests:
    memory: "64Mi"
    cpu: "50m"
  limits:
    memory: "128Mi"
```

## Bad Examples
```yaml
# BAD: No resources at all (BestEffort QoS — first to be evicted)
containers:
  - name: api
    image: myapi:1.0

# BAD: Limits without requests (requests default to limits — overcommits)
resources:
  limits:
    memory: "2Gi"
    cpu: "2"

# BAD: Requests much higher than actual usage (wastes cluster capacity)
resources:
  requests:
    memory: "4Gi"    # App only uses 200Mi
    cpu: "2"         # App only uses 100m
```

## Enforcement
- Use LimitRange to set defaults for pods without explicit resources
- Use ResourceQuota to cap total namespace consumption
- Configure OPA Gatekeeper or Kyverno to reject pods without resource specs
- Enable the `LimitRanger` admission controller (enabled by default)
