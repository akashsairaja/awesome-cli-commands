---
id: k6-ci-integration
stackId: k6
type: skill
name: K6 CI/CD Integration
description: >-
  Integrate k6 load tests into CI/CD pipelines with GitHub Actions — automated
  performance gates, result artifacts, trend tracking, and Grafana dashboard
  outputs.
difficulty: intermediate
tags:
  - ci-cd
  - github-actions
  - performance-gates
  - automation
  - k6
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - k6 installed
  - GitHub Actions (or equivalent CI)
  - Docker (for application setup)
faq:
  - question: How do I run k6 load tests in GitHub Actions?
    answer: >-
      Install k6 from the official apt repository, start your application with
      Docker Compose, wait for it to be healthy, then run k6 scripts. Upload
      results as artifacts. k6 exits with non-zero code when thresholds fail,
      automatically failing the CI step.
  - question: Should I run load tests on every pull request?
    answer: >-
      Run smoke tests (1 VU, 30 seconds) on every PR — they are fast and catch
      obvious regressions. Run full load tests on merge to main or on a nightly
      schedule. Full load tests take 10+ minutes and should not block PR
      reviews.
  - question: How do I track performance trends across k6 runs?
    answer: >-
      Export results with --out json=results.json and
      --summary-export=summary.json. Upload as CI artifacts. For dashboards,
      output to InfluxDB (--out influxdb=http://localhost:8086/k6) and visualize
      in Grafana. This shows performance trends across releases.
relatedItems:
  - k6-script-development
  - k6-threshold-config
  - k6-load-testing-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# K6 CI/CD Integration

## Overview
Running k6 in CI/CD creates automated performance gates — every PR gets tested for performance regressions. Thresholds fail the build if response times or error rates exceed acceptable limits.

## How It Works

### GitHub Actions Workflow
```yaml
# .github/workflows/k6.yml
name: Performance Tests
on:
  pull_request:
    branches: [main]

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Start application
        run: docker compose up -d
        working-directory: ./

      - name: Wait for application
        run: |
          for i in $(seq 1 30); do
            curl -s http://localhost:3000/health && break
            sleep 2
          done

      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
            --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
            | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update && sudo apt-get install k6

      - name: Run smoke test
        run: k6 run --out json=results/smoke.json tests/smoke.js

      - name: Run load test
        run: k6 run --out json=results/load.json tests/load.js

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: k6-results
          path: results/
          retention-days: 14

      - name: Stop application
        if: always()
        run: docker compose down
```

### Smoke Test for Every PR
```javascript
// tests/smoke.js — fast validation
export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
    checks: ['rate>0.95'],
  },
};
```

### Output to JSON for Trend Tracking
```bash
k6 run --out json=results.json --summary-export=summary.json test.js
```

## Best Practices
- Run smoke tests on every PR (fast, catches regressions)
- Run full load tests on merge to main or scheduled nightly
- Use Docker Compose to start the application in CI
- Upload JSON results as artifacts for historical comparison
- Set thresholds based on baseline measurements, not arbitrary numbers
- Use `--summary-export` for machine-readable output

## Common Mistakes
- Running full load tests on every PR (too slow, blocks merges)
- Not starting the application before k6 runs
- Not waiting for the application to be healthy before testing
- Ignoring threshold failures ("it is just a performance test")
