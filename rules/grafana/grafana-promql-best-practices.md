---
id: grafana-promql-best-practices
stackId: grafana
type: rule
name: PromQL Query Standards
description: >-
  Enforce PromQL best practices for Grafana — rate vs irate usage, range vector
  requirements, label filtering, recording rules for complex queries, and
  histogram handling.
difficulty: intermediate
globs:
  - '**/grafana/dashboards/**/*.json'
  - '**/prometheus/rules/**/*.yaml'
tags:
  - promql
  - prometheus
  - standards
  - recording-rules
  - queries
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Why should I always use rate() on Prometheus counters?
    answer: >-
      Counters only increase, so displaying raw counter values shows an
      ever-increasing line that is not useful. rate() calculates the per-second
      rate of increase, showing meaningful metrics like 'requests per second'.
      Without rate(), counter resets (from restarts) appear as incorrect drops.
  - question: When should I use Prometheus recording rules?
    answer: >-
      Use recording rules when the same complex PromQL expression is used in
      multiple dashboards or alert rules. Recording rules pre-compute the result
      at a fixed interval, reducing query load on Prometheus and ensuring
      consistency. Name them using the convention 'level:metric:operations'.
relatedItems:
  - grafana-promql-mastery
  - grafana-dashboard-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# PromQL Query Standards

## Rule
All PromQL queries in Grafana dashboards and alerts MUST follow these patterns for correctness, performance, and consistency.

## Requirements

### Always Use rate() on Counters
```promql
# GOOD: rate converts counter to per-second rate
rate(http_requests_total[5m])

# BAD: raw counter (ever-increasing line)
http_requests_total
```

### Filter Labels Early
```promql
# GOOD: filter before aggregation
sum by (status_code) (rate(http_requests_total{service="api", environment="production"}[5m]))

# BAD: filter after aggregation (wastes resources)
sum by (status_code) (rate(http_requests_total[5m]))  # Then filter in Grafana UI
```

### Use Consistent Range Vectors
| Context | Range | Reason |
|---------|-------|--------|
| Dashboard panels | [5m] | Smooth, readable graphs |
| Alert rules | [1m] or [2m] | Faster detection |
| Recording rules | [5m] | Consistent with dashboards |

### Histogram Quantile Pattern
```promql
# CORRECT: rate inside histogram_quantile, sum by (le)
histogram_quantile(0.95,
  sum by (le) (rate(http_request_duration_seconds_bucket[5m]))
)

# INCORRECT: missing rate (wrong values)
histogram_quantile(0.95,
  sum by (le) (http_request_duration_seconds_bucket)
)
```

### Recording Rules for Complex Queries
```yaml
# When a query is used in multiple dashboards/alerts, create a recording rule
groups:
  - name: service-sli
    interval: 30s
    rules:
      - record: service:http_error_rate:ratio_rate5m
        expr: |
          sum by (service) (rate(http_requests_total{status_code=~"5.."}[5m]))
          /
          sum by (service) (rate(http_requests_total[5m]))
```

## Examples

### Good
- rate() on all counters with appropriate range vectors
- Labels filtered in the query, not the UI
- histogram_quantile with rate() and sum by (le)
- Recording rules for frequently used complex queries

### Bad
- Raw counters displayed without rate()
- irate() in dashboard panels (too volatile)
- Missing sum by (le) in histogram quantiles
- Same complex query copy-pasted across 10 dashboards

## Enforcement
Review PromQL in dashboard JSON PRs.
Use recording rules to simplify and standardize common queries.
