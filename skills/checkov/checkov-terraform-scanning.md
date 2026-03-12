---
id: checkov-terraform-scanning
stackId: checkov
type: skill
name: Terraform Security Scanning with Checkov
description: >-
  Scan Terraform configurations for security misconfigurations with Checkov —
  detect unencrypted resources, overly permissive IAM, public access, and
  missing logging.
difficulty: beginner
tags:
  - terraform
  - iac-scanning
  - aws
  - security-checks
  - checkov
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Checkov installed (pip install checkov)
  - Terraform configuration files
faq:
  - question: How do I scan Terraform with Checkov?
    answer: >-
      Run 'checkov -d ./terraform/' to scan all .tf files in a directory.
      Checkov checks for 750+ security misconfigurations including unencrypted
      storage, public access, missing logging, and overly permissive IAM. Use
      '--check CKV_ID' to run specific checks or '--skip-check' to exclude them.
  - question: >-
      How do I handle existing Terraform infrastructure with many Checkov
      findings?
    answer: >-
      Use '--create-baseline' to snapshot current findings, then '--baseline
      .checkov.baseline' on future scans. This reports only NEW findings,
      letting you adopt Checkov incrementally without blocking all PRs. Fix
      baseline findings over time.
  - question: Does Checkov scan Terraform modules?
    answer: >-
      Yes. Use '--download-external-modules true' to scan external modules
      referenced in your Terraform code. Without this flag, Checkov only scans
      the root module. Module scanning catches misconfigurations in shared
      infrastructure code that might be reused across projects.
relatedItems:
  - checkov-custom-checks
  - checkov-ci-integration
  - checkov-policy-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Terraform Security Scanning with Checkov

## Overview
Checkov scans Terraform files (.tf) for over 750 security misconfigurations. It detects unencrypted storage, public access, missing logging, overly permissive IAM policies, and non-compliant network configurations — all before terraform apply.

## How It Works

### Step 1: Basic Terraform Scan
```bash
# Scan a directory of Terraform files
checkov -d ./terraform/

# Scan a specific file
checkov -f main.tf

# Scan with specific framework
checkov -d ./terraform/ --framework terraform
```

### Step 2: Filter by Severity and Checks
```bash
# Only show CRITICAL and HIGH findings
checkov -d ./terraform/ --check-type terraform --soft-fail-on LOW,MEDIUM

# Run specific checks
checkov -d ./terraform/ --check CKV_AWS_18,CKV_AWS_19,CKV_AWS_21

# Skip specific checks
checkov -d ./terraform/ --skip-check CKV_AWS_999
```

### Step 3: Output Formats
```bash
# JSON for processing
checkov -d ./terraform/ --output json > results.json

# SARIF for GitHub Security
checkov -d ./terraform/ --output sarif > checkov.sarif

# JUnit XML for CI dashboards
checkov -d ./terraform/ --output junitxml > results.xml

# Multiple formats
checkov -d ./terraform/ --output json --output sarif
```

### Common Terraform Findings
```
CKV_AWS_18: S3 bucket without access logging
CKV_AWS_19: S3 bucket without server-side encryption
CKV_AWS_21: S3 bucket without versioning
CKV_AWS_23: Security group allows ingress from 0.0.0.0/0
CKV_AWS_24: Security group allows ingress on port 22 from 0.0.0.0/0
CKV_AWS_41: IAM policy document with wildcard resource
CKV_AWS_145: RDS instance without encryption
CKV_AWS_157: RDS instance without multi-AZ
```

### Step 4: Use Baseline for Existing Projects
```bash
# Create baseline from current state (accept existing findings)
checkov -d ./terraform/ --create-baseline

# Future scans only report new findings
checkov -d ./terraform/ --baseline .checkov.baseline
```

## Best Practices
- Start with a baseline for existing projects to avoid blocking all PRs
- Focus on CRITICAL/HIGH findings first — encrypt data, restrict access
- Run `checkov` before `terraform plan` in your workflow
- Use `--compact` for cleaner CI output (summary instead of full details)
- Integrate with pre-commit hooks for immediate feedback

## Common Mistakes
- Enabling all checks on a large existing project (hundreds of findings, overwhelming)
- Skipping checks permanently without documented justification
- Not scanning Terraform modules (pass `--download-external-modules true`)
- Scanning only root modules, missing shared module misconfigurations
