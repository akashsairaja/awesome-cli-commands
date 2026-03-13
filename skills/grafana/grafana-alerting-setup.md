---
id: grafana-alerting-setup
stackId: grafana
type: skill
name: Configure Grafana Unified Alerting
description: >-
  Set up Grafana Unified Alerting — alert rules, notification policies,
  contact points, silence rules, and multi-channel routing for effective
  incident response.
difficulty: intermediate
tags:
  - grafana
  - configure
  - unified
  - alerting
  - monitoring
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Configure Grafana Unified Alerting skill?"
    answer: >-
      Set up Grafana Unified Alerting — alert rules, notification policies,
      contact points, silence rules, and multi-channel routing for effective
      incident response. This skill provides a structured workflow for
      dashboard creation, alerting, PromQL queries, and monitoring setup.
  - question: "What tools and setup does Configure Grafana Unified Alerting require?"
    answer: >-
      Works with standard Grafana tooling (Grafana CLI, Grafana API). Review
      the setup section in the skill content for specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Configure Grafana Unified Alerting

## Overview
Grafana Unified Alerting evaluates alert rules against your data sources and routes notifications through configurable policies. It supports multi-condition alerts, grouping, silencing, and integration with Slack, PagerDuty, email, and webhooks.

## Why This Matters
- **Proactive monitoring** — detect issues before users report them
- **Smart routing** — right alerts to right teams via right channels
- **Noise reduction** — grouping and silence rules prevent alert fatigue
- **Accountability** — clear ownership and escalation paths

## How It Works

### Step 1: Create an Alert Rule
```yaml
# Alert: High Error Rate
apiVersion: 1
groups:
  - orgId: 1
    name: service-alerts
    folder: Service Monitoring
    interval: 1m
    rules:
      - uid: high-error-rate
        title: "High Error Rate"
        condition: C
        data:
          - refId: A
            datasourceUid: prometheus
            model:
              expr: sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100
          - refId: B
            datasourceUid: "-100"
            model:
              type: reduce
              reducer: last
              expression: A
          - refId: C
            datasourceUid: "-100"
            model:
              type: threshold
              expression: B
              conditions:
                - evaluator:
                    type: gt
                    params: [5]
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "Error rate is {{ $value }}% (threshold: 5%)"
          runbook_url: https://wiki.example.com/runbooks/high-error-rate
```

### Step 2: Configure Contact Points
```yaml
# Notification channels
apiVersion: 1
contactPoints:
  - orgId: 1
    name: slack-engineering
    receivers:
      - uid: slack-eng
        type: slack
        settings:
          url: https://hooks.slack.com/services/xxx
          channel: "#engineering-alerts"
          title: "{{ .CommonLabels.alertname }}"
          text: "{{ .CommonAnnotations.summary }}"

  - orgId: 1
    name: pagerduty-oncall
    receivers:
      - uid: pd-oncall
        type: pagerduty
        settings:
          integrationKey: "xxx"
          severity: "{{ .CommonLabels.severity }}"
```

### Step 3: Configure Notification Policies
```yaml
# Routing rules
apiVersion: 1
policies:
  - orgId: 1
    receiver: slack-engineering     # Default route
    group_by: ['alertname', 'service']
    group_wait: 30s
    group_interval: 5m
    repeat_interval: 4h
    routes:
      - receiver: pagerduty-oncall
        matchers:
          - severity = critical
        continue: true              # Also send to default
      - receiver: slack-engineering
        matchers:
          - severity = warning
        group_wait: 1m
        repeat_interval: 12h
```

### Step 4: Create Silence Rules
```bash
# Silence alerts during maintenance window
# Via Grafana UI: Alerting > Silences > New Silence

# Silence by label match
# Matchers: service=api, environment=staging
# Duration: 2 hours
# Comment: "Scheduled maintenance - API upgrade"
```

## Best Practices
- Use `for: 5m` minimum to prevent flapping alerts
- Group alerts by service to reduce notification volume
- Include runbook_url in every alert annotation
- Route critical alerts to PagerDuty, warnings to Slack
- Set repeat_interval to 4h (critical) or 12h (warning)
- Test alerts in staging before enabling in production
- Review alert rules quarterly — prune unused, fix noisy

## Common Mistakes
- No `for` duration (fires on momentary spikes)
- All alerts to same channel (alert fatigue)
- Missing runbook link (responder does not know what to do)
- repeat_interval too short (repeated spam for known issues)
- Not grouping related alerts (10 notifications for one incident)
