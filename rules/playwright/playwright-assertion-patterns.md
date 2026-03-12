---
id: playwright-assertion-patterns
stackId: playwright
type: rule
name: Assertion Best Practices
description: >-
  Standardize Playwright assertion patterns — use web-first assertions with
  auto-retry, avoid manual waits, and prefer user-visible state checks over DOM
  property inspection.
difficulty: beginner
globs:
  - '**/*.spec.ts'
  - '**/*.test.ts'
  - '**/tests/**'
  - '**/e2e/**'
  - '**/playwright/**'
tags:
  - assertions
  - web-first
  - auto-retry
  - best-practices
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
  - question: What are web-first assertions in Playwright?
    answer: >-
      Web-first assertions automatically retry until the condition is met or the
      timeout expires. Instead of checking once and failing,
      expect(locator).toBeVisible() polls the DOM repeatedly. This eliminates
      race conditions between test code and page rendering.
  - question: Why should I avoid page.waitForTimeout() in Playwright tests?
    answer: >-
      waitForTimeout() is an arbitrary delay — it either waits too long (slow
      tests) or not long enough (flaky tests). Web-first assertions like
      toBeVisible() and toContainText() auto-retry with intelligent polling,
      resolving as soon as the condition is true.
relatedItems:
  - playwright-locator-standards
  - playwright-test-isolation
  - playwright-locator-strategy
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Assertion Best Practices

## Rule
All Playwright assertions MUST use web-first assertions (`expect(locator)`) that auto-retry. Manual waits, DOM property checks, and non-retrying assertions are prohibited.

## Format

### Use Web-First Assertions (Auto-Retry)
```typescript
// Good — these auto-retry until timeout
await expect(page.getByRole('heading')).toBeVisible();
await expect(page.getByRole('alert')).toContainText('Saved');
await expect(page.getByRole('button')).toBeEnabled();
await expect(page.getByRole('list')).toHaveCount(5);
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveTitle(/Dashboard/);
```

### Never Use Non-Retrying Assertions
```typescript
// Bad — no auto-retry, race condition prone
const text = await page.getByRole('heading').textContent();
expect(text).toBe('Dashboard'); // might check before render

// Bad — manual wait + check
await page.waitForTimeout(2000);
const isVisible = await page.getByRole('alert').isVisible();
expect(isVisible).toBe(true);
```

## Common Assertion Patterns

### Visibility
```typescript
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).not.toBeVisible();
```

### Text Content
```typescript
await expect(locator).toHaveText('Exact text');
await expect(locator).toContainText('partial');
await expect(locator).toHaveText(/regex pattern/);
```

### Form State
```typescript
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toBeChecked();
await expect(locator).toHaveValue('input value');
```

### Navigation
```typescript
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/\/users\/\d+/);
await expect(page).toHaveTitle('Dashboard - App');
```

### Lists and Counts
```typescript
await expect(page.getByRole('listitem')).toHaveCount(5);
await expect(page.getByRole('row')).toHaveCount(11); // header + 10 data rows
```

## Soft Assertions (Multiple Checks)
```typescript
// Continue test even if assertion fails — report all failures at end
await expect.soft(page.getByRole('heading')).toHaveText('Dashboard');
await expect.soft(page.getByRole('status')).toContainText('Online');
await expect.soft(page.getByRole('navigation')).toBeVisible();
```

## Anti-Patterns
- Using `textContent()` + `expect()` instead of `toHaveText()`
- Using `isVisible()` + `expect()` instead of `toBeVisible()`
- Adding `waitForTimeout()` before assertions (auto-retry handles timing)
- Asserting DOM attributes when user-visible state checks are available
- Using `toBeTruthy()` / `toBeFalsy()` instead of specific matchers
