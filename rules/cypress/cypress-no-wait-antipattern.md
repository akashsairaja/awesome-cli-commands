---
id: cypress-no-wait-antipattern
stackId: cypress
type: rule
name: No Arbitrary Waits (cy.wait Anti-Pattern)
description: >-
  Prohibit cy.wait(ms) for arbitrary delays in Cypress tests — use intercept
  aliases, assertions, and retry-able commands instead for reliable, fast test
  execution.
difficulty: beginner
globs:
  - '**/*.cy.ts'
  - '**/*.cy.tsx'
  - '**/cypress/**'
tags:
  - cy-wait
  - retry-ability
  - flaky-tests
  - anti-pattern
  - cypress
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
  - question: Why is cy.wait(ms) bad in Cypress tests?
    answer: >-
      cy.wait(ms) introduces an arbitrary, fixed delay. It is either too short
      (causing flakiness) or too long (wasting CI time). Cypress has built-in
      retry-ability — assertions automatically retry for up to 4 seconds by
      default, and cy.wait('@alias') waits for the exact network response.
  - question: How do I wait for data to load in Cypress without cy.wait?
    answer: >-
      Use cy.intercept() to define a route alias, then cy.wait('@alias') to wait
      for that specific API response. This waits for the exact moment data
      arrives, not an arbitrary delay. For UI changes, Cypress assertions
      auto-retry until the condition is met.
relatedItems:
  - cypress-selector-strategy
  - cypress-test-independence
  - cypress-intercept-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# No Arbitrary Waits (cy.wait Anti-Pattern)

## Rule
`cy.wait(ms)` with a numeric argument is PROHIBITED in all Cypress tests. Use intercept aliases, assertions, or Cypress's built-in retry-ability instead.

## Why This Rule Exists
- `cy.wait(5000)` is either too slow (wastes CI time) or too fast (flaky)
- Cypress has built-in retry-ability — most assertions auto-retry for 4 seconds
- Intercept aliases wait for the exact moment data arrives

## Alternatives

### Instead of Waiting for API Data
```typescript
// Bad
cy.visit('/users');
cy.wait(3000);
cy.get('[data-cy="user-list"]').should('have.length', 5);

// Good
cy.intercept('GET', '/api/users').as('getUsers');
cy.visit('/users');
cy.wait('@getUsers');
cy.get('[data-cy="user-list"]').children().should('have.length', 5);
```

### Instead of Waiting for UI Updates
```typescript
// Bad
cy.get('[data-cy="submit"]').click();
cy.wait(2000);
cy.get('[data-cy="success-message"]').should('be.visible');

// Good — assertion auto-retries until timeout
cy.get('[data-cy="submit"]').click();
cy.get('[data-cy="success-message"]').should('be.visible');
```

### Instead of Waiting for Animations
```typescript
// Bad
cy.get('[data-cy="modal"]').click();
cy.wait(500); // wait for animation

// Good — assert on the final state
cy.get('[data-cy="modal-content"]').should('be.visible');
```

### Instead of Waiting for Navigation
```typescript
// Bad
cy.get('[data-cy="link"]').click();
cy.wait(1000);

// Good
cy.get('[data-cy="link"]').click();
cy.url().should('include', '/target-page');
```

## The Only Acceptable cy.wait Usage
```typescript
// Waiting for intercept aliases — this is correct
cy.wait('@apiCall');
cy.wait(['@apiCall1', '@apiCall2']); // wait for multiple
```

## Enforcement
Add an ESLint rule or code review checklist item:
```
RULE: cy.wait() must ONLY be called with @ alias arguments, never numeric ms values
```

## Anti-Patterns
- `cy.wait(1000)` before any assertion
- Increasing wait times to "fix" flaky tests
- Using `cy.wait()` to "let the page load"
- Wrapping `cy.wait()` in a custom command to hide it
