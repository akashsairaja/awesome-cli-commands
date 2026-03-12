---
id: react-testing-patterns
stackId: react
type: skill
name: React Testing with Testing Library
description: >-
  Write effective React tests with Testing Library — user-centric queries, async
  testing, mocking, accessibility assertions, and testing hooks and context.
difficulty: intermediate
tags:
  - testing
  - testing-library
  - jest
  - vitest
  - user-events
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - typescript
  - javascript
prerequisites:
  - React 18+
  - Jest or Vitest
  - '@testing-library/react'
faq:
  - question: What is the best way to query elements in React Testing Library?
    answer: >-
      Use queries in this priority order: (1) getByRole — matches accessible
      roles, ensures a11y. (2) getByLabelText — for form elements. (3)
      getByPlaceholderText — if no label exists. (4) getByText — for visible
      text. (5) getByTestId — last resort. The first options test accessibility
      as a side effect.
  - question: Should I use fireEvent or userEvent in React Testing Library?
    answer: >-
      Always use userEvent.setup() — it simulates actual user behavior including
      focus management, keyboard events, pointer events, and clipboard
      interactions. fireEvent dispatches a single DOM event, which misses the
      full interaction sequence. userEvent catches more real-world bugs.
  - question: How do I test components that fetch data?
    answer: >-
      Mock the API layer (not fetch itself) using MSW (Mock Service Worker) for
      realistic network mocking. Render the component, verify the loading state
      appears, use findBy queries to wait for the loaded content, and verify the
      loading state disappears. Test both success and error states.
relatedItems:
  - react-hooks-patterns
  - react-server-components
  - react-accessibility-testing
version: 1.0.0
lastUpdated: '2026-03-11'
---

# React Testing with Testing Library

## Overview
React Testing Library encourages testing from the user's perspective — interacting with components the way users do, not testing implementation details. This leads to tests that are more resilient to refactoring and actually catch real bugs.

## Why This Matters
- **User-centric** — tests verify what users see and do, not implementation
- **Refactor-safe** — changing component internals doesn't break tests
- **Accessible by default** — queries encourage accessible markup
- **Confidence** — tests that match real usage catch real bugs

## Step 1: Querying Elements
```tsx
import { render, screen } from '@testing-library/react';

test('renders user profile', () => {
  render(<UserProfile user={mockUser} />);

  // Priority order for queries (most to least recommended):
  // 1. getByRole — accessible role (best, matches screen reader experience)
  expect(screen.getByRole('heading', { name: /john doe/i })).toBeInTheDocument();

  // 2. getByLabelText — form inputs
  expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');

  // 3. getByText — visible text content
  expect(screen.getByText(/software engineer/i)).toBeInTheDocument();

  // 4. getByTestId — last resort (not user-visible)
  expect(screen.getByTestId('avatar')).toHaveAttribute('src');
});
```

## Step 2: User Interactions
```tsx
import userEvent from '@testing-library/user-event';

test('submits login form', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), 'john@example.com');
  await user.type(screen.getByLabelText(/password/i), 'secret123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'john@example.com',
    password: 'secret123',
  });
});
```

## Step 3: Async Testing
```tsx
import { render, screen, waitFor } from '@testing-library/react';

test('loads and displays user data', async () => {
  render(<UserProfile userId="123" />);

  // Loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for data to load
  const heading = await screen.findByRole('heading', { name: /john doe/i });
  expect(heading).toBeInTheDocument();

  // Verify loading state is gone
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

## Step 4: Testing Hooks
```tsx
import { renderHook, act } from '@testing-library/react';

test('useCounter increments and decrements', () => {
  const { result } = renderHook(() => useCounter(0));

  expect(result.current.count).toBe(0);

  act(() => result.current.increment());
  expect(result.current.count).toBe(1);

  act(() => result.current.decrement());
  expect(result.current.count).toBe(0);
});
```

## Best Practices
- Query by role first — it tests accessibility and functionality together
- Use `userEvent` over `fireEvent` — it simulates real user behavior
- Use `findBy` for elements that appear asynchronously
- Use `queryBy` to assert elements are NOT present
- Test behavior, not implementation — don't test state values directly
- Write tests that would still pass if you refactored the component internals

## Common Mistakes
- Testing implementation details (state values, method calls)
- Using getByTestId when accessible queries are available
- Using fireEvent instead of userEvent (misses real user behavior)
- Not wrapping state updates in act() (React warning)
- Snapshot testing as the primary testing strategy (brittle, low value)
