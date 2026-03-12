---
id: helm-values-structure
stackId: helm
type: skill
name: Helm Values Design & Schema Validation
description: >-
  Design well-structured Helm values.yaml files with clear sections, sensible
  defaults, JSON schema validation, and per-environment overrides for reliable
  Kubernetes deployments.
difficulty: intermediate
tags:
  - helm-values
  - schema-validation
  - chart-configuration
  - overrides
  - helm-docs
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Helm 3.14+
  - YAML knowledge
  - Basic Kubernetes concepts
faq:
  - question: How should Helm values.yaml be structured?
    answer: >-
      Group related settings: image (repository, tag, pullPolicy), service
      (type, port), resources (requests, limits), autoscaling (enabled, min,
      max), ingress (enabled, hosts, tls). Comment every value. Provide
      production-safe defaults. Use per-environment override files for dev,
      staging, production.
  - question: What is a Helm values schema and why should I use one?
    answer: >-
      A values.schema.json file validates values before template rendering. It
      catches errors like wrong types (string instead of number), missing
      required fields, and invalid enum values at 'helm install' time instead of
      at Kubernetes apply time. Use JSON Schema draft 2020-12 format.
relatedItems:
  - helm-chart-architect
  - helm-template-patterns
  - kubernetes-resource-requirements
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Helm Values Design & Schema Validation

## Overview
The values.yaml file is the public interface of a Helm chart. Well-structured values with documentation, defaults, and validation enable teams to confidently configure deployments across environments.

## Why This Matters
- **Self-documenting** — commented values explain what each setting does
- **Safe defaults** — works out of the box with sane production settings
- **Validation** — JSON schema catches misconfigurations before deployment
- **Multi-environment** — override files for dev, staging, production

## Standard Values Structure
```yaml
# values.yaml

# -- Number of replicas
replicaCount: 1

image:
  # -- Container image repository
  repository: myapp
  # -- Image pull policy
  pullPolicy: IfNotPresent
  # -- Image tag (defaults to chart appVersion)
  tag: ""

# -- Image pull secrets for private registries
imagePullSecrets: []

serviceAccount:
  # -- Create a ServiceAccount
  create: true
  # -- ServiceAccount annotations
  annotations: {}
  # -- ServiceAccount name (auto-generated if empty)
  name: ""

service:
  # -- Service type
  type: ClusterIP
  # -- Service port
  port: 80
  # -- Container target port
  targetPort: 8080

ingress:
  # -- Enable ingress
  enabled: false
  # -- Ingress class name
  className: nginx
  # -- Ingress annotations
  annotations: {}
  # -- Ingress hosts
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix
  # -- TLS configuration
  tls: []

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    memory: 256Mi

autoscaling:
  # -- Enable Horizontal Pod Autoscaler
  enabled: false
  # -- Minimum replicas
  minReplicas: 2
  # -- Maximum replicas
  maxReplicas: 10
  # -- Target CPU utilization percentage
  targetCPUUtilizationPercentage: 80

# -- Pod disruption budget
podDisruptionBudget:
  enabled: false
  minAvailable: 1

# -- Liveness probe configuration
livenessProbe:
  httpGet:
    path: /healthz
    port: http
  initialDelaySeconds: 15
  periodSeconds: 20

# -- Readiness probe configuration
readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 5
  periodSeconds: 10

# -- Environment variables
env: []

# -- Extra volume mounts
extraVolumeMounts: []

# -- Extra volumes
extraVolumes: []
```

## Per-Environment Overrides
```yaml
# values-production.yaml
replicaCount: 3

resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    memory: 1Gi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: api.myapp.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: api-tls
      hosts:
        - api.myapp.com

podDisruptionBudget:
  enabled: true
  minAvailable: 2
```

## JSON Schema Validation
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["image", "service"],
  "properties": {
    "replicaCount": {
      "type": "integer",
      "minimum": 1
    },
    "image": {
      "type": "object",
      "required": ["repository"],
      "properties": {
        "repository": { "type": "string" },
        "tag": { "type": "string" },
        "pullPolicy": {
          "type": "string",
          "enum": ["Always", "IfNotPresent", "Never"]
        }
      }
    }
  }
}
```

## Best Practices
- Comment every value with `# --` prefix (helm-docs compatible)
- Provide sensible defaults that work for development
- Use per-environment override files (values-production.yaml)
- Add JSON schema (values.schema.json) for validation
- Group related values (image.*, service.*, autoscaling.*)
- Always include resource requests and limits in defaults

## Common Mistakes
- Undocumented values (users guess what settings do)
- No resource limits in defaults (pods without limits)
- Overly nested values (5+ levels deep)
- No JSON schema (misconfigurations discovered at deploy time)
