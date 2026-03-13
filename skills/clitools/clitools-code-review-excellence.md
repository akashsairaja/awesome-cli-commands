---
id: clitools-code-review-excellence
stackId: clitools
type: skill
name: Code Review Excellence
description: >-
  Master effective code review practices to provide constructive feedback,
  catch bugs early, and foster knowledge sharing while maintaining team
  morale.
difficulty: beginner
tags:
  - clitools
  - code
  - review
  - excellence
  - performance
  - security
  - code-review
compatibility:
  - claude-code
faq:
  - question: "When should I use the Code Review Excellence skill?"
    answer: >-
      Master effective code review practices to provide constructive feedback,
      catch bugs early, and foster knowledge sharing while maintaining team
      morale.
  - question: "What tools and setup does Code Review Excellence require?"
    answer: >-
      Works with standard CLI & Dev Tools tooling (various CLI tools, code
      generators). No special setup required beyond a working developer
      tooling environment.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Code Review Excellence

Transform code reviews from gatekeeping to knowledge sharing through constructive feedback, systematic analysis, and collaborative improvement.

## Use this skill when

- Reviewing pull requests and code changes
- Establishing code review standards
- Mentoring developers through review feedback
- Auditing for correctness, security, or performance

## Do not use this skill when

- There are no code changes to review
- The task is a design-only discussion without code
- You need to implement fixes instead of reviewing

## Instructions

- Read context, requirements, and test signals first.
- Review for correctness, security, performance, and maintainability.
- Provide actionable feedback with severity and rationale.
- Ask clarifying questions when intent is unclear.
- If detailed checklists are required, open `resources/implementation-playbook.md`.

## Output Format

- High-level summary of findings
- Issues grouped by severity (blocking, important, minor)
- Suggestions and questions
- Test and coverage notes

## Resources

- `resources/implementation-playbook.md` for detailed review patterns and templates.
