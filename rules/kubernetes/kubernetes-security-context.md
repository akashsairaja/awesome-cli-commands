---
id: kubernetes-security-context
stackId: kubernetes
type: rule
name: Mandatory Security Context for All Pods
description: >-
  Every pod must define a securityContext with non-root user, dropped
  capabilities, read-only root filesystem, and no privilege escalation to meet
  the Restricted Pod Security Standard.
difficulty: intermediate
globs:
  - '**/*.yaml'
  - '**/*.yml'
  - '**/k8s/**'
  - '**/kubernetes/**'
  - '**/manifests/**'
  - '**/helm/**'
tags:
  - security-context
  - non-root
  - capabilities
  - read-only-filesystem
  - pod-security
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
  - question: What is a Kubernetes securityContext and why is it required?
    answer: >-
      A securityContext defines privilege and access control settings for a pod
      or container. It specifies the user ID, group ID, filesystem permissions,
      Linux capabilities, and privilege escalation rules. It is required to
      prevent containers from running as root, accessing host resources, or
      escalating privileges.
  - question: How do I handle apps that need to write files with readOnlyRootFilesystem?
    answer: >-
      Mount emptyDir volumes at paths where the application needs to write
      (e.g., /tmp, /var/cache, /var/log). The root filesystem remains read-only
      for security, but the application can write to the mounted volumes. This
      prevents attackers from modifying application binaries.
relatedItems:
  - kubernetes-pod-labels
  - kubernetes-resource-requirements
  - kubernetes-pod-security
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Mandatory Security Context for All Pods

## Rule
Every pod MUST define a securityContext that meets the Restricted Pod Security Standard. No exceptions for application workloads.

## Required Security Context
```yaml
spec:
  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        runAsNonRoot: true
        runAsUser: 1001
        capabilities:
          drop: ["ALL"]
```

## Good Examples
```yaml
# Complete secure pod spec
apiVersion: v1
kind: Pod
metadata:
  name: secure-api
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    runAsGroup: 1001
    fsGroup: 1001
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: api
      image: myapi:2.0.0
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop: ["ALL"]
      volumeMounts:
        - name: tmp
          mountPath: /tmp
  volumes:
    - name: tmp
      emptyDir: {}
```

## Bad Examples
```yaml
# BAD: No securityContext at all
spec:
  containers:
    - name: app
      image: myapp:1.0

# BAD: Running as root
spec:
  securityContext:
    runAsUser: 0

# BAD: Privileged container
spec:
  containers:
    - name: app
      securityContext:
        privileged: true

# BAD: Allowing privilege escalation
spec:
  containers:
    - name: app
      securityContext:
        allowPrivilegeEscalation: true
```

## Handling Read-Only Root Filesystem
```yaml
# If your app needs to write to /tmp or /var/cache:
volumes:
  - name: tmp
    emptyDir: {}
  - name: cache
    emptyDir: {}
containers:
  - name: app
    securityContext:
      readOnlyRootFilesystem: true
    volumeMounts:
      - name: tmp
        mountPath: /tmp
      - name: cache
        mountPath: /var/cache
```

## Enforcement
- Enable Pod Security Admission with `enforce: restricted` on all app namespaces
- Use OPA Gatekeeper or Kyverno for custom policy enforcement
- CI validation with kubeconform + custom policies
- Regular audits with kubeaudit or Polaris
