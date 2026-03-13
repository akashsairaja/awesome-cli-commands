---
id: playwright-pom-patterns
stackId: playwright
type: skill
name: Page Object Model with Playwright
description: >-
  Implement the Page Object Model pattern in Playwright to create
  maintainable, reusable test code with typed page interactions and composable
  component objects.
difficulty: intermediate
tags:
  - playwright
  - page
  - object
  - model
  - design-patterns
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Page Object Model with Playwright skill?"
    answer: >-
      Implement the Page Object Model pattern in Playwright to create
      maintainable, reusable test code with typed page interactions and
      composable component objects. This skill provides a structured workflow
      for end-to-end testing, visual regression, API testing, and CI/CD
      integration.
  - question: "What tools and setup does Page Object Model with Playwright require?"
    answer: >-
      Requires Playwright installed. Works with Playwright projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Page Object Model with Playwright

## Overview
The Page Object Model (POM) is the standard design pattern for scalable Playwright test suites. Each page or component gets a dedicated class that encapsulates its locators and actions, keeping tests focused on behavior rather than DOM structure.

## Why This Matters
- **Single source of truth** — when UI changes, update one class instead of dozens of tests
- **IDE autocompletion** — typed methods surface available actions
- **Composability** — page objects can include component objects
- **Readability** — tests read like user stories, not DOM queries

## How It Works

### Step 1: Create a Base Page Object
```typescript
// pages/BasePage.ts
import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  async navigate(path: string) {
    await this.page.goto(path);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  protected getByRole(role: string, options?: { name?: string | RegExp }) {
    return this.page.getByRole(role as any, options);
  }
}
```

### Step 2: Create Page-Specific Objects
```typescript
// pages/LoginPage.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.navigate('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}
```

### Step 3: Create Component Objects for Reusable UI
```typescript
// components/NavigationBar.ts
import { Page, Locator } from '@playwright/test';

export class NavigationBar {
  readonly logo: Locator;
  readonly searchInput: Locator;
  readonly profileMenu: Locator;

  constructor(private page: Page) {
    this.logo = page.getByRole('link', { name: 'Home' });
    this.searchInput = page.getByRole('searchbox');
    this.profileMenu = page.getByRole('button', { name: /profile/i });
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async openProfile() {
    await this.profileMenu.click();
  }
}
```

### Step 4: Use Page Objects in Tests
```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Login', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password123');

    const dashboard = new DashboardPage(page);
    await expect(dashboard.welcomeMessage).toBeVisible();
  });

  test('invalid credentials show error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'bad');
    await loginPage.expectError('Invalid credentials');
  });
});
```

## Best Practices
- Locators in constructors, actions as methods, assertions in tests (or page object helper methods)
- Use semantic locators: `getByRole`, `getByLabel`, `getByText` — never raw CSS
- Keep page objects thin — no business logic, just page interaction
- Return new page objects from navigation actions for fluent chaining
- Use TypeScript for full type safety across page objects

## Common Mistakes
- Putting assertions directly in page objects (tests should assert, page objects should expose state)
- Using CSS selectors in page objects (defeats the maintainability purpose)
- Creating god page objects with 50+ methods (split into component objects)
- Not updating page objects when UI refactors happen (defeats the pattern)
