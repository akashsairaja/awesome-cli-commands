---
id: k6-threshold-requirements
stackId: k6
type: rule
name: Mandatory Threshold Configuration
description: >-
  Require performance thresholds in every k6 script — p95 response time, error
  rate, and check pass rate must be defined for automated pass/fail in CI
  pipelines.
difficulty: beginner
globs:
  - '**/*.k6.js'
  - '**/k6/**'
  - '**/load-test*'
  - '**/perf-test*'
tags:
  - thresholds
  - performance-criteria
  - pass-fail
  - slo
  - k6
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
  - question: Why are k6 thresholds mandatory?
    answer: >-
      Without thresholds, k6 always exits with code 0 (success) regardless of
      performance. Thresholds convert observations into automated pass/fail
      criteria — essential for CI/CD gates. A load test without thresholds is
      like a unit test without assertions.
  - question: What p95 threshold should I set for API endpoints?
    answer: >-
      Start with your current baseline p95 plus 20% headroom. If you have no
      baseline, 500ms is a reasonable starting point for standard API endpoints.
      Measure first, then set thresholds — never guess. Adjust based on real
      production latency requirements.
relatedItems:
  - k6-check-requirements
  - k6-think-time-rules
  - k6-threshold-config
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Mandatory Threshold Configuration

## Rule
Every k6 test script MUST define thresholds in the `options` export. Running load tests without thresholds is prohibited — observation without criteria is not testing.

## Required Thresholds

### Minimum Configuration
```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'],    // 95th percentile under 500ms
    http_req_failed: ['rate<0.01'],      // Error rate under 1%
    checks: ['rate>0.99'],              // 99% of checks pass
  },
};
```

### Recommended Configuration
```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
    http_reqs: ['rate>50'],             // Minimum throughput
    'http_req_duration{name:login}': ['p(95)<300'],  // Per-endpoint
    'http_req_duration{name:search}': ['p(95)<800'],
  },
};
```

## Examples

### Good
```javascript
export const options = {
  stages: [{ duration: '5m', target: 50 }],
  thresholds: {
    http_req_duration: ['p(95)<400'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};
```

### Bad
```javascript
// No thresholds — this is NOT a test, it's an observation
export const options = {
  stages: [{ duration: '5m', target: 50 }],
};
```

## Threshold Value Guidelines
| Environment | p95 Latency | Error Rate | Check Rate |
|-------------|------------|------------|------------|
| API endpoints | < 500ms | < 1% | > 99% |
| Search/query | < 800ms | < 1% | > 99% |
| File upload | < 3000ms | < 2% | > 98% |
| Static assets | < 200ms | < 0.1% | > 99.9% |

## Anti-Patterns
- Scripts without any thresholds defined
- Thresholds set so high they never fail (p95<30000 is meaningless)
- Only average-based thresholds (avg<500 hides tail latency)
- Disabling thresholds in CI to "get the build green"
