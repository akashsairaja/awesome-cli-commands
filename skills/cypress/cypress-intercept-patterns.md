---
id: cypress-intercept-patterns
stackId: cypress
type: skill
name: Network Interception with cy.intercept
description: >-
  Master cy.intercept for API mocking, response stubbing, request validation,
  and network error simulation to create deterministic, fast Cypress tests.
difficulty: intermediate
tags:
  - intercept
  - api-mocking
  - network
  - fixtures
  - cypress
  - stubbing
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Cypress 13+
  - Understanding of REST APIs
faq:
  - question: What is cy.intercept in Cypress?
    answer: >-
      cy.intercept() intercepts HTTP requests made by your application during
      tests. You can stub responses with static data or fixtures, validate
      request payloads, simulate errors and slow responses, and control timing —
      creating deterministic tests without a running backend.
  - question: How do I mock API responses in Cypress?
    answer: >-
      Use cy.intercept('GET', '/api/endpoint', { body: mockData }).as('alias').
      Then visit the page and cy.wait('@alias') before making assertions. For
      large responses, use { fixture: 'file.json' } to load from
      cypress/fixtures/.
  - question: Why should I use cy.wait with intercept aliases instead of cy.wait(ms)?
    answer: >-
      cy.wait('@alias') waits for the specific network request to complete — it
      is precise and fast. cy.wait(5000) is an arbitrary delay that either waits
      too long (slow tests) or not long enough (flaky tests). Always prefer
      alias-based waiting.
relatedItems:
  - cypress-custom-commands
  - cypress-ci-setup
  - cypress-e2e-strategist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Network Interception with cy.intercept

## Overview
cy.intercept is Cypress's tool for controlling network requests. Stub API responses for deterministic tests, validate request payloads, simulate errors, and control timing — all without a running backend.

## Why This Matters
- **Deterministic** — tests do not depend on backend state or availability
- **Fast** — no real API calls means faster test execution
- **Edge cases** — easily simulate errors, slow responses, and empty states
- **Parallel-safe** — tests do not interfere with each other via shared APIs

## How It Works

### Stub API Responses
```typescript
it('displays user list', () => {
  cy.intercept('GET', '/api/users', {
    statusCode: 200,
    body: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  }).as('getUsers');

  cy.visit('/users');
  cy.wait('@getUsers');
  cy.getByCy('user-list').children().should('have.length', 2);
});
```

### Use Fixture Files
```typescript
it('loads products from fixture', () => {
  cy.intercept('GET', '/api/products*', { fixture: 'products.json' }).as('getProducts');
  cy.visit('/shop');
  cy.wait('@getProducts');
  cy.getByCy('product-card').should('have.length.at.least', 1);
});
```

### Validate Request Payloads
```typescript
it('sends correct data on form submit', () => {
  cy.intercept('POST', '/api/users', (req) => {
    expect(req.body).to.deep.include({
      name: 'Charlie',
      email: 'charlie@test.com',
    });
    req.reply({ statusCode: 201, body: { id: 3, ...req.body } });
  }).as('createUser');

  cy.visit('/users/new');
  cy.get('[data-cy="name"]').type('Charlie');
  cy.get('[data-cy="email"]').type('charlie@test.com');
  cy.get('[data-cy="submit"]').click();
  cy.wait('@createUser');
});
```

### Simulate Errors
```typescript
it('shows error message on server failure', () => {
  cy.intercept('GET', '/api/users', {
    statusCode: 500,
    body: { error: 'Internal server error' },
  }).as('getUsers');

  cy.visit('/users');
  cy.wait('@getUsers');
  cy.getByCy('error-message').should('contain', 'Something went wrong');
});
```

### Simulate Slow Responses
```typescript
it('shows loading spinner during slow requests', () => {
  cy.intercept('GET', '/api/data', (req) => {
    req.reply({
      statusCode: 200,
      body: { items: [] },
      delay: 2000,
    });
  }).as('getData');

  cy.visit('/data');
  cy.getByCy('loading-spinner').should('be.visible');
  cy.wait('@getData');
  cy.getByCy('loading-spinner').should('not.exist');
});
```

## Best Practices
- Always alias intercepts with `.as('name')` and `cy.wait('@name')` before assertions
- Use fixture files for large response payloads
- Test both success and error responses for every API endpoint
- Use route matching with wildcards: `/api/users*` to catch query params
- Stub third-party APIs (analytics, payment) to avoid external dependencies

## Common Mistakes
- Not waiting for the intercept alias (asserting before response arrives)
- Using `cy.wait(ms)` instead of `cy.wait('@alias')`
- Forgetting to intercept DELETE/PUT/PATCH methods (only GET by default)
- Not testing error states and edge cases with intercept
