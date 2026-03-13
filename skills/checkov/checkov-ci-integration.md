---
id: checkov-ci-integration
stackId: checkov
type: skill
name: Checkov CI/CD Pipeline Integration
description: >-
  Integrate Checkov into CI/CD pipelines with GitHub Actions — IaC scanning
  with baseline support, severity gating, SARIF uploads, and compliance
  reporting.
difficulty: intermediate
tags:
  - checkov
  - cicd
  - pipeline
  - integration
  - security
  - deployment
  - ci-cd
  - docker
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Checkov CI/CD Pipeline Integration skill?"
    answer: >-
      Integrate Checkov into CI/CD pipelines with GitHub Actions — IaC
      scanning with baseline support, severity gating, SARIF uploads, and
      compliance reporting. This skill provides a structured workflow for
      development tasks.
  - question: "What tools and setup does Checkov CI/CD Pipeline Integration require?"
    answer: >-
      Requires Docker, Terraform CLI, pip/poetry installed. Works with checkov
      projects. Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Checkov CI/CD Pipeline Integration

## Overview
Checkov in CI/CD ensures every infrastructure change is validated against security policies before deployment. With baselines, new projects start clean while existing projects adopt incrementally.

## How It Works

### GitHub Actions Workflow
```yaml
# .github/workflows/checkov.yml
name: IaC Security
on:
  pull_request:
    paths:
      - 'terraform/**'
      - 'k8s/**'
      - 'Dockerfile*'

jobs:
  checkov:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Checkov scan
        uses: bridgecrewio/checkov-action@master
        with:
          directory: .
          framework: terraform,kubernetes,dockerfile
          output_format: cli,sarif
          output_file_path: console,checkov.sarif
          soft_fail_on: LOW,MEDIUM
          download_external_modules: true

      - name: Upload SARIF
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: checkov.sarif
          category: checkov
```

### With Baseline for Existing Projects
```yaml
      - name: Checkov scan with baseline
        uses: bridgecrewio/checkov-action@master
        with:
          directory: terraform/
          baseline: .checkov.baseline
          soft_fail_on: LOW,MEDIUM
```

### Pre-Commit Integration
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/bridgecrewio/checkov
    rev: '3.2.0'
    hooks:
      - id: checkov
        args: ['--directory', '.', '--soft-fail-on', 'LOW,MEDIUM']
```

## Best Practices
- Use `soft_fail_on: LOW,MEDIUM` to warn without blocking on minor issues
- Upload SARIF to GitHub Security tab for centralized visibility
- Use baselines for existing infrastructure to enable incremental adoption
- Trigger only on IaC file changes (paths filter) to avoid unnecessary runs
- Include `--download-external-modules true` for complete module scanning
- Run as pre-commit hook for immediate developer feedback

## Common Mistakes
- Not using baselines on existing projects (blocks all PRs immediately)
- Hard-failing on LOW severity (too strict for adoption)
- Not uploading SARIF results (loses visibility into security posture)
- Scanning only Terraform when Dockerfiles and K8s manifests also exist
