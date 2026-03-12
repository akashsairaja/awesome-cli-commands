---
id: pulumi-preview-before-up
stackId: pulumi
type: rule
name: Always Preview Before Deploying
description: >-
  Every Pulumi deployment must be preceded by a preview. CI/CD pipelines must
  run 'pulumi preview' on pull requests and require approval before 'pulumi up'
  on production stacks.
difficulty: beginner
globs:
  - '**/.github/**'
  - '**/.gitlab-ci*'
  - '**/Pulumi*.yaml'
  - '**/pipeline*'
tags:
  - preview
  - deployment-safety
  - ci-cd
  - approval
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
  - question: Why must I run pulumi preview before pulumi up?
    answer: >-
      Preview shows exactly what changes will be made to your cloud
      infrastructure — creates, updates, deletes, and replacements. Without
      preview, you may accidentally delete a database, change a security group,
      or create expensive resources. Preview is the safety net that prevents
      infrastructure mistakes.
  - question: How do I set up Pulumi preview on pull requests?
    answer: >-
      Use the pulumi/actions GitHub Action with 'command: preview' and
      'comment-on-pr: true'. This runs preview on every PR and posts the output
      as a comment for team review. Deploy only after the PR is merged and
      approved. Pulumi Cloud also provides a built-in review workflow.
relatedItems:
  - pulumi-typed-configuration
  - pulumi-component-resources
  - pulumi-devops-engineer
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Always Preview Before Deploying

## Rule
`pulumi preview` MUST run before every `pulumi up`. CI/CD MUST show preview output on pull requests. Production deployments MUST require manual approval after preview review.

## CI/CD Pattern
```yaml
# GitHub Actions
jobs:
  preview:
    if: github.event_name == 'pull_request'
    steps:
      - uses: pulumi/actions@v5
        with:
          command: preview
          stack-name: production
          comment-on-pr: true    # Posts preview as PR comment

  deploy:
    if: github.ref == 'refs/heads/main'
    environment: production      # Requires approval
    steps:
      - uses: pulumi/actions@v5
        with:
          command: up
          stack-name: production
```

## Good Practices
```bash
# Always preview first
pulumi preview --diff
# Review the output carefully
pulumi up

# In CI: preview on PR, deploy on merge
# In manual: preview, review, then up
```

## Bad Practices
```bash
# BAD: Deploy without preview
pulumi up --yes

# BAD: Auto-approve production without review
pulumi up --yes --stack production

# BAD: Skip CI preview step
```

## Enforcement
- CI/CD pipeline requires preview step before deploy
- Production environment requires manual approval
- `pulumi up --yes` only allowed in dev/test stacks
- Preview output posted as PR comment for team review
