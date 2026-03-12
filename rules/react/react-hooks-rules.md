---
id: react-hooks-rules
stackId: react
type: rule
name: Hooks Rules and Custom Hook Patterns
description: >-
  Follow React hooks rules strictly — no conditional hooks, proper dependency
  arrays, extract reusable logic into custom hooks with the use- prefix, and
  avoid stale closures.
difficulty: intermediate
globs:
  - '**/*.tsx'
  - '**/*.jsx'
  - '**/hooks/**'
tags:
  - hooks
  - custom-hooks
  - useEffect
  - dependencies
  - react-rules
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
languages:
  - typescript
  - javascript
faq:
  - question: Why must hooks only be called at the top level?
    answer: >-
      React relies on the ORDER of hook calls to map state and effects to the
      correct hook between renders. Conditional hook calls change the order,
      causing React to mix up state — useState for 'name' might return the value
      for 'email'. The ESLint plugin react-hooks/rules-of-hooks catches this
      automatically.
  - question: How do I avoid infinite loops with useEffect?
    answer: >-
      The most common cause is objects or arrays in the dependency array — they
      are new references every render. Use useMemo to stabilize objects, depend
      on primitive values instead of objects, or use useRef for values that
      should not trigger re-runs. The exhaustive-deps ESLint rule catches
      missing dependencies.
relatedItems:
  - react-component-patterns
  - react-performance-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Hooks Rules and Custom Hook Patterns

## Rule
Hooks MUST only be called at the top level of function components or custom hooks. Never call hooks inside conditions, loops, or nested functions. Custom hooks MUST start with "use".

## The Rules of Hooks
1. **Only call at top level** — never inside if/else, for, or try/catch
2. **Only call in React functions** — components or custom hooks
3. **Exhaustive dependency arrays** — include all referenced values
4. **Custom hooks start with "use"** — useAuth, useFetch, useDebounce

## Good Examples
```tsx
// Custom hook — reusable logic
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Proper useEffect with cleanup
function useEventListener(event: string, handler: (e: Event) => void) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (e: Event) => savedHandler.current(e);
    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
  }, [event]);
}

// Component using hooks correctly
export function SearchResults({ query }: { query: string }) {
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery) return;

    const controller = new AbortController();
    setIsLoading(true);

    fetch(`/api/search?q=${debouncedQuery}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setResults(data))
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  return <ResultsList results={results} loading={isLoading} />;
}
```

## Bad Examples
```tsx
// BAD: Conditional hook call
function Component({ isEnabled }: Props) {
  if (isEnabled) {
    useEffect(() => { ... }, []);  // Hook inside condition!
  }
}

// BAD: Missing dependency
useEffect(() => {
  fetchData(userId);  // userId not in dependency array
}, []);               // Stale closure — uses initial userId forever

// BAD: Object in dependency array
useEffect(() => {
  doSomething(options);
}, [options]);  // New object every render — infinite loop!
// Fix: useMemo for options or depend on primitive values
```

## Enforcement
- ESLint: react-hooks/rules-of-hooks (error)
- ESLint: react-hooks/exhaustive-deps (warn -> error)
- Code review: verify custom hooks start with "use"
