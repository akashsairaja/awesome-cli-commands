---
id: grafana-alerting-standards
stackId: grafana
type: rule
name: Alert Rule Standards
description: >-
  Enforce standards for Grafana alert rules — naming conventions, severity
  labels, for-duration requirements, runbook annotations, and notification
  routing rules.
difficulty: intermediate
globs:
  - '**/grafana/alerting/**/*.yaml'
  - '**/grafana/provisioning/**/*.yaml'
tags:
  - grafana
  - alerting
  - standards
  - severity
  - runbook
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
  - question: Why must every Grafana alert have a runbook link?
    answer: >-
      Runbook links connect alerts to remediation steps. Without them, on-call
      responders waste time investigating what the alert means and how to fix it
      — especially at 3 AM. A runbook should describe: what the alert means,
      likely causes, diagnostic commands, and remediation steps.
  - question: How long should the 'for' duration be on Grafana alerts?
    answer: >-
      At least 5 minutes for critical alerts, 10 minutes for warnings. The 'for'
      duration prevents false alerts from momentary spikes, network blips, or
      metric scrape gaps. Without it, you get alert storms that erode trust in
      the monitoring system.
relatedItems:
  - grafana-alerting-agent
  - grafana-dashboard-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Alert Rule Standards

## Rule
All Grafana alert rules MUST have severity labels, for-duration, runbook links, and follow consistent naming patterns. Alerts MUST route based on severity level.

## Naming Convention
```
[Service] Symptom Description
```
Examples:
- "[API] High Error Rate"
- "[Database] Connection Pool Exhausted"
- "[Worker] Job Queue Backlog Growing"

## Required Labels
| Label | Values | Purpose |
|-------|--------|---------|
| severity | critical, warning, info | Routing priority |
| team | backend, frontend, infra | Ownership |
| service | api, worker, database | Affected service |
| environment | production, staging | Environment scope |

## Required Annotations
| Annotation | Content |
|-----------|---------|
| summary | "{{ $value }} — brief description of what is wrong" |
| description | Detailed explanation with affected service and impact |
| runbook_url | Link to remediation steps |

## For-Duration Requirements
| Severity | Minimum for-duration |
|----------|---------------------|
| critical | 5 minutes |
| warning | 10 minutes |
| info | 15 minutes |

## Routing Rules
| Severity | Channel | Repeat Interval |
|----------|---------|----------------|
| critical | PagerDuty + Slack | 30 minutes |
| warning | Slack | 4 hours |
| info | Email digest | 24 hours |

## Examples

### Good
```yaml
- title: "[API] High Error Rate"
  for: 5m
  labels:
    severity: critical
    team: backend
    service: api
  annotations:
    summary: "Error rate is {{ $value }}% (threshold: 5%)"
    runbook_url: https://wiki.example.com/runbooks/api-error-rate
```

### Bad
```yaml
- title: "Alert 1"           # Non-descriptive name
  for: 0s                     # No for-duration
  # No severity label
  # No runbook link
```

## Enforcement
Review alert rules in provisioning PRs.
Audit active alerts monthly for noise/relevance.
Test alert routing in staging environment.
