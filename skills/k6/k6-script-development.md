---
id: k6-script-development
stackId: k6
type: skill
name: K6 Load Test Script Development
description: >-
  Write k6 load test scripts with realistic user scenarios — HTTP requests,
  checks, groups, think time, and parameterized data for comprehensive API
  performance testing.
difficulty: beginner
tags:
  - k6
  - load
  - test
  - script
  - development
  - performance
  - api
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the K6 Load Test Script Development skill?"
    answer: >-
      Write k6 load test scripts with realistic user scenarios — HTTP
      requests, checks, groups, think time, and parameterized data for
      comprehensive API performance testing. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does K6 Load Test Script Development require?"
    answer: >-
      Works with standard k6 tooling (relevant CLI tools and frameworks). No
      special setup required beyond a working k6 environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# K6 Load Test Script Development

## Overview
k6 scripts define virtual user behavior using JavaScript. A well-structured script models realistic user journeys — authentication, data retrieval, mutations, and idle time between actions.

## Why This Matters
- **Realistic load** — scripts that mirror real user behavior produce meaningful results
- **Actionable data** — checks and groups provide granular performance metrics
- **Reproducible** — scripted tests produce consistent, comparable results

## How It Works

### Step 1: Basic Load Test Script
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // ramp up to 10 VUs
    { duration: '3m', target: 10 },   // hold at 10 VUs
    { duration: '1m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],    // error rate under 1%
    checks: ['rate>0.99'],            // 99% of checks pass
  },
};

export default function () {
  // Simulate user journey
  const loginRes = http.post('https://api.example.com/auth/login', JSON.stringify({
    email: 'loadtest@example.com',
    password: 'testpass123',
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login returns token': (r) => JSON.parse(r.body).token !== undefined,
  });

  const token = JSON.parse(loginRes.body).token;
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  sleep(1); // think time

  // Get user profile
  const profileRes = http.get('https://api.example.com/api/profile', authHeaders);
  check(profileRes, {
    'profile status is 200': (r) => r.status === 200,
    'profile has name': (r) => JSON.parse(r.body).name !== '',
  });

  sleep(2); // user reads profile

  // List items
  const itemsRes = http.get('https://api.example.com/api/items?page=1', authHeaders);
  check(itemsRes, {
    'items status is 200': (r) => r.status === 200,
    'items returns array': (r) => Array.isArray(JSON.parse(r.body).data),
  });

  sleep(1);
}
```

### Step 2: Use Groups for Transaction Metrics
```javascript
import { group } from 'k6';

export default function () {
  group('Authentication', () => {
    const res = http.post(BASE_URL + '/auth/login', payload);
    check(res, { 'login OK': (r) => r.status === 200 });
  });

  group('Browse Products', () => {
    const res = http.get(BASE_URL + '/products');
    check(res, { 'products loaded': (r) => r.status === 200 });
    sleep(2);
  });

  group('Add to Cart', () => {
    const res = http.post(BASE_URL + '/cart', cartPayload);
    check(res, { 'item added': (r) => r.status === 201 });
  });
}
```

### Step 3: Parameterize with SharedArray
```javascript
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

const users = new SharedArray('users', function () {
  return papaparse.parse(open('./users.csv'), { header: true }).data;
});

export default function () {
  const user = users[__VU % users.length];
  const res = http.post(BASE_URL + '/login', JSON.stringify({
    email: user.email,
    password: user.password,
  }));
  check(res, { 'login success': (r) => r.status === 200 });
}
```

## Best Practices
- Always include think time (`sleep()`) between requests to simulate real users
- Use `check()` for every response — validate status codes AND response bodies
- Group related requests into logical transactions
- Parameterize test data with SharedArray for multi-user scenarios
- Start with smoke tests (1 VU) to verify script correctness before load testing

## Common Mistakes
- No think time — creates unrealistic burst traffic
- No checks — a 500 response counts as "successful" without validation
- Hardcoded credentials — use environment variables or CSV data
- Testing a single endpoint — real users hit multiple endpoints per session
