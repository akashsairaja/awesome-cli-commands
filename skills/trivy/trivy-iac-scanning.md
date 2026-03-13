---
id: trivy-iac-scanning
stackId: trivy
type: skill
name: Infrastructure as Code Security Scanning
description: >-
  Scan Terraform, CloudFormation, Kubernetes YAML, and Dockerfiles for
  security misconfigurations with Trivy — severity filtering, custom Rego
  policies, CI gate integration, SARIF output, and compliance frameworks.
difficulty: advanced
tags:
  - trivy
  - infrastructure
  - code
  - security
  - scanning
  - deployment
  - docker
  - kubernetes
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Infrastructure as Code Security Scanning skill?"
    answer: >-
      Scan IaC templates before deployment to catch security misconfigurations
      — unencrypted storage, public S3 buckets, overly permissive IAM, missing
      network policies, containers running as root. Covers Terraform,
      CloudFormation, Kubernetes manifests, Dockerfiles, and Helm charts with
      custom Rego policy support.
  - question: "What tools and setup does Infrastructure as Code Security Scanning require?"
    answer: >-
      Requires Trivy CLI installed (brew install trivy, apt install trivy, or
      Docker). No additional setup needed — Trivy bundles built-in checks for
      all supported IaC formats. For custom policies, familiarity with OPA
      Rego language is needed.
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# Infrastructure as Code Security Scanning

## Overview

Trivy scans IaC templates for security misconfigurations before they reach production. It analyzes Terraform (HCL and plan files), CloudFormation (JSON/YAML), Kubernetes manifests, Dockerfiles, and Helm charts against hundreds of built-in security checks. The scans run locally in seconds with no network calls required — making them practical for pre-commit hooks and CI pipelines.

Infrastructure misconfigurations cause more breaches than application vulnerabilities. A public S3 bucket, an overly permissive security group, or a container running as root are all deployment-time decisions that Trivy catches before they become incidents.

## Scanning Terraform

```bash
# Scan a directory of .tf files
trivy config ./terraform/

# Filter by severity (only critical and high)
trivy config --severity CRITICAL,HIGH ./terraform/

# Scan a Terraform plan (catches dynamic values that .tf files miss)
terraform plan -out=tfplan
terraform show -json tfplan > tfplan.json
trivy config tfplan.json
```

Scanning Terraform plan files is more thorough than scanning `.tf` files directly. Plan files contain resolved variables, module outputs, and provider-specific defaults — catching issues that static HCL analysis misses (e.g., a variable that defaults to `"0.0.0.0/0"`).

### Common Terraform Findings

| Check | Severity | Description |
|-------|----------|-------------|
| AVD-AWS-0086 | CRITICAL | S3 bucket without encryption |
| AVD-AWS-0107 | HIGH | Security group allows 0.0.0.0/0 ingress |
| AVD-AWS-0176 | HIGH | RDS instance publicly accessible |
| AVD-AWS-0057 | CRITICAL | IAM policy with wildcard (*) actions |
| AVD-AWS-0026 | HIGH | EBS volume not encrypted |
| AVD-AWS-0089 | MEDIUM | S3 bucket without versioning |
| AVD-AWS-0132 | HIGH | CloudTrail not enabled |

## Scanning Kubernetes Manifests

```bash
# Scan all YAML files in a directory
trivy config ./k8s/

# Scan a specific manifest
trivy config deployment.yaml

# Scan a rendered Helm chart
helm template my-release ./chart | trivy config -

# Scan with Helm values
helm template my-release ./chart -f values-production.yaml | trivy config -
```

Always scan Helm charts after rendering with `helm template`. Scanning the raw chart templates misses issues that only appear with specific values (e.g., `securityContext` that is conditionally included).

### Common Kubernetes Findings

| Check | Severity | Description |
|-------|----------|-------------|
| KSV001 | MEDIUM | Container running as root |
| KSV003 | HIGH | Default capabilities not dropped |
| KSV006 | HIGH | Privileged container |
| KSV011 | LOW | CPU limits not set |
| KSV012 | LOW | Memory limits not set |
| KSV014 | HIGH | Root filesystem not read-only |
| KSV020 | MEDIUM | Container running with low UID |
| KSV021 | MEDIUM | No network policy defined |
| KSV106 | MEDIUM | Secrets in environment variables |

## Scanning Dockerfiles

```bash
# Scan a Dockerfile
trivy config ./Dockerfile

# Scan all Dockerfiles in a project
trivy config --file-patterns "dockerfile:Dockerfile*" .
```

### Common Dockerfile Findings

```
- DS001: Running as root (no USER instruction)
- DS002: Using ADD instead of COPY (ADD can fetch remote URLs)
- DS005: Not pinning base image version (using :latest)
- DS026: No HEALTHCHECK defined
- DS015: Using apk/apt without --no-cache
```

## Custom Rego Policies

Trivy's built-in checks cover common misconfigurations, but every organization has specific requirements. Write custom checks in Rego (OPA's policy language) to enforce your standards.

