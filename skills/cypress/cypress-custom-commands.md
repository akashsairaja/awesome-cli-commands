---
id: cypress-custom-commands
stackId: cypress
type: skill
name: Custom Commands for Reusable Test Actions
description: >-
  Build Cypress custom commands to encapsulate repetitive test actions —
  authentication flows, API interactions, form filling, and assertion helpers
  used across your test suite.
difficulty: intermediate
tags:
  - cypress
  - custom
  - commands
  - reusable
  - test
  - actions
  - api
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Custom Commands for Reusable Test Actions skill?"
    answer: >-
      Build Cypress custom commands to encapsulate repetitive test actions —
      authentication flows, API interactions, form filling, and assertion
      helpers used across your test suite. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Custom Commands for Reusable Test Actions require?"
    answer: >-
      Requires Cypress installed. Works with cypress projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Custom Commands for Reusable Test Actions

## Overview
Cypress custom commands extend the `cy` object with reusable actions. Instead of duplicating login flows, API calls, and complex interactions in every test, encapsulate them in commands that read naturally and maintain easily.

## Why This Matters
- **DRY tests** — login flow written once, used in hundreds of tests
- **Readability** — `cy.login(user)` reads better than 5 lines of form filling
- **Maintainability** — when the login flow changes, update one command

## How It Works

### Step 1: Define Custom Commands
```typescript
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      seedDatabase(fixture: string): Chainable<void>;
      getByCy(selector: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// Programmatic login (fast, bypasses UI)
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request('POST', '/api/auth/login', { email, password }).then((resp) => {
    window.localStorage.setItem('auth_token', resp.body.token);
  });
});

// Database seeding via API
Cypress.Commands.add('seedDatabase', (fixture: string) => {
  cy.fixture(fixture).then((data) => {
    cy.request('POST', '/api/test/seed', data);
  });
});

// Selector helper
Cypress.Commands.add('getByCy', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});
```

### Step 2: Create Authentication Command with Session Caching
```typescript
// cypress/support/commands.ts
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-cy="email"]').type(email);
    cy.get('[data-cy="password"]').type(password);
    cy.get('[data-cy="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

### Step 3: Use in Tests
```typescript
describe('Dashboard', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123');
    cy.visit('/dashboard');
  });

  it('shows user profile', () => {
    cy.getByCy('profile-name').should('contain', 'Admin');
  });

  it('displays recent activity', () => {
    cy.getByCy('activity-list').children().should('have.length.at.least', 1);
  });
});
```

## Best Practices
- Use `cy.session()` for login commands — caches auth state across tests
- Use `cy.request()` for API-based setup (faster than UI interactions)
- Always add TypeScript declarations for IDE autocompletion
- Name commands with verbs: `login`, `seedDatabase`, `clearNotifications`
- Keep commands focused — one action per command

## Common Mistakes
- Creating commands for actions used in only one test (over-abstraction)
- Commands that contain assertions (commands should act, tests should assert)
- Not using `cy.session()` for auth (re-logs in for every test — slow)
- Forgetting TypeScript declarations (no autocompletion)
