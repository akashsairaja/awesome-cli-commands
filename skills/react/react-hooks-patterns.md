---
id: react-hooks-patterns
stackId: react
type: skill
name: React Custom Hooks Best Practices
description: >-
  Design reusable custom React hooks — composable state logic, data fetching
  patterns, cleanup and subscriptions, and proper TypeScript generics for
  type-safe hooks.
difficulty: intermediate
tags:
  - custom-hooks
  - state-management
  - data-fetching
  - composition
  - typescript
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
  - Understanding of useState and useEffect
faq:
  - question: When should I create a custom React hook?
    answer: >-
      Create a custom hook when you see stateful logic (useState, useEffect,
      event listeners) duplicated across components. Common candidates: data
      fetching, form handling, browser API subscriptions, debounce/throttle, and
      localStorage sync. If the logic has no state or effects, use a plain
      function instead.
  - question: How do I test custom React hooks?
    answer: >-
      Use renderHook from @testing-library/react to test hooks in isolation.
      This renders the hook in a test component and returns its current result.
      Use act() to trigger state updates. For hooks that make API calls, mock
      fetch or use MSW (Mock Service Worker) for realistic API mocking.
  - question: Should custom hooks return objects or tuples?
    answer: >-
      Return tuples [value, setter] for simple two-value hooks (like useState
      pattern). Return objects { data, error, isLoading } for hooks with
      multiple return values — objects allow consumers to destructure only what
      they need and are easier to extend without breaking changes.
relatedItems:
  - react-server-components
  - react-performance-optimization
  - react-testing-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# React Custom Hooks Best Practices

## Overview
Custom hooks extract reusable stateful logic from components. Well-designed hooks are composable, testable, and follow React's mental model of synchronizing with external systems.

## Why This Matters
- **Code reuse** — share logic between components without HOCs or render props
- **Separation of concerns** — components handle UI, hooks handle logic
- **Testability** — test logic independently with renderHook
- **Composition** — build complex hooks from simpler ones

## Step 1: Data Fetching Hook
```typescript
function useQuery<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    fetch(url, { ...options, signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') setError(err);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, error, isLoading };
}

// Usage
function UserProfile({ id }: { id: string }) {
  const { data: user, error, isLoading } = useQuery<User>(`/api/users/${id}`);
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  return <Profile user={user!} />;
}
```

## Step 2: Debounced Value Hook
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage — search input
function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data: results } = useQuery(`/api/search?q=${debouncedQuery}`);
  // Composed hooks — useQuery fires when debouncedQuery changes
}
```

## Step 3: Local Storage Hook
```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      window.localStorage.setItem(key, JSON.stringify(newValue));
      return newValue;
    });
  }, [key]);

  return [storedValue, setValue] as const;
}
```

## Step 4: Media Query Hook
```typescript
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Usage
const isMobile = useMediaQuery('(max-width: 768px)');
```

## Best Practices
- Name every hook with `use` prefix — it's required, not optional
- Return consistent shapes: `{ data, error, isLoading }` for async hooks
- Always include cleanup in useEffect for subscriptions and timers
- Use `useCallback` for returned functions to prevent consumer re-renders
- Initialize with lazy state (`useState(() => compute())`) for expensive defaults
- Use TypeScript generics for type-safe reusable hooks

## Common Mistakes
- Missing dependencies in useEffect dependency array
- Not cleaning up event listeners and subscriptions
- Returning unstable object references (wrap in useMemo)
- Using useEffect for derived state (compute during render)
