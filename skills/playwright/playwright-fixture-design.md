---
id: playwright-fixture-design
stackId: playwright
type: skill
name: Custom Fixtures for Test Isolation
description: >-
  Create Playwright custom fixtures to manage authentication state, database
  seeding, API mocking, and test data — ensuring every test runs in complete
  isolation.
difficulty: advanced
tags:
  - fixtures
  - test-isolation
  - authentication
  - database-seeding
  - playwright
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Playwright 1.40+
  - TypeScript
  - Understanding of Page Object Model
faq:
  - question: What are Playwright fixtures and why do they matter?
    answer: >-
      Playwright fixtures are setup/teardown functions that provide isolated
      resources to each test — like authenticated browser contexts, seeded
      database records, or page objects. They ensure every test starts from a
      clean state, enabling parallel execution without flakiness.
  - question: How do I share authentication state across Playwright tests?
    answer: >-
      Use Playwright's storageState feature. Create a setup project that logs in
      once and saves cookies/storage to a JSON file. Other tests load this state
      via browserContext options, skipping the login flow entirely. This is
      faster and more reliable than logging in per test.
  - question: Should fixtures clean up their own test data?
    answer: >-
      Yes. Every fixture should include teardown logic that removes any data it
      created. This prevents test pollution across runs. Use the pattern: create
      data before 'use', clean up after 'use' completes — Playwright handles the
      lifecycle automatically.
relatedItems:
  - playwright-pom-patterns
  - playwright-ci-pipeline
  - playwright-test-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Custom Fixtures for Test Isolation

## Overview
Playwright fixtures are the foundation of reliable test suites. They provide setup/teardown logic that runs before and after each test, ensuring complete isolation — no shared state, no test order dependencies, no flakiness from leftover data.

## Why This Matters
- **Test isolation** — each test starts from a clean, predictable state
- **Reusability** — define auth/seeding once, use across hundreds of tests
- **Parallelism** — isolated tests can run in parallel without conflicts
- **Debugging** — failures are self-contained, not caused by other tests

## How It Works

### Step 1: Extend the Base Test with Custom Fixtures
```typescript
// fixtures/index.ts
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboard = new DashboardPage(page);
    await use(dashboard);
  },

  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
```

### Step 2: Create an Authentication Fixture
```typescript
// fixtures/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // Save authentication state for reuse
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

### Step 3: Create a Database Seeding Fixture
```typescript
// fixtures/database.ts
import { test as base } from '@playwright/test';
import { prisma } from '../utils/prisma';

export const test = base.extend<{ seedData: { userId: string; postId: string } }>({
  seedData: async ({}, use) => {
    // Setup: seed test data
    const user = await prisma.user.create({
      data: { email: `test-${Date.now()}@example.com`, name: 'Test User' },
    });
    const post = await prisma.post.create({
      data: { title: 'Test Post', authorId: user.id, published: true },
    });

    await use({ userId: user.id, postId: post.id });

    // Teardown: clean up test data
    await prisma.post.delete({ where: { id: post.id } });
    await prisma.user.delete({ where: { id: user.id } });
  },
});
```

### Step 4: Use Fixtures in Tests
```typescript
// tests/dashboard.spec.ts
import { test, expect } from '../fixtures';

test('authenticated user sees dashboard', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('login page redirects to dashboard', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  // assertions...
});
```

## Best Practices
- Use `storageState` for authentication — login once, reuse across tests
- Create unique test data per test run (timestamps or UUIDs) to avoid collisions
- Always clean up in fixture teardown — never rely on test order
- Compose fixtures: auth fixture + seeding fixture + page object fixture
- Use `test.describe.configure({ mode: 'serial' })` only when absolutely necessary

## Common Mistakes
- Sharing a single authenticated session across all tests (state leaks)
- Not cleaning up database records after tests (pollutes other runs)
- Using global setup for data that should be per-test
- Forgetting to close browser contexts created in fixtures
