---
id: github-repository-structure
stackId: github
type: rule
name: Repository Structure & Community Files
description: >-
  Standard repository structure with required community health files — README,
  LICENSE, CONTRIBUTING, SECURITY.md, issue/PR templates, and .github directory
  organization.
difficulty: beginner
globs:
  - '**/.github/**'
  - '**/README.md'
  - '**/LICENSE'
  - '**/CONTRIBUTING.md'
  - '**/SECURITY.md'
tags:
  - repository
  - community-health
  - templates
  - documentation
  - standards
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
  - question: What files should every GitHub repository include?
    answer: >-
      At minimum: README.md (project overview), LICENSE (legal terms),
      CONTRIBUTING.md (how to contribute), SECURITY.md (vulnerability
      reporting), .github/CODEOWNERS (review assignment), PR/issue templates
      (structured input), and .github/dependabot.yml (dependency updates).
  - question: Why are GitHub issue and PR templates important?
    answer: >-
      Templates ensure contributors provide structured, actionable information.
      Bug reports include reproduction steps, feature requests include use
      cases, and PRs include testing notes. This reduces back-and-forth
      communication and speeds up triage and review.
relatedItems:
  - github-pr-reviewer
  - github-security-scanner
  - github-branch-protection-rules
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Repository Structure & Community Files

## Rule
Every GitHub repository MUST include standard community health files and follow a consistent directory structure for GitHub-specific configuration.

## Required Structure
```
.github/
  CODEOWNERS              # Automatic review assignment
  FUNDING.yml             # Sponsorship links (optional)
  dependabot.yml          # Dependency update config
  ISSUE_TEMPLATE/
    bug_report.yml        # Structured bug reports
    feature_request.yml   # Feature request template
    config.yml            # Template chooser config
  PULL_REQUEST_TEMPLATE.md  # PR description template
  workflows/
    ci.yml                # CI pipeline
    deploy.yml            # Deployment pipeline
    dependabot-auto-merge.yml

README.md                 # Project overview, setup, usage
LICENSE                   # Open source license
CONTRIBUTING.md           # How to contribute
SECURITY.md               # Vulnerability reporting
CHANGELOG.md              # Version history
```

## Required Files

### README.md
Must include: project name, description, installation, usage, contributing link, license.

### SECURITY.md
```markdown
# Security Policy

## Supported Versions
| Version | Supported |
|---------|-----------|
| 2.x     | Yes       |
| 1.x     | No        |

## Reporting a Vulnerability
Please report security vulnerabilities via GitHub's private vulnerability reporting.
Do NOT create a public issue for security vulnerabilities.
```

### PR Template
```markdown
## Summary
Brief description of changes and motivation.

## Changes
- Change 1
- Change 2

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated (if applicable)
```

### Issue Template (bug_report.yml)
```yaml
name: Bug Report
description: Report a bug or unexpected behavior
labels: ["bug", "triage"]
body:
  - type: textarea
    id: description
    attributes:
      label: Describe the bug
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to reproduce
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
    validations:
      required: true
```

## Examples

### Good
- Repository with all required files, templates forcing structured input
- SECURITY.md with clear reporting instructions and supported versions

### Bad
- No README or just the auto-generated one
- Missing LICENSE file (unclear legal status)
- No issue templates (unstructured, low-quality bug reports)
- SECURITY.md missing (unclear how to report vulnerabilities)

## Enforcement
Use GitHub's Community Standards checklist (visible in repository Insights).
Automate with a repository template that includes all required files.
