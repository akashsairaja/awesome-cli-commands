---
id: grafana-promql-mastery
stackId: grafana
type: skill
name: Write Effective PromQL Queries for Grafana
description: >-
  Master PromQL for Grafana dashboards — rate calculations, histogram
  quantiles, label filtering, aggregations, and common patterns for monitoring
  services.
difficulty: intermediate
tags:
  - grafana
  - write
  - effective
  - promql
  - queries
  - performance
  - monitoring
  - debugging
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Write Effective PromQL Queries for Grafana skill?"
    answer: >-
      Master PromQL for Grafana dashboards — rate calculations, histogram
      quantiles, label filtering, aggregations, and common patterns for
      monitoring services. This skill provides a structured workflow for
      dashboard creation, alerting, PromQL queries, and monitoring setup.
  - question: "What tools and setup does Write Effective PromQL Queries for Grafana require?"
    answer: >-
      Works with standard Grafana tooling (Grafana CLI, Grafana API). No
      special setup required beyond a working observability environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Write Effective PromQL Queries for Grafana

## Overview
PromQL (Prometheus Query Language) is the primary query language for Grafana dashboards backed by Prometheus. It enables powerful metric aggregation, filtering, and calculation for monitoring and alerting.

## Why This Matters
- **Accurate metrics** — proper PromQL gives correct rates, not misleading raw counters
- **Performance** — efficient queries reduce Prometheus load
- **Alerting** — PromQL powers Grafana alert rules
- **Debugging** — slice and dice metrics to isolate issues

## How It Works

### Step 1: Request Rate (RED - Rate)
```promql
# Requests per second over 5 minutes
rate(http_requests_total[5m])

# Requests per second by status code
sum by (status_code) (rate(http_requests_total[5m]))

# Total request rate for a service
sum(rate(http_requests_total{service="api"}[5m]))
```

### Step 2: Error Rate (RED - Errors)
```promql
# Error percentage
sum(rate(http_requests_total{status_code=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))
* 100

# Error rate by endpoint
sum by (endpoint) (
  rate(http_requests_total{status_code=~"5.."}[5m])
)
```

### Step 3: Latency (RED - Duration)
```promql
# P50 latency (median)
histogram_quantile(0.5, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))

# P95 latency
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))

# P99 latency
histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
```

### Step 4: Resource Utilization (USE)
```promql
# CPU utilization percentage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory utilization percentage
(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100

# Disk utilization percentage
(1 - node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100
```

### Step 5: Advanced Patterns
```promql
# Apdex score (satisfied + tolerating/2) / total
(
  sum(rate(http_request_duration_seconds_bucket{le="0.3"}[5m]))
  + sum(rate(http_request_duration_seconds_bucket{le="1.2"}[5m]))
) / 2
/
sum(rate(http_request_duration_seconds_count[5m]))

# Rate of change (is metric growing/shrinking?)
deriv(process_resident_memory_bytes[1h])

# Top 5 endpoints by request rate
topk(5, sum by (endpoint) (rate(http_requests_total[5m])))
```

## Best Practices
- Always use rate() on counters, never display raw counter values
- Use sum by (label) for aggregation with label preservation
- Use [5m] range for rate() in dashboards (smooth, readable)
- Use [1m] range for rate() in alerts (faster detection)
- Label filter early in queries to reduce Prometheus processing
- Use recording rules for expensive queries used by multiple dashboards

## Common Mistakes
- Displaying raw counters without rate() (ever-increasing line)
- Using irate() in dashboards (too volatile, use rate() instead)
- Not filtering by job/service (aggregating unrelated metrics)
- histogram_quantile without rate() inside (incorrect values)
- Missing sum by (le) in histogram_quantile (wrong aggregation)
