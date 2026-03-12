---
id: minikube-image-pull-policy
stackId: minikube
type: rule
name: Image Pull Policy for Local Development
description: >-
  Enforce correct imagePullPolicy settings when using locally loaded images in
  minikube to prevent ImagePullBackOff errors and unnecessary registry pulls.
difficulty: beginner
globs:
  - '**/k8s/**/*.yaml'
  - '**/deploy/**/*.yaml'
  - '**/manifests/**/*.yaml'
  - '**/values*.yaml'
tags:
  - image-pull-policy
  - local-images
  - imagepullbackoff
  - development-config
  - kubernetes-debugging
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Why do I get ImagePullBackOff when using local images in minikube?
    answer: >-
      Kubernetes defaults to pulling images from a registry. If your image only
      exists locally (loaded via 'minikube image load'), you must set
      imagePullPolicy: Never in your pod spec. Without this, Kubernetes tries to
      pull from Docker Hub and fails.
  - question: When should I use Never vs IfNotPresent for imagePullPolicy?
    answer: >-
      Use Never when the image exists only in minikube's local cache (loaded
      with 'minikube image load'). Use IfNotPresent when the image might come
      from either a registry or local cache. Never use Always with local-only
      images.
relatedItems:
  - minikube-resource-allocation
  - minikube-local-image-workflow
  - minikube-dev-environment
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Image Pull Policy for Local Development

## Rule
All deployments using locally loaded images MUST set imagePullPolicy to Never or IfNotPresent. Never use Always with local-only images.

## Format
```yaml
containers:
  - name: app
    image: myapp:dev
    imagePullPolicy: Never  # For minikube image load
```

## Requirements
1. **Local images** — set `imagePullPolicy: Never` when using `minikube image load`
2. **Shared images** — set `imagePullPolicy: IfNotPresent` when image may come from registry or local
3. **Never use :latest** — without explicit imagePullPolicy (defaults to Always)
4. **Tag convention** — use `:dev` or `:local` tags for locally built images
5. **Deployment templates** — include imagePullPolicy in all Helm values and Kustomize patches

## Examples

### Good
```yaml
# Local development deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      containers:
        - name: myapp
          image: myapp:dev
          imagePullPolicy: Never

# Helm values for local dev
# values-local.yaml
image:
  repository: myapp
  tag: dev
  pullPolicy: Never
```

### Bad
```yaml
# Missing imagePullPolicy with local image
containers:
  - name: myapp
    image: myapp:latest
    # Default: Always — will fail with ImagePullBackOff

# Using Always with local-only image
containers:
  - name: myapp
    image: myapp:dev
    imagePullPolicy: Always  # Tries to pull from registry
```

## Enforcement
Use Kustomize overlays or Helm values files to set imagePullPolicy per environment. Lint YAML in CI to warn about missing imagePullPolicy on non-standard images.
