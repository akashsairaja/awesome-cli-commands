---
id: k6-check-requirements
stackId: k6
type: rule
name: Response Validation with Checks
description: >-
  Require check() calls for every HTTP request in k6 scripts — validate status
  codes, response bodies, and headers to catch functional failures under load.
difficulty: beginner
globs:
  - '**/*.k6.js'
  - '**/k6/**'
  - '**/load-test*'
  - '**/perf-test*'
tags:
  - checks
  - response-validation
  - assertions
  - functional-testing
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
  - question: What are k6 checks?
    answer: >-
      Checks are response validation assertions in k6. They verify status codes,
      response bodies, headers, and other response properties. Unlike thresholds
      (which are global pass/fail), checks are per-request validations that
      track pass/fail rates across the test.
  - question: Why should every k6 request have checks?
    answer: >-
      Without checks, a server returning 500 errors counts as 'successful' in k6
      metrics — the request completed, just with an error. Checks catch
      functional failures under load, revealing that the application breaks
      before latency increases.
relatedItems:
  - k6-threshold-requirements
  - k6-think-time-rules
  - k6-script-development
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Response Validation with Checks

## Rule
Every HTTP request in a k6 script MUST have at least one `check()` call validating the response. Requests without checks can return errors that are invisible in metrics.

## Format
```javascript
import { check } from 'k6';

const res = http.get(url);
check(res, {
  'status is 200': (r) => r.status === 200,
  'response has data': (r) => JSON.parse(r.body).data !== undefined,
});
```

## Required Checks Per Request Type

### GET Requests
```javascript
check(res, {
  'status is 200': (r) => r.status === 200,
  'response body is not empty': (r) => r.body.length > 0,
  'response is valid JSON': (r) => {
    try { JSON.parse(r.body); return true; } catch { return false; }
  },
});
```

### POST Requests
```javascript
check(res, {
  'status is 201': (r) => r.status === 201,
  'returns created resource': (r) => JSON.parse(r.body).id !== undefined,
});
```

### Authentication
```javascript
check(loginRes, {
  'login returns 200': (r) => r.status === 200,
  'returns auth token': (r) => JSON.parse(r.body).token !== undefined,
  'token is not empty': (r) => JSON.parse(r.body).token.length > 0,
});
```

## Examples

### Good
```javascript
export default function () {
  const res = http.get(BASE_URL + '/api/products');
  check(res, {
    'products status 200': (r) => r.status === 200,
    'products returns array': (r) => Array.isArray(JSON.parse(r.body).data),
    'products count > 0': (r) => JSON.parse(r.body).data.length > 0,
  });
}
```

### Bad
```javascript
export default function () {
  // No checks — server errors are invisible!
  http.get(BASE_URL + '/api/products');
  sleep(1);
}
```

## Anti-Patterns
- HTTP requests without any check() calls
- Checking only status code without body validation
- Ignoring check failures in threshold configuration
- Parsing response body multiple times (parse once, check multiple fields)
