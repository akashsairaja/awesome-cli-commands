---
id: k6-think-time-rules
stackId: k6
type: rule
name: Mandatory Think Time Between Requests
description: >-
  Require sleep() calls between k6 HTTP requests to simulate realistic user
  behavior — prevent artificial burst traffic that skews performance results.
difficulty: beginner
globs:
  - '**/*.k6.js'
  - '**/k6/**'
  - '**/load-test*'
  - '**/perf-test*'
tags:
  - think-time
  - sleep
  - realistic-load
  - user-behavior
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
  - question: Why is think time important in k6 load tests?
    answer: >-
      Think time simulates the pause between user actions — reading a page,
      filling a form, reviewing results. Without it, each VU fires requests as
      fast as possible, creating artificial burst traffic that is 10-100x more
      intense than real users. This skews results and finds infrastructure
      limits, not application limits.
  - question: How much think time should I add between k6 requests?
    answer: >-
      1-5 seconds between page navigations, 0.5-2 seconds between API calls in a
      flow, and 3-10 seconds after content-heavy pages. Use randomized think
      time (Math.random() range) for more realistic variance. Measure real user
      behavior with analytics for the most accurate values.
relatedItems:
  - k6-threshold-requirements
  - k6-check-requirements
  - k6-script-development
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Mandatory Think Time Between Requests

## Rule
k6 scripts MUST include `sleep()` between HTTP requests to simulate realistic user think time. Scripts without think time create artificial burst traffic that does not represent real-world load.

## Format
```javascript
import { sleep } from 'k6';

export default function () {
  http.get(BASE_URL + '/page1');
  sleep(1);                        // 1 second think time

  http.get(BASE_URL + '/page2');
  sleep(Math.random() * 3 + 1);   // 1-4 seconds random think time

  http.post(BASE_URL + '/submit', payload);
  sleep(2);                        // User reviews confirmation
}
```

## Think Time Guidelines
| Action | Think Time |
|--------|-----------|
| Between page navigations | 2-5 seconds |
| After form submission | 1-3 seconds |
| Between API calls in a flow | 0.5-2 seconds |
| After reading content | 3-10 seconds |
| After login | 1-2 seconds |

## Realistic vs Burst Traffic
```javascript
// Bad — burst traffic (no think time)
export default function () {
  http.get(BASE_URL + '/api/users');
  http.get(BASE_URL + '/api/products');
  http.get(BASE_URL + '/api/orders');
  // 3 requests in ~0ms per VU — unrealistic
}

// Good — realistic user behavior
export default function () {
  http.get(BASE_URL + '/api/users');
  sleep(2);
  http.get(BASE_URL + '/api/products');
  sleep(3);
  http.get(BASE_URL + '/api/orders');
  sleep(1);
  // 3 requests in ~6s per VU — realistic
}
```

## Randomized Think Time
```javascript
// More realistic — users don't all pause for exactly the same duration
function thinkTime(min, max) {
  sleep(Math.random() * (max - min) + min);
}

export default function () {
  http.get(BASE_URL + '/page');
  thinkTime(1, 5); // 1 to 5 seconds
}
```

## Exceptions
- API-to-API load tests (no human user) may omit think time
- Spike tests may use minimal think time to simulate sudden bursts
- Document the reason when omitting think time

## Anti-Patterns
- No sleep() between any requests (artificial burst)
- sleep(0.01) as a token think time (still effectively burst)
- Uniform think time across all actions (not realistic)
- Removing think time to "increase load" (increase VUs instead)
