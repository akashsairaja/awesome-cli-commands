---
id: grafana-promql-mastery
stackId: grafana
type: skill
name: Write Effective PromQL Queries for Grafana
description: >-
  Master PromQL for Grafana dashboards — rate calculations, histogram quantiles,
  label filtering, aggregations, and common patterns for monitoring services.
difficulty: intermediate
tags:
  - promql
  - prometheus
  - queries
  - metrics
  - monitoring
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Grafana with Prometheus data source
  - Application instrumented with Prometheus metrics
faq:
  - question: What is the difference between rate() and irate() in PromQL?
    answer: >-
      rate() calculates the per-second average rate over the entire range (e.g.,
      5 minutes), producing smooth graphs. irate() uses only the last two data
      points, producing volatile graphs that show instant spikes. Use rate() for
      dashboards and alerting, irate() only for debugging specific moments.
  - question: How do I calculate percentile latency in PromQL?
    answer: >-
      Use histogram_quantile() with rate() on histogram buckets:
      histogram_quantile(0.95, sum by (le)
      (rate(http_request_duration_seconds_bucket[5m]))). The 'le' label (less
      than or equal) must be preserved in the sum aggregation for the quantile
      calculation to work correctly.
  - question: What range should I use in rate() for PromQL queries?
    answer: >-
      Use [5m] for dashboard panels — it provides smooth, readable graphs. Use
      [1m] or [2m] for alert rules — shorter ranges detect issues faster. The
      range should be at least 4x your scrape interval to ensure enough data
      points for accurate calculation.
relatedItems:
  - grafana-dashboard-architect
  - grafana-alerting-setup
version: 1.0.0
lastUpdated: '2026-03-11'
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
