---
id: kubernetes-pod-security
stackId: kubernetes
type: skill
name: Kubernetes Pod Security Standards
description: >-
  Implement Pod Security Standards (PSS) to enforce security baselines across
  namespaces — restrict privileged containers, host access, capabilities, and
  volume types.
difficulty: intermediate
tags:
  - pod-security
  - psa
  - security-context
  - restricted
  - container-security
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Kubernetes 1.25+
  - Namespace admin access
  - Basic pod security concepts
faq:
  - question: What are Kubernetes Pod Security Standards?
    answer: >-
      Pod Security Standards (PSS) define three security profiles: Privileged
      (no restrictions), Baseline (blocks known privilege escalations), and
      Restricted (hardened best practices). Pod Security Admission (PSA)
      enforces these profiles at the namespace level, replacing the deprecated
      PodSecurityPolicy.
  - question: What is the difference between Baseline and Restricted pod security?
    answer: >-
      Baseline blocks dangerous configurations like privileged containers,
      hostNetwork, and hostPID but allows running as root. Restricted adds
      requirements: non-root user, dropped ALL capabilities, seccomp profile, no
      privilege escalation, and read-only root filesystem. Use Restricted for
      production workloads.
  - question: How do I migrate existing workloads to Restricted pod security?
    answer: >-
      Start by labeling namespaces with 'warn: restricted' to see which pods
      violate the policy without blocking them. Fix non-compliant workloads by
      adding securityContext settings. Then switch to 'audit: restricted' for
      logging, and finally 'enforce: restricted' when all workloads comply.
relatedItems:
  - kubernetes-rbac-specialist
  - kubernetes-network-policy
  - docker-non-root-containers
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Kubernetes Pod Security Standards

## Overview
Pod Security Standards (PSS) define three security profiles — Privileged, Baseline, and Restricted — that control what pods can and cannot do. Since Kubernetes 1.25, Pod Security Admission (PSA) is the built-in enforcement mechanism replacing the deprecated PodSecurityPolicy.

## Why This Matters
- **Prevent container escapes** — restrict host namespace access and privileged mode
- **Compliance** — SOC2, HIPAA, PCI-DSS require container security controls
- **Defense in depth** — even if RBAC is misconfigured, PSS limits what pods can do
- **Cluster-wide baseline** — consistent security across all namespaces

## Security Profiles

### Privileged (No restrictions)
```yaml
# Only for system-level workloads (CNI, storage drivers)
# NEVER for application workloads
```

### Baseline (Prevent known privilege escalations)
```yaml
# Blocks: privileged containers, hostNetwork, hostPID, hostIPC
# Allows: Running as root (not ideal), most volume types
```

### Restricted (Hardened best practices)
```yaml
# Blocks: All of Baseline + running as root + privilege escalation
# Requires: Non-root user, seccomp profile, dropped capabilities
```

## Step 1: Enable PSA on Namespaces
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

## Step 2: Configure Pods for Restricted Profile
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      image: myapp:1.0.0
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        runAsNonRoot: true
        runAsUser: 1001
        capabilities:
          drop: ["ALL"]
      resources:
        requests:
          memory: "128Mi"
          cpu: "100m"
        limits:
          memory: "256Mi"
          cpu: "500m"
```

## Step 3: Apply to All Application Namespaces
```bash
# Label existing namespaces
kubectl label namespace production \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/audit=restricted \
  pod-security.kubernetes.io/warn=restricted

# Dry-run to check existing workloads
kubectl label --dry-run=server --overwrite namespace production \
  pod-security.kubernetes.io/enforce=restricted
```

## Step 4: Handle Exceptions
```yaml
# For system namespaces that need privileged access
apiVersion: v1
kind: Namespace
metadata:
  name: kube-system
  labels:
    pod-security.kubernetes.io/enforce: privileged
    pod-security.kubernetes.io/audit: baseline
    pod-security.kubernetes.io/warn: restricted
```

## Best Practices
- Start with `warn` mode to identify non-compliant workloads before enforcing
- Use `restricted` for all application namespaces
- Only use `privileged` for system namespaces (kube-system, monitoring agents)
- Always set `allowPrivilegeEscalation: false` and drop ALL capabilities
- Enable `readOnlyRootFilesystem: true` and mount tmpfs where writes are needed

## Common Mistakes
- Jumping straight to `enforce` without auditing existing workloads
- Granting privileged profile to application namespaces "just to make it work"
- Forgetting seccompProfile (required for restricted profile)
- Not dropping ALL capabilities before adding back specific ones
