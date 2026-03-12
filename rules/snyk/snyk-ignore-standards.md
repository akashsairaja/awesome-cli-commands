---
id: snyk-ignore-standards
stackId: snyk
type: rule
name: .snyk Ignore Policy Standards
description: >-
  Enforce standards for Snyk ignore entries — every ignored vulnerability must
  have a documented reason, expiration date, and compensating controls in the
  .snyk policy file.
difficulty: intermediate
globs:
  - '**/.snyk'
tags:
  - snyk-ignore
  - policy
  - risk-acceptance
  - compliance
  - snyk
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
  - question: How do I properly ignore a Snyk vulnerability?
    answer: >-
      Use 'snyk ignore --id=SNYK-ID --reason="justification"
      --expiry=YYYY-MM-DD'. This adds a documented entry to the .snyk file with
      a clear reason and automatic expiration. Never ignore without a reason —
      undocumented risk acceptance is a security anti-pattern.
  - question: What is the maximum ignore duration for Snyk findings?
    answer: >-
      90 days maximum. After expiration, the vulnerability reappears in scans
      for re-evaluation. If the risk is still accepted, renew with an updated
      reason. If a fix has become available, upgrade the dependency instead of
      renewing the ignore.
relatedItems:
  - snyk-severity-policy
  - snyk-license-compliance
  - snyk-remediation-advisor
version: 1.0.0
lastUpdated: '2026-03-11'
---

# .snyk Ignore Policy Standards

## Rule
Every ignored vulnerability in .snyk MUST include: reason, expiration date (max 90 days), and compensating controls. Permanent ignores are prohibited.

## Format
```yaml
# .snyk
version: v1.25.0
ignore:
  SNYK-JS-PACKAGE-1234567:
    - '*':
        reason: '<clear justification>'
        expires: 2026-06-01T00:00:00.000Z
        created: 2026-03-11T00:00:00.000Z
```

## Examples

### Good
```yaml
ignore:
  SNYK-JS-MINIMIST-2429795:
    - '*':
        reason: 'Transitive dependency via dev-only tool. Not reachable in production builds. Compensated by input validation middleware.'
        expires: 2026-06-01T00:00:00.000Z
        created: 2026-03-11T00:00:00.000Z
```

### Bad
```yaml
ignore:
  SNYK-JS-MINIMIST-2429795:
    - '*':
        reason: 'not important'
        # No expiration — permanent ignore
```

## CLI Usage
```bash
# Ignore with reason and expiry (correct)
snyk ignore --id=SNYK-JS-MINIMIST-2429795 \
  --reason="Dev dependency, not in production" \
  --expiry=2026-06-01

# Bad — no reason or expiry
snyk ignore --id=SNYK-JS-MINIMIST-2429795
```

## Review Process
1. .snyk file changes require security team approval in PR review
2. Monthly audit: check for expired entries, re-evaluate active ignores
3. When a fix becomes available, remove the ignore and upgrade

## Anti-Patterns
- Ignoring vulnerabilities from the CLI without --reason
- Expiration dates more than 90 days out
- Copying .snyk files between projects without re-evaluation
- One developer approving their own ignore entries
