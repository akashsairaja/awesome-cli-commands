---
id: terraform-plan-apply-workflow
stackId: terraform
type: skill
name: Terraform Plan/Apply CI/CD Workflow
description: >-
  Implement a safe Terraform CI/CD pipeline with plan on pull requests, apply on
  merge, approval gates, drift detection, and cost estimation integration.
difficulty: intermediate
tags:
  - ci-cd
  - github-actions
  - plan-apply
  - drift-detection
  - automation
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Terraform 1.6+
  - GitHub Actions or equivalent CI system
  - Remote state backend configured
faq:
  - question: What is the safest way to run Terraform in CI/CD?
    answer: >-
      Run 'terraform plan' on every pull request and post the output as a PR
      comment for review. After approval and merge to main, run 'terraform
      apply' using the saved plan file. Require manual approval for production
      environments. Never run apply directly from developer laptops.
  - question: How do I detect infrastructure drift with Terraform?
    answer: >-
      Run 'terraform plan -detailed-exitcode' on a schedule (e.g., daily). Exit
      code 2 means changes are needed (drift detected). Set up alerting when
      drift is found. Common causes: manual console changes, other tools
      modifying the same resources, or auto-scaling events.
relatedItems:
  - terraform-state-guardian
  - terraform-workspace-strategy
  - terraform-module-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Terraform Plan/Apply CI/CD Workflow

## Overview
A proper Terraform CI/CD workflow runs `plan` on every pull request for review, requires approval, then runs `apply` on merge to main. This prevents manual mistakes, enables code review of infrastructure changes, and creates an audit trail.

## Why This Matters
- **Safety** — no one runs `terraform apply` from their laptop
- **Review** — team sees the plan diff before changes are applied
- **Audit trail** — every change is linked to a PR and approval
- **Consistency** — same process for dev, staging, production
- **Cost awareness** — estimate costs before applying

## GitHub Actions Workflow
```yaml
# .github/workflows/terraform.yml
name: Terraform
on:
  pull_request:
    paths: ['infrastructure/**']
  push:
    branches: [main]
    paths: ['infrastructure/**']

permissions:
  contents: read
  pull-requests: write
  id-token: write

jobs:
  plan:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.7.0

      - name: Terraform Init
        run: terraform init -backend-config=envs/production.backend.hcl
        working-directory: infrastructure/environments/production

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Plan
        id: plan
        run: terraform plan -var-file=production.tfvars -no-color -out=tfplan
        working-directory: infrastructure/environments/production

      - name: Comment Plan on PR
        uses: actions/github-script@v7
        with:
          script: |
            const plan = `${{ steps.plan.outputs.stdout }}`;
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: '## Terraform Plan\n\`\`\`\n' + plan + '\n\`\`\`'
            });

  apply:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production  # Requires approval
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.7.0

      - name: Terraform Init
        run: terraform init -backend-config=envs/production.backend.hcl
        working-directory: infrastructure/environments/production

      - name: Terraform Apply
        run: terraform apply -var-file=production.tfvars -auto-approve
        working-directory: infrastructure/environments/production
```

## Drift Detection
```yaml
# Run daily to detect manual changes
name: Drift Detection
on:
  schedule:
    - cron: '0 8 * * 1-5'  # Weekdays at 8am

jobs:
  drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3

      - name: Terraform Plan (Drift Check)
        run: |
          terraform init
          terraform plan -detailed-exitcode -var-file=production.tfvars
        continue-on-error: true
        id: drift

      - name: Alert on Drift
        if: steps.drift.outcome == 'failure'
        run: echo "::warning::Infrastructure drift detected!"
```

## Best Practices
- Plan on PR, apply on merge — never apply from local machines
- Use `-out=tfplan` to save the plan and apply that exact plan
- Require manual approval for production applies
- Run drift detection on a schedule to catch manual changes
- Add cost estimation with Infracost before apply
- Pin Terraform version in CI to match team's local version

## Common Mistakes
- Applying directly from laptops (no review, no audit trail)
- Not saving the plan file (plan and apply may differ)
- Auto-approving production without human review
- Not pinning the Terraform version (different versions produce different plans)
