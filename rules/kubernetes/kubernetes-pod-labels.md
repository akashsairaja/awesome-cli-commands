---
id: kubernetes-pod-labels
stackId: kubernetes
type: rule
name: Standard Pod Labels Convention
description: >-
  Apply consistent labels to all Kubernetes resources using the recommended
  label taxonomy — app.kubernetes.io labels for identification, versioning, and
  component classification.
difficulty: beginner
globs:
  - '**/*.yaml'
  - '**/*.yml'
  - '**/k8s/**'
  - '**/kubernetes/**'
  - '**/manifests/**'
tags:
  - labels
  - conventions
  - resource-management
  - selectors
  - organization
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
  - question: What labels should I put on Kubernetes resources?
    answer: >-
      Use the standard app.kubernetes.io label taxonomy: name (application),
      instance (unique deployment), version (app version), component
      (api/frontend/database), part-of (parent application), and managed-by
      (deployment tool). Add custom labels for team, environment, and cost
      center.
  - question: Why are Kubernetes labels important?
    answer: >-
      Labels enable service routing (selectors), monitoring discovery
      (Prometheus), cost allocation, GitOps management, and resource
      organization. Without consistent labels, you cannot effectively query,
      monitor, or manage resources at scale. They are the primary mechanism for
      grouping and selecting resources.
relatedItems:
  - kubernetes-resource-requirements
  - kubernetes-namespace-conventions
  - helm-chart-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Standard Pod Labels Convention

## Rule
All Kubernetes resources MUST include the standard `app.kubernetes.io` label set for consistent identification, selection, and tooling integration.

## Required Labels
```yaml
metadata:
  labels:
    app.kubernetes.io/name: myapp          # Application name
    app.kubernetes.io/instance: myapp-prod # Unique instance identifier
    app.kubernetes.io/version: "2.1.0"     # Application version
    app.kubernetes.io/component: api       # Component within architecture
    app.kubernetes.io/part-of: platform    # Higher-level application
    app.kubernetes.io/managed-by: helm     # Tool managing this resource
```

## Good Examples
```yaml
# API Deployment
metadata:
  name: payment-api
  labels:
    app.kubernetes.io/name: payment-api
    app.kubernetes.io/instance: payment-api-prod
    app.kubernetes.io/version: "3.2.1"
    app.kubernetes.io/component: api
    app.kubernetes.io/part-of: payment-platform
    app.kubernetes.io/managed-by: argocd
    team: payments
    environment: production

# Database StatefulSet
metadata:
  name: payment-db
  labels:
    app.kubernetes.io/name: payment-db
    app.kubernetes.io/instance: payment-db-prod
    app.kubernetes.io/version: "16.2"
    app.kubernetes.io/component: database
    app.kubernetes.io/part-of: payment-platform
    app.kubernetes.io/managed-by: helm
```

## Bad Examples
```yaml
# BAD: No labels
metadata:
  name: my-deployment

# BAD: Non-standard labels only
metadata:
  labels:
    app: myapp
    role: backend

# BAD: Missing version and component
metadata:
  labels:
    app.kubernetes.io/name: myapp
```

## Why Labels Matter
- **Service selection**: Services use label selectors to route traffic
- **Monitoring**: Prometheus discovers targets via labels
- **Cost allocation**: Labels enable per-team/per-app cost tracking
- **GitOps**: ArgoCD and Flux use labels for resource management

## Enforcement
- Use OPA Gatekeeper or Kyverno to require minimum label set
- Helm chart templates should include labels by default
- CI validation to reject manifests without required labels
