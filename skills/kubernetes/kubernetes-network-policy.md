---
id: kubernetes-network-policy
stackId: kubernetes
type: skill
name: Kubernetes Network Policies
description: >-
  Implement Kubernetes NetworkPolicies to control pod-to-pod traffic, isolate
  namespaces, restrict egress to external services, and create zero-trust
  network segmentation.
difficulty: advanced
tags:
  - kubernetes
  - network
  - policies
  - testing
  - monitoring
  - architecture
  - api
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Kubernetes Network Policies skill?"
    answer: >-
      Implement Kubernetes NetworkPolicies to control pod-to-pod traffic,
      isolate namespaces, restrict egress to external services, and create
      zero-trust network segmentation. This skill provides a structured
      workflow for pod management, deployment strategies, security policies,
      and resource optimization.
  - question: "What tools and setup does Kubernetes Network Policies require?"
    answer: >-
      Works with standard Kubernetes tooling (kubectl, Helm). No special setup
      required beyond a working Kubernetes cluster environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Kubernetes Network Policies

## Overview
By default, all pods in a Kubernetes cluster can communicate with all other pods. NetworkPolicies let you define firewall rules at the pod level — controlling which pods can send and receive traffic, and to/from which destinations.

## Why This Matters
- **Zero-trust networking** — deny all traffic by default, allow only what is needed
- **Namespace isolation** — prevent cross-namespace access
- **Compliance** — required for PCI-DSS, HIPAA, SOC2 network segmentation
- **Blast radius reduction** — compromised pod cannot reach other services

## Step 1: Default Deny All Traffic
```yaml
# Apply to every namespace — deny all ingress and egress by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}  # Applies to ALL pods in namespace
  policyTypes:
    - Ingress
    - Egress
```

## Step 2: Allow Specific Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-ingress
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
        - namespaceSelector:
            matchLabels:
              name: monitoring
      ports:
        - protocol: TCP
          port: 8080
```

## Step 3: Allow Specific Egress
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-egress
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Egress
  egress:
    # Allow DNS resolution
    - to: []
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
    # Allow database access
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    # Allow external HTTPS
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
            except:
              - 10.0.0.0/8
              - 172.16.0.0/12
              - 192.168.0.0/16
      ports:
        - protocol: TCP
          port: 443
```

## Step 4: Three-Tier Architecture
```yaml
# Frontend: receives traffic from ingress, sends to API
# API: receives from frontend, sends to database and external
# Database: receives only from API, no egress

---
# Database: only API can connect
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-ingress
spec:
  podSelector:
    matchLabels:
      tier: database
  ingress:
    - from:
        - podSelector:
            matchLabels:
              tier: api
      ports:
        - port: 5432
```

## Testing Network Policies
```bash
# Deploy a debug pod
kubectl run nettest --image=busybox --rm -it -- sh

# Test connectivity
wget -qO- --timeout=3 http://api.production.svc:8080/health
nslookup api.production.svc.cluster.local

# Verify policy
kubectl get netpol -n production
kubectl describe netpol allow-api-ingress -n production
```

## Best Practices
- Start with default-deny in every namespace
- Always allow DNS egress (UDP/TCP port 53)
- Use labels consistently for pod selection
- Test policies with temporary debug pods before enforcing
- Document each policy with annotations explaining its purpose

## Common Mistakes
- Forgetting to allow DNS (breaks all service discovery)
- Using only ingress policies without egress (half-open firewall)
- Not verifying CNI supports NetworkPolicy (default kubenet does not)
- Overly broad ipBlock ranges that defeat the purpose