### Policy Structure

```rego
# policy/s3_naming.rego
# METADATA
# title: S3 bucket must follow naming convention
# description: All S3 buckets must start with the organization prefix
# custom:
#   severity: HIGH
#   id: ORG-AWS-001

package user.aws.s3.naming

import rego.v1

deny contains msg if {
    bucket := input.aws.s3.buckets[_]
    not startswith(bucket.name.value, "myorg-")
    msg := sprintf("S3 bucket '%s' does not follow naming convention (must start with 'myorg-')", [bucket.name.value])
}
```

### Run with Custom Policies

```bash
# Scan with custom policies alongside built-in checks
trivy config --policy ./policy/ ./terraform/

# Scan with ONLY custom policies (skip built-in)
trivy config --policy ./policy/ --skip-policy-update ./terraform/

# Test custom policies with OPA
opa test ./policy/ -v
```

### Example: Require Tags on All Resources

```rego
# policy/required_tags.rego
# METADATA
# title: Resources must have required tags
# description: All taggable resources must include environment and team tags
# custom:
#   severity: MEDIUM
#   id: ORG-TAGS-001

package user.tags.required

import rego.v1

required_tags := {"environment", "team", "cost-center"}

deny contains msg if {
    resource := input.resource[type][name]
    tags := object.get(resource, "tags", {})
    missing := required_tags - {key | tags[key]}
    count(missing) > 0
    msg := sprintf("%s.%s is missing required tags: %v", [type, name, missing])
}
```

## Output Formats and CI Integration

```bash
# Table format (default — human-readable)
trivy config ./terraform/

# JSON for programmatic processing
trivy config --format json --output iac-results.json ./terraform/

# SARIF for GitHub Security tab
trivy config --format sarif --output iac.sarif ./terraform/

# JUnit XML for CI test reporting
trivy config --format template \
  --template "@contrib/junit.tpl" \
  --output iac-junit.xml ./terraform/

# Exit code for CI gates (non-zero on findings)
trivy config --exit-code 1 --severity CRITICAL,HIGH ./terraform/
```

### GitHub Actions Integration

```yaml
- name: Scan IaC
  run: |
    trivy config --format sarif --output iac.sarif \
      --exit-code 1 --severity CRITICAL,HIGH ./terraform/

- name: Upload SARIF
  if: always()
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: iac.sarif
```

The `if: always()` ensures the SARIF upload happens even when the scan fails (exit code 1), so findings appear in the GitHub Security tab regardless of the gate result.

### GitLab CI Integration

```yaml
trivy-iac:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy config --exit-code 1 --severity CRITICAL,HIGH
      --format json --output gl-sast-report.json .
  artifacts:
    reports:
      sast: gl-sast-report.json
```

## Ignoring Findings

```bash
# Create .trivyignore for accepted risks
cat > .trivyignore << 'EOF'
# AVD-AWS-0086: S3 encryption handled by bucket policy (not server-side)
# Accepted by: security-team, 2026-01-15
AVD-AWS-0086

# KSV001: Init containers must run as root for volume permissions
# Scope: init containers only
KSV001
EOF

trivy config --ignorefile .trivyignore ./terraform/
```

Always document the justification for each ignored finding. An uncommented `.trivyignore` is a liability — it silently suppresses real issues without context.

## Scanning Multiple IaC Types Together

```bash
# Scan an entire repository (Trivy auto-detects file types)
trivy config .

# The scan covers:
# - *.tf (Terraform)
# - *.yaml/*.yml (Kubernetes, CloudFormation)
# - Dockerfile* (Docker)
# - docker-compose*.yml (Docker Compose)
# - *.json (CloudFormation, Terraform plan)
```

## Best Practices

- Scan IaC in the same CI pipeline as application code — do not defer security to a separate "security review" stage.
- Use `--exit-code 1` to block deployments with CRITICAL and HIGH misconfigurations. Start strict and relax selectively.
- Scan Terraform plans, not just `.tf` files — plans resolve variables, modules, and defaults that static analysis misses.
- Render Helm charts before scanning — `helm template | trivy config -` catches value-dependent misconfigurations.
- Write custom Rego policies for organization-specific standards (naming conventions, required tags, region restrictions).
- Test custom policies with `opa test` in CI — policies are code and need the same rigor.
- Use SARIF output for GitHub Security tab integration — findings appear alongside code scanning alerts.
- Combine IaC scanning with container scanning for full supply chain coverage.

## Common Pitfalls

- Scanning only container images but not IaC — infrastructure misconfigurations cause more breaches than application vulnerabilities.
- Ignoring MEDIUM severity findings — they compound. A non-encrypted volume plus a public security group equals a data breach.
- Not scanning Dockerfiles — running as root with unpinned base images is the default, and it is insecure.
- Scanning IaC only in production pipelines — scan in development and PR checks to catch issues early.
- Writing `.trivyignore` entries without justification — creates silent suppression of real issues.
- Not scanning Helm charts after rendering — raw templates may not reveal value-dependent misconfigurations.
