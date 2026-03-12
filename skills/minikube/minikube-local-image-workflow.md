---
id: minikube-local-image-workflow
stackId: minikube
type: skill
name: Local Image Development Workflow with Minikube
description: >-
  Build and test container images locally with Minikube without pushing to a
  remote registry — using image loading, Docker environment sharing, and build
  caching.
difficulty: beginner
tags:
  - local-images
  - image-loading
  - docker-env
  - development-workflow
  - inner-loop
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - minikube installed and running
  - Docker or Podman for building images
faq:
  - question: How do I use local Docker images with minikube?
    answer: >-
      Three methods: (1) 'minikube image load myapp:tag' copies a host image
      into minikube. (2) 'eval $(minikube docker-env)' shares minikube's Docker
      daemon so builds happen inside minikube. (3) 'minikube image build' builds
      directly in minikube. Always set imagePullPolicy: Never in your
      deployment.
  - question: Why does Kubernetes say ImagePullBackOff for my local image?
    answer: >-
      Kubernetes defaults to pulling images from a registry. For local images,
      set imagePullPolicy: Never or IfNotPresent in your pod spec. Also verify
      the image exists in minikube with 'minikube image ls | grep myapp'.
relatedItems:
  - minikube-addon-management
  - minikube-dev-environment
  - minikube-multi-node-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Local Image Development Workflow with Minikube

## Overview
Minikube provides multiple ways to use locally built container images without pushing to a remote registry. This dramatically speeds up the inner development loop — build an image, load it into minikube, and deploy in seconds.

## Why This Matters
- **Fast iteration** — skip registry push/pull for every change
- **Offline development** — no internet required after initial image pulls
- **Cost savings** — no registry bandwidth or storage costs for dev images
- **Simpler setup** — no registry authentication to configure

## How It Works

### Method 1: minikube image load (Recommended)
```bash
# Build the image on your host
docker build -t myapp:dev .

# Load it into minikube's image cache
minikube image load myapp:dev

# Deploy using the local image
kubectl create deployment myapp --image=myapp:dev

# IMPORTANT: Set imagePullPolicy to Never or IfNotPresent
kubectl patch deployment myapp -p '{"spec":{"template":{"spec":{"containers":[{"name":"myapp","imagePullPolicy":"Never"}]}}}}'
```

### Method 2: minikube docker-env (Share Docker Daemon)
```bash
# Point your shell to minikube's Docker daemon
eval $(minikube docker-env)

# Now docker build runs INSIDE minikube
docker build -t myapp:dev .

# Image is immediately available to Kubernetes
kubectl create deployment myapp --image=myapp:dev

# Reset to host Docker when done
eval $(minikube docker-env --unset)
```

### Method 3: minikube image build (Build Directly)
```bash
# Build inside minikube without switching Docker context
minikube image build -t myapp:dev .

# Image is immediately available
kubectl run myapp --image=myapp:dev --image-pull-policy=Never
```

### Deployment YAML with imagePullPolicy
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: myapp:dev
          imagePullPolicy: Never  # Critical for local images
          ports:
            - containerPort: 3000
```

## Best Practices
- Use `imagePullPolicy: Never` for local-only images
- Use `minikube image load` for the simplest workflow
- Use `minikube docker-env` when you need build caching
- Tag local images with a dev tag to distinguish from registry images
- Use `minikube image rm` to clean up old local images

## Common Mistakes
- Forgetting to set `imagePullPolicy: Never` (Kubernetes tries to pull from registry)
- Using :latest tag without imagePullPolicy set (always pulls from registry)
- Building with host Docker but expecting minikube to find the image
- Not resetting docker-env when switching back to host Docker
