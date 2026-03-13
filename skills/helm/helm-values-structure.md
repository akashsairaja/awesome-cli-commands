---
id: helm-values-structure
stackId: helm
type: skill
name: >-
  Helm Values Design & Schema Validation
description: >-
  Design well-structured Helm values.yaml files with clear sections, sensible
  defaults, JSON schema validation, and per-environment overrides for reliable
  Kubernetes deployments.
difficulty: intermediate
tags:
  - helm
  - values
  - design
  - schema
  - validation
  - deployment
  - api
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Helm Values Design & Schema Validation skill?"
    answer: >-
      Design well-structured Helm values.yaml files with clear sections,
      sensible defaults, JSON schema validation, and per-environment overrides
      for reliable Kubernetes deployments. It includes practical examples for
      Kubernetes packaging development.
  - question: "What tools and setup does Helm Values Design & Schema Validation require?"
    answer: >-
      Requires Helm CLI installed. Works with Helm projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
