---
id: trivy-iac-scanning
stackId: trivy
type: skill
name: Infrastructure as Code Security Scanning
description: >-
  Scan Terraform, CloudFormation, Kubernetes YAML, and Dockerfiles for security
  misconfigurations with Trivy — detect exposed ports, missing encryption,
  overly permissive IAM policies, and compliance violations.
difficulty: intermediate
tags:
  - iac-scanning
  - terraform
  - kubernetes
  - misconfiguration
  - trivy
  - cloud-security
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Trivy installed
  - 'IaC templates (Terraform, K8s, CloudFormation)'
faq:
  - question: What IaC formats can Trivy scan?
    answer: >-
      Trivy scans Terraform (.tf), CloudFormation (JSON/YAML), Kubernetes
      manifests (YAML), Dockerfiles, Helm charts (rendered), and Azure ARM
      templates. It detects security misconfigurations like unencrypted storage,
      overly permissive access, and missing security controls.
  - question: How is Trivy IaC scanning different from Checkov?
    answer: >-
      Both scan IaC for misconfigurations. Trivy is a unified scanner
      (containers + IaC + SBOM) with simpler setup. Checkov specializes in IaC
      with more policies (1000+), custom check support in Python, and deeper
      compliance framework mapping. Use Trivy for unified scanning, Checkov for
      deep IaC-specific coverage.
  - question: Can Trivy scan Helm charts for misconfigurations?
    answer: >-
      Yes, but render them first. Run 'helm template my-release ./chart | trivy
      config -' to scan the rendered Kubernetes manifests. Direct Helm chart
      scanning with values resolution is supported via 'trivy config' on the
      chart directory.
relatedItems:
  - trivy-container-scanning
  - trivy-ci-pipeline
  - trivy-vulnerability-advisor
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Infrastructure as Code Security Scanning

## Overview
Trivy scans IaC templates for security misconfigurations before deployment. It detects issues like unencrypted storage, public S3 buckets, overly permissive security groups, and missing network policies in Terraform, CloudFormation, and Kubernetes manifests.

## How It Works

### Scan Terraform Files
```bash
# Scan a directory of Terraform files
trivy config ./terraform/

# Scan with severity filter
trivy config --severity CRITICAL,HIGH ./terraform/

# Scan specific file
trivy config --file-patterns "terraform:*.tf" ./infrastructure/
```

### Scan Kubernetes Manifests
```bash
# Scan all YAML in a directory
trivy config ./k8s/

# Scan a specific manifest
trivy config deployment.yaml

# Scan Helm chart (rendered)
helm template my-release ./chart | trivy config -
```

### Scan Dockerfiles
```bash
# Scan Dockerfile for misconfigurations
trivy config ./Dockerfile

# Common findings:
# - Running as root
# - Using latest tag
# - Missing HEALTHCHECK
# - Exposing unnecessary ports
```

### Common Misconfigurations Detected
```
Terraform:
- S3 bucket without encryption
- Security group allowing 0.0.0.0/0 ingress
- RDS instance publicly accessible
- IAM policy with wildcard permissions
- EBS volume not encrypted

Kubernetes:
- Container running as root
- Missing resource limits
- Privileged containers
- Missing network policies
- Secrets in environment variables

Dockerfile:
- Running as root user
- Using ADD instead of COPY
- Not pinning base image version
```

### Output and CI Integration
```bash
# JSON output for processing
trivy config --format json --output iac-results.json ./terraform/

# Exit code for CI gates
trivy config --exit-code 1 --severity CRITICAL,HIGH ./terraform/

# SARIF for GitHub Security
trivy config --format sarif --output iac.sarif ./terraform/
```

## Best Practices
- Scan IaC in the same CI pipeline as application code
- Use `--exit-code 1` to block deployments with critical misconfigurations
- Combine with container scanning for full supply chain coverage
- Scan Helm charts by rendering them first: `helm template | trivy config -`
- Use custom policies (Rego) for organization-specific standards

## Common Mistakes
- Only scanning containers but not IaC (infrastructure misconfigs cause breaches)
- Not scanning Dockerfiles (root user, unpinned images)
- Scanning IaC only in production pipeline (scan in development too)
- Ignoring MEDIUM severity IaC findings (they compound into serious exposure)
