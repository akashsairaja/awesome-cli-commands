---
id: playwright-test-isolation
stackId: playwright
type: rule
name: Test Isolation Requirements
description: >-
  Mandate complete test isolation in Playwright suites — no shared state,
  independent browser contexts, deterministic data, and no reliance on test
  execution order.
difficulty: intermediate
globs:
  - '**/*.spec.ts'
  - '**/*.test.ts'
  - '**/tests/**'
  - '**/e2e/**'
  - '**/playwright/**'
tags:
  - test-isolation
  - fixtures
  - flaky-tests
  - parallelism
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
  - question: Why is test isolation important in Playwright?
    answer: >-
      Isolated tests can run in any order, in parallel, and on any machine with
      consistent results. Without isolation, tests become flaky — passing
      locally but failing in CI, or failing when run individually but passing in
      the full suite.
  - question: >-
      How do I share setup logic across Playwright tests without breaking
      isolation?
    answer: >-
      Use Playwright fixtures. Fixtures provide setup/teardown logic per test —
      creating fresh browser contexts, seeding data, and cleaning up afterward.
      Unlike shared variables, each test gets its own fixture instance.
relatedItems:
  - playwright-locator-standards
  - playwright-assertion-patterns
  - playwright-fixture-design
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Test Isolation Requirements

## Rule
Every Playwright test MUST be independently runnable. Tests must not depend on other tests running first, share mutable state, or rely on execution order.

## Requirements

### 1. Independent Browser Contexts
Each test gets its own browser context. Never share contexts between tests.
```typescript
// Good — each test has isolated context
test('test A', async ({ page }) => {
  // page has fresh context
});

test('test B', async ({ page }) => {
  // completely independent of test A
});
```

### 2. No Shared Mutable State
```typescript
// Bad — shared variable between tests
let userId: string;
test('create user', async ({ page }) => {
  userId = await createUser();
});
test('verify user', async ({ page }) => {
  await page.goto(`/users/${userId}`); // depends on previous test
});

// Good — use fixtures for shared setup
test('verify user', async ({ page, seedData }) => {
  await page.goto(`/users/${seedData.userId}`);
});
```

### 3. Deterministic Test Data
```typescript
// Bad — relies on database state from other tests
test('shows 5 users', async ({ page }) => { /* assumes specific data */ });

// Good — seeds its own data via fixture
test('shows seeded users', async ({ page, seedUsers }) => {
  await page.goto('/users');
  await expect(page.getByRole('listitem')).toHaveCount(seedUsers.length);
});
```

### 4. No waitForTimeout
```typescript
// Bad — arbitrary wait
await page.waitForTimeout(3000);

// Good — wait for actionable condition
await expect(page.getByRole('alert')).toBeVisible();
await page.getByRole('button', { name: 'Save' }).click(); // auto-waits
```

### 5. Clean Up After Yourself
```typescript
// Good — fixture handles teardown
const test = base.extend({
  tempUser: async ({}, use) => {
    const user = await createTestUser();
    await use(user);
    await deleteTestUser(user.id); // cleanup
  },
});
```

## Verification
Run any test in isolation to verify:
```bash
npx playwright test tests/specific.spec.ts --grep "test name"
```
If it fails when run alone but passes in the full suite, it has an isolation violation.

## Anti-Patterns
- `test.describe.configure({ mode: 'serial' })` — almost always a design smell
- Global variables shared between test files
- Tests that must run in a specific order
- Using `page.waitForTimeout()` instead of actionability assertions
