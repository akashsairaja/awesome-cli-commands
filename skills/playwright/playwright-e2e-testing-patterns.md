---
id: playwright-e2e-testing-patterns
stackId: playwright
type: skill
name: E2e Testing Patterns
description: >-
  Master end-to-end testing with Playwright and Cypress to build reliable test
  suites that catch bugs, improve confidence, and enable fast deployment.
difficulty: beginner
tags:
  - playwright
  - e2e
  - testing
  - patterns
  - automation
  - debugging
  - ci-cd
compatibility:
  - claude-code
faq:
  - question: "When should I use the E2e Testing Patterns skill?"
    answer: >-
      Master end-to-end testing with Playwright and Cypress to build reliable
      test suites that catch bugs, improve confidence, and enable fast
      deployment. This skill provides a structured workflow for end-to-end
      testing, visual regression, API testing, and CI/CD integration.
  - question: "What tools and setup does E2e Testing Patterns require?"
    answer: >-
      Requires pip/poetry installed. Works with Playwright projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# E2E Testing Patterns

Build reliable, fast, and maintainable end-to-end test suites that provide confidence to ship code quickly and catch regressions before users do.

## Use this skill when

- Implementing end-to-end test automation
- Debugging flaky or unreliable tests
- Testing critical user workflows
- Setting up CI/CD test pipelines
- Testing across multiple browsers
- Validating accessibility requirements
- Testing responsive designs
- Establishing E2E testing standards

## Do not use this skill when

- You only need unit or integration tests
- The environment cannot support stable UI automation
- You cannot provision safe test accounts or data

## Instructions

1. Identify critical user journeys and success criteria.
2. Build stable selectors and test data strategies.
3. Implement tests with retries, tracing, and isolation.
4. Run in CI with parallelization and artifact capture.

## Safety

- Avoid running destructive tests against production.
- Use dedicated test data and scrub sensitive output.

## Resources

- `resources/implementation-playbook.md` for detailed E2E patterns and templates.
