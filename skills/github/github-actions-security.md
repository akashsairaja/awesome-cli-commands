---
id: github-actions-security
stackId: github
type: skill
name: Harden GitHub Actions Security
description: >-
  Secure your GitHub Actions workflows against supply chain attacks — pin
  actions to SHA, configure least-privilege permissions, protect secrets, and
  enable OpenID Connect.
difficulty: intermediate
tags:
  - github
  - harden
  - actions
  - security
  - api
  - ci-cd
  - machine-learning
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the Harden GitHub Actions Security skill?"
    answer: >-
      Secure your GitHub Actions workflows against supply chain attacks — pin
      actions to SHA, configure least-privilege permissions, protect secrets,
      and enable OpenID Connect. This skill provides a structured workflow for
      CI/CD workflows, PR automation, issue management, and repository
      configuration.
  - question: "What tools and setup does Harden GitHub Actions Security require?"
    answer: >-
      Works with standard GitHub tooling (GitHub CLI (gh), GitHub Actions).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Harden GitHub Actions Security

## Overview
GitHub Actions workflows execute arbitrary code with access to your repository secrets and GITHUB_TOKEN. Without proper hardening, they are a major supply chain attack vector. This guide covers the essential security controls.

## Why This Matters
- **Supply chain attacks** — compromised Actions can steal secrets
- **Token theft** — overly permissive GITHUB_TOKEN enables repo takeover
- **Secret exfiltration** — malicious PRs can access workflow secrets
- **Compliance** — SOC2/ISO require CI/CD security controls

## How It Works

### Step 1: Pin Actions to SHA
```yaml
# BAD — tag can be reassigned to malicious code
- uses: actions/checkout@v4

# GOOD — SHA is immutable
- uses: actions/checkout@a5ac7e51b41094c92402da3b24376905380afc29 # v4.1.7
```

### Step 2: Apply Least-Privilege Permissions
```yaml
# Set restrictive default at workflow level
permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@a5ac7e51b41094c92402da3b24376905380afc29

  deploy:
    runs-on: ubuntu-latest
    # Grant additional permissions only where needed
    permissions:
      contents: read
      id-token: write  # For OIDC
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/deploy
          aws-region: us-east-1
```

### Step 3: Use OIDC Instead of Long-Lived Secrets
```yaml
# Instead of storing AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
# Use OpenID Connect for short-lived credentials
jobs:
  deploy:
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_ROLE_ARN }}
          aws-region: us-east-1
          # No secrets needed — uses GitHub's OIDC token
```

### Step 4: Protect Against PR-Based Attacks
```yaml
# Use pull_request (not pull_request_target) for untrusted code
on:
  pull_request:  # SAFE — runs in fork context, no secrets access

# If you MUST use pull_request_target:
on:
  pull_request_target:
jobs:
  safe-job:
    runs-on: ubuntu-latest
    steps:
      # NEVER checkout PR code when using pull_request_target
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.base.sha }}  # Base branch only
```

### Step 5: Audit with StepSecurity
```yaml
# Add Harden-Runner to detect and block suspicious activity
steps:
  - uses: step-security/harden-runner@v2
    with:
      egress-policy: audit  # Start with audit, move to block
      allowed-endpoints: >
        api.github.com:443
        registry.npmjs.org:443
```

## Best Practices
- Pin ALL third-party actions to SHA (use Dependabot to update)
- Set `permissions: contents: read` at workflow level, expand per-job
- Use OIDC for cloud provider authentication (AWS, GCP, Azure)
- Never use `pull_request_target` with PR code checkout
- Enable GitHub's "Require approval for all outside collaborators" setting
- Audit Actions marketplace dependencies before adopting

## Common Mistakes
- Using tag-based action references (vulnerable to tag reassignment)
- Granting `write-all` permissions (violates least privilege)
- Storing long-lived cloud credentials as repository secrets
- Using `pull_request_target` without understanding the security model
- Not restricting which Actions can run (org-level policy)
