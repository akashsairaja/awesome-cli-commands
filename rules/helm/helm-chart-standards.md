---
id: helm-chart-standards
stackId: helm
type: rule
name: Helm Chart Structure Standards
description: >-
  Every Helm chart must follow the standard structure with Chart.yaml,
  values.yaml, _helpers.tpl, NOTES.txt, and proper metadata for maintainable
  Kubernetes packaging.
difficulty: beginner
globs:
  - '**/Chart.yaml'
  - '**/values.yaml'
  - '**/templates/**'
  - '**/charts/**'
  - '**/helm/**'
tags:
  - chart-structure
  - standards
  - helm-lint
  - metadata
  - best-practices
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
  - question: What files must every Helm chart contain?
    answer: >-
      Required: Chart.yaml (metadata), values.yaml (defaults),
      templates/_helpers.tpl (reusable template functions), templates/NOTES.txt
      (post-install instructions). Recommended: README.md (documentation),
      values.schema.json (validation), templates/tests/ (chart tests). Use 'helm
      lint' to validate structure.
  - question: Why must Helm charts use _helpers.tpl for names and labels?
    answer: >-
      Template helpers ensure consistent naming and labeling across all chart
      resources. Without helpers, you duplicate label blocks in every template
      file — one typo breaks service selectors. Helpers also handle name
      truncation (63 char limit), release name inclusion, and standard
      Kubernetes label taxonomy.
relatedItems:
  - helm-values-documentation
  - helm-template-patterns
  - kubernetes-pod-labels
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Helm Chart Structure Standards

## Rule
Every Helm chart MUST include Chart.yaml, values.yaml, templates/_helpers.tpl, templates/NOTES.txt, and README.md. All resources MUST use template helpers for names and labels.

## Required File Structure
```
mychart/
├── Chart.yaml            # REQUIRED: Chart metadata
├── values.yaml           # REQUIRED: Default values
├── values.schema.json    # RECOMMENDED: JSON schema
├── README.md             # REQUIRED: Documentation
├── templates/
│   ├── _helpers.tpl      # REQUIRED: Template helpers
│   ├── NOTES.txt         # REQUIRED: Post-install notes
│   ├── deployment.yaml   # Application resources
│   ├── service.yaml
│   ├── ingress.yaml
│   └── tests/
│       └── test-connection.yaml
└── charts/               # Dependencies (if any)
```

## Chart.yaml Requirements
```yaml
apiVersion: v2
name: myapp
description: A Helm chart for MyApp
type: application
version: 1.0.0        # Chart version (semver)
appVersion: "2.1.0"   # Application version
maintainers:
  - name: platform-team
    email: platform@mycompany.com
```

## Good Examples
```yaml
# All resources use helpers
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
```

## Bad Examples
```yaml
# BAD: Hardcoded names and labels
metadata:
  name: myapp-deployment
  labels:
    app: myapp
    version: "1.0"

# BAD: Missing NOTES.txt, _helpers.tpl, or README
```

## Enforcement
- helm lint (validates chart structure)
- ct (chart-testing) in CI pipeline
- kubeconform for rendered manifest validation
- Code review checklist for chart structure compliance
