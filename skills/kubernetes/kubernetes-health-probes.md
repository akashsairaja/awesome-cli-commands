---
id: kubernetes-health-probes
stackId: kubernetes
type: skill
name: Kubernetes Health Probes Configuration
description: >-
  Configure liveness, readiness, and startup probes to ensure Kubernetes
  automatically detects and recovers from application failures, manages traffic
  routing, and handles slow-starting containers.
difficulty: beginner
tags:
  - health-probes
  - liveness
  - readiness
  - startup-probe
  - self-healing
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Kubernetes 1.28+
  - Basic Deployment knowledge
faq:
  - question: >-
      What is the difference between liveness and readiness probes in
      Kubernetes?
    answer: >-
      Liveness probe answers 'is the container alive?' — failure triggers a
      container restart. Readiness probe answers 'can this container serve
      traffic?' — failure removes the pod from Service endpoints (load
      balancer). A container can be alive but not ready (e.g., during warmup or
      when a dependency is down).
  - question: When should I use a Kubernetes startup probe?
    answer: >-
      Use a startup probe for containers that take more than 10-15 seconds to
      initialize (e.g., JVM warmup, loading ML models, database migrations). The
      startup probe disables liveness and readiness probes until the container
      is fully started, preventing premature restarts.
  - question: Why should liveness probes not check external dependencies?
    answer: >-
      If a liveness probe checks the database and the database goes down
      temporarily, Kubernetes restarts ALL pods, creating a cascading failure
      when the database recovers. Liveness should only verify the container
      process is healthy. Use readiness probes to check external dependencies.
relatedItems:
  - kubernetes-resource-management
  - kubernetes-pod-security
  - docker-health-checks
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Kubernetes Health Probes Configuration

## Overview
Kubernetes uses three types of probes to monitor container health: liveness (restart if dead), readiness (route traffic only when ready), and startup (wait for slow starts). Proper probe configuration is the difference between a self-healing cluster and cascading failures.

## Why This Matters
- **Self-healing** — Kubernetes automatically restarts unhealthy containers
- **Zero-downtime deploys** — traffic only routes to ready pods
- **Graceful degradation** — temporarily remove overloaded pods from the load balancer
- **Slow startup handling** — prevent liveness probe from killing slow-starting apps

## The Three Probes

### Liveness Probe
```yaml
# "Is the container alive?" — if no, Kubernetes restarts it
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 20
  timeoutSeconds: 5
  failureThreshold: 3
```

### Readiness Probe
```yaml
# "Can this container serve traffic?" — if no, remove from Service endpoints
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3
  successThreshold: 1
```

### Startup Probe
```yaml
# "Has the container finished starting?" — disables liveness/readiness until success
startupProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 30  # 30 * 10s = 5 minutes to start
```

## Complete Example
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: myapi:2.1.0
          ports:
            - containerPort: 8080
          startupProbe:
            httpGet:
              path: /healthz
              port: 8080
            periodSeconds: 10
            failureThreshold: 30
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            periodSeconds: 20
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 3
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
```

## Probe Types
```yaml
# HTTP GET (most common for web services)
httpGet:
  path: /healthz
  port: 8080
  httpHeaders:
    - name: Accept
      value: application/json

# TCP Socket (for non-HTTP services like databases)
tcpSocket:
  port: 5432

# Exec Command (run a script inside the container)
exec:
  command:
    - /bin/sh
    - -c
    - pg_isready -U postgres
```

## Best Practices
- Always use all three probes for production workloads
- Liveness endpoint should check only the process, not dependencies
- Readiness endpoint should check dependencies (database, cache)
- Use startup probe for apps that take > 10 seconds to initialize
- Set timeouts shorter than intervals
- Readiness failureThreshold lower than liveness (remove from LB before restart)

## Common Mistakes
- Making liveness probe check database connectivity (causes restart cascades)
- Setting initialDelaySeconds too low (kills containers during startup)
- Not using startup probe for slow apps (liveness kills them before ready)
- Using the same endpoint for liveness and readiness (different concerns)
