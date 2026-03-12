---
id: playwright-locator-standards
stackId: playwright
type: rule
name: Locator Selection Standards
description: >-
  Enforce the use of semantic locators (getByRole, getByLabel, getByText) over
  CSS selectors and XPath in all Playwright tests for resilience and
  accessibility.
difficulty: beginner
globs:
  - '**/*.spec.ts'
  - '**/*.test.ts'
  - '**/tests/**'
  - '**/e2e/**'
  - '**/playwright/**'
tags:
  - locators
  - selectors
  - accessibility
  - standards
  - playwright
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
  - question: Why should Playwright tests avoid CSS selectors?
    answer: >-
      CSS selectors are brittle — they break when class names change, components
      are refactored, or CSS frameworks are swapped. Semantic locators like
      getByRole() find elements by their accessible role and name, which remain
      stable through UI redesigns.
  - question: When is it acceptable to use data-testid in Playwright?
    answer: >-
      Only when an element has no semantic role, visible label, or accessible
      name — such as canvas elements, chart containers, or decorative wrappers.
      Always add a code comment explaining why semantic locators are not
      possible.
relatedItems:
  - playwright-test-isolation
  - playwright-assertion-patterns
  - playwright-locator-strategy
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Locator Selection Standards

## Rule
All Playwright tests MUST use semantic locators as the primary selector strategy. CSS selectors and XPath are prohibited unless no semantic alternative exists.

## Locator Priority (Mandatory Order)
1. `getByRole()` — buttons, links, headings, textboxes, checkboxes
2. `getByLabel()` — form inputs with associated labels
3. `getByPlaceholder()` — inputs with placeholder text
4. `getByText()` — elements identified by visible text content
5. `getByAltText()` — images with alt attributes
6. `getByTestId()` — last resort for elements without semantic meaning

## Examples

### Good
```typescript
page.getByRole('button', { name: 'Submit' });
page.getByRole('link', { name: 'Sign up' });
page.getByLabel('Email address');
page.getByRole('heading', { name: 'Dashboard', level: 1 });
page.getByRole('navigation').getByRole('link', { name: 'Home' });
```

### Bad
```typescript
page.locator('.btn-primary');
page.locator('#submit-btn');
page.locator('div.card > button');
page.locator('[data-cy="submit"]');
page.locator('//button[@type="submit"]');
```

## Exceptions
- Canvas elements, charts, and SVG containers may use `getByTestId()`
- Third-party widget iframes may require `frameLocator()` with CSS
- Document each exception with a comment explaining why semantic locators are not possible

## Enforcement
Add to ESLint config with `eslint-plugin-playwright`:
```json
{
  "rules": {
    "playwright/prefer-native-locators": "error",
    "playwright/no-raw-locators": "warn"
  }
}
```
