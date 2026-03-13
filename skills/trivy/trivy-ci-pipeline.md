---
id: trivy-ci-pipeline
stackId: trivy
type: skill
name: Trivy CI/CD Pipeline Integration
description: >-
  Integrate Trivy scanning into CI/CD pipelines with GitHub Actions —
  container scanning, IaC scanning, SBOM generation, and security gate
  enforcement with SARIF uploads.
difficulty: intermediate
tags:
  - trivy
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
  - question: "When should I use the Trivy CI/CD Pipeline Integration skill?"
    answer: >-
      Integrate Trivy scanning into CI/CD pipelines with GitHub Actions —
      container scanning, IaC scanning, SBOM generation, and security gate
      enforcement with SARIF uploads. This skill provides a structured
      workflow for container scanning, filesystem scanning, IaC scanning, and
      SBOM generation.
  - question: "What tools and setup does Trivy CI/CD Pipeline Integration require?"
    answer: >-
      Requires Docker, Terraform CLI, pip/poetry installed. Works with Trivy
      projects. Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Trivy CI/CD Pipeline Integration

## Overview
Integrating Trivy into CI/CD creates automated security gates. Every container image is scanned before push, every IaC change is validated before deployment, and results appear in GitHub's Security tab via SARIF.

## How It Works

### GitHub Actions Workflow
```yaml
# .github/workflows/security.yml
name: Security Scanning
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  trivy-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .

      - name: Trivy image scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:${{ github.sha }}
          format: sarif
          output: trivy-image.sarif
          severity: CRITICAL,HIGH
          exit-code: 1

      - name: Upload image scan to GitHub Security
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-image.sarif
          category: trivy-image

      - name: Trivy IaC scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: config
          scan-ref: ./terraform/
          format: sarif
          output: trivy-iac.sarif
          severity: CRITICAL,HIGH
          exit-code: 1

      - name: Upload IaC scan to GitHub Security
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-iac.sarif
          category: trivy-iac

      - name: Generate SBOM
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:${{ github.sha }}
          format: cyclonedx
          output: sbom.json

      - name: Upload SBOM
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.json
```

### Multi-Stage Pipeline
```yaml
jobs:
  scan-iac:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scan IaC
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: config
          exit-code: 1
          severity: CRITICAL,HIGH

  build-and-scan:
    needs: scan-iac
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app:${{ github.sha }} .
      - name: Scan image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: app:${{ github.sha }}
          exit-code: 1
          severity: CRITICAL,HIGH
```

## Best Practices
- Upload SARIF to GitHub Security tab for centralized vulnerability tracking
- Scan both images AND IaC in the same pipeline
- Use `exit-code: 1` with severity filters for CI gates
- Generate SBOMs on every release for compliance
- Cache the Trivy vulnerability database for faster CI runs
- Run scans in parallel (image scan + IaC scan simultaneously)

## Common Mistakes
- Not uploading SARIF results (losing visibility into security status)
- Blocking pipeline on LOW severity (too noisy, developers disable scanning)
- Not scanning IaC alongside container images
- Scanning only on main branch (should scan on PRs too)
