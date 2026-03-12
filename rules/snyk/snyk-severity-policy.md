---
id: snyk-severity-policy
stackId: snyk
type: rule
name: Vulnerability Severity Policy
description: >-
  Define organizational severity policies for Snyk findings — CRITICAL/HIGH
  block deployments, MEDIUM tracked in backlog, LOW logged for awareness with
  clear SLA timelines.
difficulty: beginner
globs:
  - '**/.snyk'
  - '**/package.json'
  - '**/requirements*.txt'
tags:
  - severity-policy
  - sla
  - vulnerability-management
  - triage
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
  - question: What severity threshold should Snyk use in CI?
    answer: >-
      Use --severity-threshold=high to block CRITICAL and HIGH vulnerabilities
      in CI. This catches serious, exploitable issues without overwhelming
      developers with LOW/MEDIUM alerts. Track MEDIUM and LOW in the Snyk
      dashboard for backlog prioritization.
  - question: How quickly should Snyk CRITICAL vulnerabilities be fixed?
    answer: >-
      Within 24 hours. CRITICAL vulnerabilities with known exploits should be
      treated as incidents — page the on-call engineer if the vulnerability is
      in a production service. Have a process for emergency dependency updates
      outside normal sprint cycles.
relatedItems:
  - snyk-ignore-standards
  - snyk-license-compliance
  - snyk-devsecops-engineer
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Vulnerability Severity Policy

## Rule
All Snyk findings MUST be triaged according to severity policy. CRITICAL and HIGH vulnerabilities block production deployments until resolved or formally accepted.

## Severity SLA
| Severity | Action | Resolution SLA | CI Gate |
|----------|--------|---------------|---------|
| CRITICAL | Fix immediately, page on-call if in production | 24 hours | Block |
| HIGH | Fix in current sprint | 7 days | Block |
| MEDIUM | Add to backlog, fix within 30 days | 30 days | Warn |
| LOW | Log for awareness, fix opportunistically | 90 days | Pass |

## CI Configuration
```bash
# Block on CRITICAL and HIGH
snyk test --severity-threshold=high

# Monitor with all severities for tracking
snyk monitor
```

## Triage Factors (Beyond Severity)
1. **Snyk Priority Score** — considers exploit maturity and reachability
2. **Fix availability** — is an upgrade or patch available?
3. **Attack surface** — is the vulnerable code reachable from user input?
4. **Compensating controls** — WAF, network segmentation, input validation

## Examples

### Good Triage
```
CVE-2024-0001 (CRITICAL, score 950, exploit in wild)
→ Action: Fix immediately, upgrade dependency
→ Timeline: Same day

CVE-2024-0002 (HIGH, score 400, no known exploit)
→ Action: Schedule for current sprint
→ Timeline: Within 7 days

CVE-2024-0003 (MEDIUM, score 200, test dependency only)
→ Action: Add to backlog
→ Timeline: Within 30 days
```

## Anti-Patterns
- Treating all CRITICALs equally without checking priority score
- Permanently ignoring vulnerabilities without review dates
- Blocking CI on LOW severity (causes alert fatigue)
- Not tracking SLA compliance metrics
