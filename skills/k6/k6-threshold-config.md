---
id: k6-threshold-config
stackId: k6
type: skill
name: Threshold Configuration and Scenarios
description: >-
  Configure k6 thresholds for pass/fail criteria and scenarios for complex
  load patterns — ramping, constant arrival rate, and multi-scenario test
  execution.
difficulty: beginner
tags:
  - k6
  - threshold
  - configuration
  - scenarios
  - performance
  - testing
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Threshold Configuration and Scenarios skill?"
    answer: >-
      Configure k6 thresholds for pass/fail criteria and scenarios for complex
      load patterns — ramping, constant arrival rate, and multi-scenario test
      execution. It includes practical examples for k6 development.
  - question: "What tools and setup does Threshold Configuration and Scenarios require?"
    answer: >-
      Works with standard k6 tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Threshold Configuration and Scenarios

## Overview
Thresholds define pass/fail criteria for load tests — without them, you are observing, not testing. Scenarios define HOW load is applied — constant VUs, ramping patterns, or arrival-rate-based models.

## Why This Matters
- **Thresholds** turn observations into assertions — CI can gate on performance
- **Scenarios** model realistic traffic patterns (gradual ramp, spike, steady state)
- **Together** they create automated performance tests that catch regressions

## Threshold Configuration

### Basic Thresholds
```javascript
export const options = {
  thresholds: {
    // Response time
    http_req_duration: ['p(95)<500', 'p(99)<1500'],

    // Error rate
    http_req_failed: ['rate<0.01'],

    // Check pass rate
    checks: ['rate>0.99'],

    // Throughput
    http_reqs: ['rate>100'],

    // Per-endpoint thresholds
    'http_req_duration{name:login}': ['p(95)<300'],
    'http_req_duration{name:search}': ['p(95)<800'],
  },
};
```

### Threshold with Abort
```javascript
thresholds: {
  http_req_failed: [
    { threshold: 'rate<0.1', abortOnFail: true, delayAbortEval: '30s' },
  ],
},
```

## Scenario Configuration

### Ramping VUs (Standard Load Test)
```javascript
export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },    // ramp up
        { duration: '5m', target: 50 },    // steady state
        { duration: '2m', target: 100 },   // peak load
        { duration: '5m', target: 100 },   // sustained peak
        { duration: '2m', target: 0 },     // ramp down
      ],
    },
  },
};
```

### Constant Arrival Rate (Throughput-Based)
```javascript
export const options = {
  scenarios: {
    api_test: {
      executor: 'constant-arrival-rate',
      rate: 100,               // 100 iterations per timeUnit
      timeUnit: '1s',          // per second = 100 RPS
      duration: '5m',
      preAllocatedVUs: 50,
      maxVUs: 200,
    },
  },
};
```

### Multi-Scenario (Mixed Workload)
```javascript
export const options = {
  scenarios: {
    browse: {
      executor: 'constant-vus',
      vus: 20,
      duration: '10m',
      exec: 'browseProducts',
    },
    purchase: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      stages: [
        { duration: '5m', target: 10 },
        { duration: '5m', target: 10 },
      ],
      preAllocatedVUs: 20,
      exec: 'purchaseFlow',
    },
  },
};

export function browseProducts() { /* browsing scenario */ }
export function purchaseFlow() { /* purchase scenario */ }
```

## Best Practices
- Define thresholds for EVERY load test — no threshold means no pass/fail
- Use p95 and p99 for latency, not averages
- Include error rate thresholds (rate<0.01) to catch functional failures
- Use `abortOnFail` for critical thresholds to stop wasting time on broken tests
- Model at least 3 scenarios: normal load, peak load, and spike

## Common Mistakes
- Running load tests without thresholds (observation is not testing)
- Using only average response time as a threshold (hides tail latency)
- Not including ramp-down period (abrupt stop masks cleanup issues)
- Setting thresholds based on hope, not baseline measurements
