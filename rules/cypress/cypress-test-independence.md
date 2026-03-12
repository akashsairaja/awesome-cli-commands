---
id: cypress-test-independence
stackId: cypress
type: rule
name: Test Independence Requirements
description: >-
  Enforce complete independence between Cypress tests — no shared state, no test
  order dependencies, programmatic setup via API calls, and proper cleanup
  between runs.
difficulty: intermediate
globs:
  - '**/*.cy.ts'
  - '**/*.cy.tsx'
  - '**/cypress/**'
tags:
  - test-independence
  - isolation
  - state-management
  - cypress
  - reliability
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
  - question: Why must Cypress tests be independent?
    answer: >-
      Independent tests can run in parallel, in any order, and on any machine
      with consistent results. Dependent tests create cascading failures — if
      test A fails, tests B, C, and D also fail even though their code is
      correct. Independence enables reliable CI/CD gates.
  - question: How do I set up test data without depending on other tests?
    answer: >-
      Use cy.request() to call API endpoints that seed data directly. Create a
      test-only API endpoint (e.g., POST /api/test/seed) that sets up the exact
      state each test needs. This is faster than UI-driven setup and guarantees
      the correct starting state.
relatedItems:
  - cypress-selector-strategy
  - cypress-no-wait-antipattern
  - cypress-e2e-strategist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Test Independence Requirements

## Rule
Every Cypress test MUST be independently runnable. Tests must not depend on other tests, share mutable state, or rely on execution order. Each test sets up its own preconditions.

## Requirements

### 1. Programmatic Setup (Not UI-Driven)
```typescript
// Bad — depends on previous test creating a user
it('edits user profile', () => {
  cy.visit('/users/1/edit'); // assumes user 1 exists
});

// Good — creates its own data
it('edits user profile', () => {
  cy.request('POST', '/api/test/users', { name: 'Alice' }).then((resp) => {
    cy.visit(`/users/${resp.body.id}/edit`);
  });
});
```

### 2. Authentication via cy.session or API
```typescript
// Good — session is cached, independent per test
beforeEach(() => {
  cy.login('admin@test.com', 'password');
});
```

### 3. No Shared Variables Between Tests
```typescript
// Bad
let createdId: string;
it('creates item', () => { createdId = '...'; });
it('deletes item', () => { cy.request('DELETE', `/api/items/${createdId}`); });

// Good — each test is self-contained
it('creates and verifies item', () => {
  cy.request('POST', '/api/items', { name: 'test' }).then((resp) => {
    cy.visit(`/items/${resp.body.id}`);
    cy.getByCy('item-name').should('contain', 'test');
  });
});
```

### 4. Clean State Between Tests
```typescript
beforeEach(() => {
  cy.request('POST', '/api/test/reset'); // reset database state
  cy.clearCookies();
  cy.clearLocalStorage();
});
```

## Verification
Run any single test in isolation:
```bash
npx cypress run --spec cypress/e2e/specific.cy.ts
```
If it fails alone but passes in the full suite, it violates independence.

## Anti-Patterns
- Tests that MUST run in a specific order
- Shared state via closures or global variables
- Using `after()` to create state for the next test
- Relying on database state from previous test runs
- Tests that fail on the first run but pass on retry (indicates state dependency)
