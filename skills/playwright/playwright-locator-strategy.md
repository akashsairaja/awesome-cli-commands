---
id: playwright-locator-strategy
stackId: playwright
type: skill
name: Resilient Locator Strategies
description: >-
  Master Playwright's locator API — choose the right selector strategy for each
  element using getByRole, getByLabel, getByText, and getByTestId in the correct
  priority order.
difficulty: beginner
tags:
  - locators
  - selectors
  - getByRole
  - resilient-tests
  - playwright
  - accessibility
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Playwright 1.40+
  - Basic HTML/accessibility knowledge
faq:
  - question: What is the best locator strategy in Playwright?
    answer: >-
      getByRole() is the best primary locator strategy. It finds elements the
      way screen readers and users see them — by their semantic role and
      accessible name. This makes tests resilient to CSS/HTML refactors and
      inherently validates accessibility.
  - question: When should I use data-testid in Playwright?
    answer: >-
      Use data-testid only as a last resort — when an element has no semantic
      role, visible label, or accessible name. Common cases include canvas
      elements, chart containers, and purely decorative wrappers. If you can add
      an aria-label instead, prefer that.
  - question: How do I scope Playwright locators to a specific section of the page?
    answer: >-
      Chain locators to narrow scope. For example,
      page.getByRole('navigation').getByRole('link', { name: 'Home' }) finds the
      Home link specifically within the nav element, avoiding matches in the
      footer or sidebar.
relatedItems:
  - playwright-pom-patterns
  - playwright-accessibility-auditor
  - playwright-test-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Resilient Locator Strategies

## Overview
Playwright's locator API is designed to find elements the way users and assistive technology see them. Choosing the right locator strategy makes tests resilient to refactors, readable by non-developers, and inherently accessible.

## The Locator Priority Pyramid

### Tier 1: Semantic (Preferred)
```typescript
// Best — mirrors how users and screen readers find elements
page.getByRole('button', { name: 'Submit' })
page.getByRole('heading', { name: 'Dashboard' })
page.getByRole('link', { name: 'Sign up' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('checkbox', { name: 'Remember me' })
```

### Tier 2: Label-Based
```typescript
// Good — uses visible labels
page.getByLabel('Email address')
page.getByPlaceholder('Search...')
page.getByText('Welcome back')
page.getByAltText('Company logo')
```

### Tier 3: Test ID (Last Resort)
```typescript
// Acceptable — when no semantic alternative exists
page.getByTestId('payment-summary')
page.getByTestId('chart-container')
```

### Avoid: CSS/XPath
```typescript
// Bad — brittle, breaks on refactors
page.locator('.btn-primary')           // CSS class
page.locator('#submit-form')           // ID
page.locator('div > form > button')    // Structure
page.locator('//div[@class="card"]')   // XPath
```

## Filtering and Chaining
```typescript
// Filter by text within a locator
page.getByRole('listitem').filter({ hasText: 'JavaScript' })

// Chain locators for scoping
page.getByRole('navigation').getByRole('link', { name: 'Home' })

// Filter by child locator
page.getByRole('listitem').filter({
  has: page.getByRole('heading', { name: 'Premium' }),
})

// Nth element (when multiple matches)
page.getByRole('listitem').nth(2)
page.getByRole('listitem').first()
page.getByRole('listitem').last()
```

## Handling Dynamic Content
```typescript
// Wait for element to appear
await expect(page.getByRole('alert')).toBeVisible();

// Wait for text content
await expect(page.getByRole('status')).toContainText('Saved');

// Wait for element to disappear
await expect(page.getByRole('progressbar')).toBeHidden();

// Use regex for dynamic text
page.getByRole('heading', { name: /Welcome, .+/ })
page.getByText(/\d+ items in cart/)
```

## Best Practices
- Start with `getByRole` — it guarantees accessibility and resilience
- Use `getByLabel` for form inputs — it validates label associations
- Use exact matching when text could be ambiguous: `{ exact: true }`
- Chain locators to scope within specific sections (navigation, main, footer)
- Use regex for dynamic content instead of partial string matching

## Common Mistakes
- Reaching for CSS selectors first (habit from jQuery/Selenium era)
- Using `page.locator()` with CSS when `getByRole()` works
- Not scoping locators — getting the wrong button on a page with multiple
- Using `waitForSelector` instead of `expect().toBeVisible()`
- Hardcoding text that changes with i18n or A/B tests
