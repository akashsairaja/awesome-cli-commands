---
id: grafana-dashboard-standards
stackId: grafana
type: rule
name: Dashboard Design Standards
description: >-
  Enforce consistent Grafana dashboard design — panel layout, naming
  conventions, variable requirements, documentation panels, and RED/USE
  methodology compliance.
difficulty: beginner
globs:
  - '**/grafana/dashboards/**/*.json'
  - '**/grafana/provisioning/**/*.yaml'
tags:
  - grafana
  - dashboard
  - standards
  - red-method
  - monitoring
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
  - question: What panels should every Grafana dashboard start with?
    answer: >-
      Start with the RED method panels: Request Rate (requests per second),
      Error Rate (percentage of 5xx responses), and Duration (P50, P95, P99
      latency). These three golden signals give immediate visibility into
      service health and should be the first things you see.
  - question: Why should every Grafana dashboard have template variables?
    answer: >-
      Template variables let users filter by environment, service, and namespace
      without creating separate dashboards. One dashboard serves production,
      staging, and development. Without variables, you end up with duplicated
      dashboards that drift out of sync.
relatedItems:
  - grafana-dashboard-architect
  - grafana-alerting-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Dashboard Design Standards

## Rule
All Grafana dashboards MUST follow the RED/USE method, include template variables, have documentation panels, and use consistent naming and layout patterns.

## Dashboard Structure
```
Row 1: Golden Signals (Rate, Errors, Duration)
Row 2: Resource Utilization (CPU, Memory, Disk, Network)
Row 3: Application-Specific Metrics
Row 4: Logs and Events (collapsed by default)
```

## Required Template Variables
Every dashboard MUST include:
- `environment` — production, staging, development
- `namespace` or `service` — filter by service
- `interval` — query range variable (`$__interval`, 1m, 5m, 15m)

## Naming Conventions
| Item | Convention | Example |
|------|-----------|---------|
| Dashboard title | Service - Category | "API Service - Overview" |
| Panel title | Metric Description | "Request Rate by Endpoint" |
| Folder | Team or Domain | "Backend", "Infrastructure" |
| Variable | camelCase | `environment`, `serviceName` |

## Panel Requirements
- Meaningful title (not "Panel 1")
- Y-axis unit configured (req/s, %, bytes, ms)
- Legend with template labels
- Threshold colors: green (ok), yellow (warning), red (critical)
- Description field explaining what the panel shows

## Documentation
Every dashboard MUST have a text panel at the top with:
- What this dashboard monitors
- Who owns the service
- Link to runbook/wiki
- How to escalate issues

## Examples

### Good
- RED panels at top, resource panels below
- Template variables for environment and service
- Units on all Y-axes
- Documentation panel with runbook links

### Bad
- 50+ panels with no organization
- Hardcoded namespace/service names
- No units on axes (raw numbers)
- No documentation panel

## Enforcement
Review dashboards JSON in PRs.
Use provisioning to enforce consistent structure.
