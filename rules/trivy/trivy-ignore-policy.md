---
id: trivy-ignore-policy
stackId: trivy
type: rule
name: Vulnerability Ignore Policy
description: >-
  Define strict standards for .trivyignore entries — every ignored CVE must have
  documented justification, a review date, and approval from a
  security-responsible team member.
difficulty: intermediate
globs:
  - '**/.trivyignore'
  - '**/trivy*'
tags:
  - trivyignore
  - vulnerability-management
  - policy
  - compliance
  - trivy
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
  - question: What should a .trivyignore entry contain?
    answer: >-
      Every entry needs: the CVE ID, a brief description, justification for
      ignoring it, compensating mitigations in place, the approver's name, and a
      review date (max 6 months out). This ensures accountability and regular
      re-evaluation of accepted risks.
  - question: How often should .trivyignore entries be reviewed?
    answer: >-
      Review at the documented review date (max 6 months). Run monthly automated
      audits to flag expired entries. When a fix becomes available for an
      ignored CVE, prioritize updating the dependency and removing the ignore
      entry.
relatedItems:
  - trivy-scan-before-push
  - trivy-base-image-standards
  - trivy-vulnerability-advisor
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Vulnerability Ignore Policy

## Rule
Every entry in .trivyignore MUST include: the CVE ID, a justification comment, a review date, and the name of the person who approved the exception.

## Format
```
# CVE-YYYY-NNNNN: <brief description>
# Justification: <why this is acceptable>
# Mitigations: <what compensating controls exist>
# Approved by: <name>
# Review date: YYYY-MM-DD
CVE-YYYY-NNNNN
```

## Examples

### Good
```
# CVE-2023-44487: HTTP/2 Rapid Reset DDoS vulnerability
# Justification: Mitigated at load balancer level with rate limiting
# Mitigations: Cloudflare WAF rule deployed, HTTP/2 disabled on internal services
# Approved by: Alice Chen (Security Lead)
# Review date: 2026-06-01
CVE-2023-44487

# CVE-2024-0001: OpenSSL buffer overflow in deprecated API
# Justification: Our code does not use the affected API (EVP_DecryptUpdate)
# Mitigations: Static analysis confirms no usage; monitored via grep in CI
# Approved by: Bob Smith (Platform Team)
# Review date: 2026-04-15
CVE-2024-0001
```

### Bad
```
# No explanation
CVE-2023-44487

# Lazy justification
# "not important"
CVE-2024-0001
```

## Review Process
1. When a .trivyignore entry reaches its review date, re-evaluate:
   - Is a fix now available? → Remove from ignore, update dependency
   - Is the risk still mitigated? → Extend review date by 90 days max
   - Has the threat landscape changed? → Reassess with security team
2. Run monthly audits of .trivyignore to catch expired entries

## Anti-Patterns
- Blank .trivyignore entries without any context
- Review dates more than 6 months in the future
- Copying .trivyignore from other projects without evaluation
- Ignoring entire severity levels instead of specific CVEs
- One person approving their own ignore entries
