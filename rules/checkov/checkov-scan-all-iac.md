---
id: checkov-scan-all-iac
stackId: checkov
type: rule
name: Scan All IaC Frameworks
description: >-
  Require Checkov scanning for ALL infrastructure-as-code in the repository —
  Terraform, Kubernetes, Dockerfiles, CloudFormation, and Helm charts must all
  pass security checks.
difficulty: beginner
globs:
  - '**/*.tf'
  - '**/Dockerfile*'
  - '**/k8s/**'
  - '**/*.yaml'
  - '**/helm/**'
tags:
  - iac-coverage
  - multi-framework
  - security-scanning
  - comprehensive
  - checkov
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
  - question: Which IaC frameworks should Checkov scan?
    answer: >-
      All of them. Scan Terraform, CloudFormation, Kubernetes manifests,
      Dockerfiles, Helm charts, and ARM templates. Security misconfigurations
      exist in every IaC format. Scanning only one framework leaves gaps that
      attackers exploit.
  - question: Can Checkov auto-detect IaC frameworks?
    answer: >-
      Yes. Running 'checkov -d .' without --framework scans all detected IaC
      files. However, explicitly specifying frameworks with --framework is
      recommended in CI for clarity and to ensure nothing is accidentally
      skipped.
relatedItems:
  - checkov-baseline-policy
  - checkov-skip-check-rules
  - checkov-terraform-scanning
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Scan All IaC Frameworks

## Rule
Checkov MUST scan ALL infrastructure-as-code in the repository. Scanning only Terraform while ignoring Dockerfiles, Kubernetes manifests, and CloudFormation templates leaves security gaps.

## Required Frameworks
```bash
# Scan all supported frameworks
checkov -d . --framework terraform,cloudformation,kubernetes,dockerfile,helm,kustomize

# Or scan everything (auto-detect)
checkov -d .
```

## Framework Coverage
| Framework | File Patterns | Checks |
|-----------|--------------|--------|
| Terraform | *.tf, *.tfvars | 750+ |
| CloudFormation | *.json, *.yaml, *.template | 200+ |
| Kubernetes | *.yaml, *.yml | 100+ |
| Dockerfile | Dockerfile* | 30+ |
| Helm | Chart.yaml, templates/ | 100+ |
| ARM templates | *.json | 150+ |

## Examples

### Good
```yaml
# CI scans all frameworks
- name: Checkov full scan
  run: checkov -d . --framework terraform,kubernetes,dockerfile
```

### Bad
```yaml
# Only scans Terraform — misses Dockerfile and K8s issues
- name: Checkov scan
  run: checkov -d ./terraform/ --framework terraform
```

## Anti-Patterns
- Scanning only Terraform in a project with Dockerfiles and K8s manifests
- Using --framework to exclude specific IaC types without justification
- Assuming security is covered because "Terraform is scanned"
- Not scanning Helm charts (they generate Kubernetes manifests)
