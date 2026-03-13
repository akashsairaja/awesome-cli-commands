---
id: bash-bash-defensive-patterns
stackId: bash
type: skill
name: Bash Defensive Patterns
description: Master defensive Bash programming techniques for production-grade scripts.
difficulty: beginner
tags:
  - bash
  - defensive
  - patterns
  - deployment
  - automation
  - monitoring
  - ci-cd
  - best-practices
compatibility:
  - claude-code
faq:
  - question: When should I use the Bash Defensive Patterns skill?
    answer: Master defensive Bash programming techniques for production-grade scripts.
  - question: What tools and setup does Bash Defensive Patterns require?
    answer: >-
      Requires pip/poetry installed. Works with Bash projects. No additional
      configuration needed beyond standard tooling.
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Bash Defensive Patterns

Comprehensive guidance for writing production-ready Bash scripts using defensive programming techniques, error handling, and safety best practices to prevent common pitfalls and ensure reliability.

## Use this skill when

- Writing production automation scripts
- Building CI/CD pipeline scripts
- Creating system administration utilities
- Developing error-resilient deployment automation
- Writing scripts that must handle edge cases safely
- Building maintainable shell script libraries
- Implementing comprehensive logging and monitoring
- Creating scripts that must work across different platforms

## Do not use this skill when

- You need a single ad-hoc shell command, not a script
- The target environment requires strict POSIX sh only
- The task is unrelated to shell scripting or automation

## Instructions

1. Confirm the target shell, OS, and execution environment.
2. Enable strict mode and safe defaults from the start.
3. Validate inputs, quote variables, and handle files safely.
4. Add logging, error traps, and basic tests.

## Safety

- Avoid destructive commands without confirmation or dry-run flags.
- Do not run scripts as root unless strictly required.


