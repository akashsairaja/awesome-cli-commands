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
  - k6
  - cicd
  - integration
  - performance
  - testing
  - ci-cd
  - docker
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the K6 CI/CD Integration skill?"
    answer: >-
      Integrate k6 load tests into CI/CD pipelines with GitHub Actions —
      automated performance gates, result artifacts, trend tracking, and
      Grafana dashboard outputs. This skill provides a structured workflow for
      development tasks.
  - question: "What tools and setup does K6 CI/CD Integration require?"
    answer: >-
      Requires Docker installed. Works with k6 projects. No additional
      configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
