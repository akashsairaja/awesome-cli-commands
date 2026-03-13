---
id: github-codeowners-setup
stackId: github
type: skill
name: Configure CODEOWNERS for Automatic Review Assignment
description: >-
  Set up GitHub CODEOWNERS to automatically assign the right reviewers to pull
  requests based on file paths, ensuring domain experts review relevant code
  changes.
difficulty: intermediate
tags:
  - github
  - configure
  - codeowners
  - automatic
  - review
  - assignment
  - security
  - api
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Configure CODEOWNERS for Automatic Review Assignment skill?"
    answer: >-
      Set up GitHub CODEOWNERS to automatically assign the right reviewers to
      pull requests based on file paths, ensuring domain experts review
      relevant code changes. This skill provides a structured workflow for
      CI/CD workflows, PR automation, issue management, and repository
      configuration.
  - question: "What tools and setup does Configure CODEOWNERS for Automatic Review Assignment require?"
    answer: >-
      Requires Docker, Terraform CLI installed. Works with GitHub projects.
      Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Configure CODEOWNERS for Automatic Review Assignment

## Overview
CODEOWNERS is a GitHub feature that automatically requests reviews from specific teams or individuals when a pull request modifies files they own. It ensures domain experts always review relevant changes without manual assignment.

## Why This Matters
- **Right reviewers, automatically** — no manual assignment needed
- **Knowledge silos prevention** — ownership is explicit and visible
- **Faster reviews** — reviewers are notified immediately
- **Compliance** — audit trail of who is responsible for each code area

## How It Works

### Step 1: Create the CODEOWNERS File
```bash
# Place in repository root, docs/, or .github/ directory
mkdir -p .github
touch .github/CODEOWNERS
```

### Step 2: Define Ownership Rules
```
# .github/CODEOWNERS

# Default owners for everything (fallback)
* @org/engineering-leads

# Frontend team owns all UI code
/src/components/  @org/frontend-team
/src/pages/       @org/frontend-team
/src/styles/      @org/frontend-team
*.css             @org/frontend-team
*.tsx             @org/frontend-team

# Backend team owns API and database
/src/api/         @org/backend-team
/src/services/    @org/backend-team
/prisma/          @org/backend-team @org/dba-team

# DevOps owns infrastructure and CI
/.github/         @org/devops-team
/terraform/       @org/devops-team
/docker/          @org/devops-team
Dockerfile        @org/devops-team

# Security team must review auth changes
/src/auth/        @org/security-team
/src/middleware/auth*  @org/security-team

# Documentation
/docs/            @org/tech-writers
*.md              @org/tech-writers

# Specific critical files
/src/config/      @org/engineering-leads @org/security-team
package.json      @org/engineering-leads
```

### Step 3: Enable Branch Protection
```bash
# Via GitHub CLI — require CODEOWNERS approval
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"require_code_owner_reviews":true}' \
  --field enforce_admins=true
```

### Step 4: Verify Ownership
```bash
# Check who owns a specific file
# (GitHub shows this in the PR "Files changed" tab)
# Use the CODEOWNERS syntax checker in repo Settings > Branches
```

## Best Practices
- Use team mentions (@org/team) instead of individual usernames
- Order rules from general to specific (last match wins)
- Keep ownership granular — avoid one team owning everything
- Review and update CODEOWNERS quarterly as teams restructure
- Combine with branch protection requiring CODEOWNERS approval

## Common Mistakes
- Placing CODEOWNERS in the wrong directory (must be root, docs/, or .github/)
- Using individual usernames instead of teams (breaks when people leave)
- Not enabling "Require review from Code Owners" in branch protection
- Overly broad patterns that assign the wrong team
- Forgetting that the last matching pattern takes precedence
