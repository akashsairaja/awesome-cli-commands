---
id: github-codex-gh-comments
stackId: github
type: skill
name: GitHub PR Comment Resolution
description: >-
  Help address review/issue comments on the open GitHub PR for the current
  branch using gh CLI; verify gh auth first and prompt the user to
  authenticate if not logged in.
difficulty: beginner
tags:
  - github
  - comment
  - resolution
  - prompting
compatibility:
  - codex
faq:
  - question: "When should I use the GitHub PR Comment Resolution skill?"
    answer: >-
      Help address review/issue comments on the open GitHub PR for the current
      branch using gh CLI; verify gh auth first and prompt the user to
      authenticate if not logged in. This skill provides a structured workflow
      for CI/CD workflows, PR automation, issue management, and repository
      configuration.
  - question: "What tools and setup does GitHub PR Comment Resolution require?"
    answer: >-
      Works with standard GitHub tooling (GitHub CLI (gh), GitHub Actions). No
      special setup required beyond a working GitHub platform environment.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# PR Comment Handler

Guide to find the open PR for the current branch and address its comments with gh CLI. Run all `gh` commands with elevated network access.

Prereq: ensure `gh` is authenticated (for example, run `gh auth login` once), then run `gh auth status` with escalated permissions (include workflow/repo scopes) so `gh` commands succeed. If sandboxing blocks `gh auth status`, rerun it with `sandbox_permissions=require_escalated`.

## 1) Inspect comments needing attention
- Run scripts/fetch_comments.py which will print out all the comments and review threads on the PR

## 2) Ask the user for clarification
- Number all the review threads and comments and provide a short summary of what would be required to apply a fix for it
- Ask the user which numbered comments should be addressed

## 3) If user chooses comments
- Apply fixes for the selected comments

Notes:
- If gh hits auth/rate issues mid-run, prompt the user to re-authenticate with `gh auth login`, then retry.
