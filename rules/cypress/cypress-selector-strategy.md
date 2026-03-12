---
id: cypress-selector-strategy
stackId: cypress
type: rule
name: Selector Strategy with data-cy Attributes
description: >-
  Enforce data-cy attributes as the primary selector strategy for Cypress tests
  — decouple test selectors from CSS classes, IDs, and DOM structure for
  resilient tests.
difficulty: beginner
globs:
  - '**/*.cy.ts'
  - '**/*.cy.tsx'
  - '**/cypress/**'
tags:
  - selectors
  - data-cy
  - test-attributes
  - best-practices
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
  - question: Why should Cypress tests use data-cy attributes instead of CSS selectors?
    answer: >-
      data-cy attributes are decoupled from styling and DOM structure. CSS
      classes change when designers update styles, IDs change during refactors,
      and tag-based selectors break on component restructuring. data-cy
      attributes exist solely for testing and remain stable through all these
      changes.
  - question: What is the difference between data-cy and data-testid?
    answer: >-
      Both serve the same purpose — providing stable test selectors. data-cy is
      the Cypress convention, data-testid is used by React Testing Library.
      Either is acceptable, but pick one and use it consistently across the
      project.
relatedItems:
  - cypress-no-wait-antipattern
  - cypress-test-independence
  - cypress-custom-commands
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Selector Strategy with data-cy Attributes

## Rule
All Cypress tests MUST use `data-cy` attributes as the primary selector strategy. CSS class selectors, element IDs used for styling, and DOM structure selectors are prohibited.

## Format
```html
<!-- In application code -->
<button data-cy="submit-form" class="btn btn-primary">Submit</button>
<input data-cy="email-input" type="email" class="form-control" />
<div data-cy="user-list" class="grid gap-4">...</div>
```

```typescript
// In test code
cy.get('[data-cy="submit-form"]').click();
cy.get('[data-cy="email-input"]').type('user@test.com');
cy.get('[data-cy="user-list"]').children().should('have.length', 5);
```

## Selector Priority
1. `data-cy` attributes (preferred for all interactive elements)
2. ARIA roles with `cy.contains()` for text-based elements
3. `data-testid` (acceptable alternative to data-cy)
4. Never: CSS classes, element IDs for styling, tag names, XPath

## Examples

### Good
```typescript
cy.get('[data-cy="login-button"]').click();
cy.get('[data-cy="search-input"]').type('query');
cy.get('[data-cy="product-card"]').should('have.length', 10);
cy.contains('Add to Cart').click();
```

### Bad
```typescript
cy.get('.btn-primary').click();          // CSS class — breaks on style changes
cy.get('#login-form button').click();    // DOM structure — breaks on refactor
cy.get('form > div:nth-child(2) input'); // Fragile structure dependency
cy.get('[class*="submit"]');             // Partial class matching
```

## Custom Command for Convenience
```typescript
// cypress/support/commands.ts
Cypress.Commands.add('getByCy', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});

// Usage
cy.getByCy('submit-form').click();
```

## Naming Convention for data-cy Values
- Use kebab-case: `data-cy="user-profile"`
- Be descriptive: `data-cy="checkout-submit-button"` not `data-cy="btn1"`
- Group by feature: `data-cy="cart-item-quantity"`, `data-cy="cart-total"`

## Anti-Patterns
- Using CSS classes as selectors (coupled to styling)
- Using auto-generated IDs from frameworks
- Using `cy.get('button').first()` without specific selectors
- Adding data-cy only when tests break instead of proactively
