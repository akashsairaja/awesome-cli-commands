---
id: trivy-ci-pipeline
stackId: trivy
type: skill
name: Trivy CI/CD Pipeline Integration
description: >-
  Integrate Trivy scanning into CI/CD pipelines with GitHub Actions — container
  scanning, IaC scanning, SBOM generation, and security gate enforcement with
  SARIF uploads.
difficulty: intermediate
tags:
  - ci-cd
  - github-actions
  - sarif
  - security-gates
  - trivy
  - sbom
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Trivy or trivy-action
  - GitHub Actions
  - Docker for image scanning
faq:
  - question: How do I add Trivy to GitHub Actions?
    answer: >-
      Use the aquasecurity/trivy-action GitHub Action. Configure image-ref for
      container scanning or scan-type: config for IaC scanning. Set exit-code: 1
      to fail the workflow on vulnerabilities. Upload SARIF output to GitHub
      Security tab with github/codeql-action/upload-sarif.
  - question: Should Trivy block CI builds on vulnerabilities?
    answer: >-
      Yes, for CRITICAL and HIGH severity. Use '--exit-code 1 --severity
      CRITICAL,HIGH' to fail builds only on actionable vulnerabilities. Do not
      block on LOW/MEDIUM in CI — track those in dashboards instead. Adjust
      thresholds as your security posture matures.
  - question: How do I generate SBOMs with Trivy in CI?
    answer: >-
      Use 'trivy image --format cyclonedx --output sbom.json <image>' or the
      trivy-action with format: cyclonedx. Upload the SBOM as a build artifact.
      CycloneDX and SPDX formats are both supported. Generate SBOMs on every
      release for supply chain compliance.
relatedItems:
  - trivy-container-scanning
  - trivy-iac-scanning
  - trivy-security-scanner
version: 1.0.0
lastUpdated: '2026-03-11'
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
