---
id: playwright-locator-strategy
stackId: playwright
type: skill
name: Resilient Locator Strategies
description: >-
  Master Playwright's locator API — choose the right selector strategy for
  each element using getByRole, getByLabel, getByText, and getByTestId in the
  correct priority order.
difficulty: intermediate
tags:
  - playwright
  - resilient
  - locator
  - strategies
  - api
  - best-practices
  - refactoring
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Resilient Locator Strategies skill?"
    answer: >-
      Master Playwright's locator API — choose the right selector strategy for
      each element using getByRole, getByLabel, getByText, and getByTestId in
      the correct priority order. It includes practical examples for browser
      testing development.
  - question: "What tools and setup does Resilient Locator Strategies require?"
    answer: >-
      Requires Playwright installed. Works with Playwright projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
