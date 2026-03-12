---
id: helm-values-documentation
stackId: helm
type: rule
name: Document All Helm Values
description: >-
  Every values.yaml entry must be documented with comments following helm-docs
  format — describe purpose, type, default, and constraints for each
  configurable value.
difficulty: beginner
globs:
  - '**/values.yaml'
  - '**/values*.yaml'
  - '**/Chart.yaml'
  - '**/helm/**'
tags:
  - values-documentation
  - helm-docs
  - comments
  - readability
  - chart-quality
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
  - question: How should Helm values be documented?
    answer: >-
      Use the '# --' comment prefix for each value (helm-docs compatible).
      Describe what the value controls, not its type. Include allowed values in
      brackets for enums: '# -- Image pull policy [Always, IfNotPresent,
      Never]'. Group related values under section headers. Run helm-docs to
      auto-generate README documentation.
  - question: What is helm-docs and how does it work?
    answer: >-
      helm-docs is a tool that generates README.md documentation from
      values.yaml comments. It reads '# --' prefixed comments and produces a
      markdown table with value names, descriptions, types, and defaults. Run it
      in CI to keep documentation in sync with values. Install with 'brew
      install norwoodj/tap/helm-docs'.
relatedItems:
  - helm-chart-standards
  - helm-values-structure
  - helm-chart-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Document All Helm Values

## Rule
Every value in values.yaml MUST have a comment describing its purpose. Use the `# --` prefix for helm-docs compatibility. Group related values with section headers.

## Format
```yaml
# -- Description of what this value controls
key: defaultValue
```

## Good Examples
```yaml
# -- Number of pod replicas
replicaCount: 1

image:
  # -- Container image repository
  repository: myapp/api
  # -- Image pull policy [Always, IfNotPresent, Never]
  pullPolicy: IfNotPresent
  # -- Image tag (defaults to chart appVersion if empty)
  tag: ""

resources:
  requests:
    # -- CPU request per pod
    cpu: 100m
    # -- Memory request per pod
    memory: 128Mi
  limits:
    # -- Memory limit per pod (no CPU limit recommended)
    memory: 256Mi

autoscaling:
  # -- Enable Horizontal Pod Autoscaler
  enabled: false
  # -- Minimum replica count
  # @default -- 2
  minReplicas: 2
  # -- Maximum replica count
  maxReplicas: 10
```

## Bad Examples
```yaml
# BAD: No comments at all
replicaCount: 1
image:
  repository: myapp/api
  pullPolicy: IfNotPresent
  tag: ""

# BAD: Comments that don't explain anything
# replicaCount
replicaCount: 1
# image
image:
  # repository
  repository: myapp/api
```

## Generating Documentation
```bash
# Install helm-docs
brew install norwoodj/tap/helm-docs

# Generate README from values.yaml comments
helm-docs --chart-search-root ./charts
```

## Enforcement
- helm-docs in CI to verify README is up to date
- Code review: reject undocumented values
- JSON schema alongside values.yaml for type validation
