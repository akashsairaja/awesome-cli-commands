---
id: react-performance-patterns
stackId: react
type: rule
name: React Performance Optimization Rules
description: >-
  Apply React performance optimizations correctly — avoid premature
  optimization, use React.memo sparingly, proper key usage in lists, lazy
  loading, and prevent unnecessary re-renders.
difficulty: advanced
globs:
  - '**/*.tsx'
  - '**/*.jsx'
tags:
  - performance
  - memo
  - useMemo
  - useCallback
  - lazy-loading
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
  - question: When should I use React.memo?
    answer: >-
      Use React.memo only after measuring with React DevTools Profiler and
      confirming a component re-renders frequently with the same props. Common
      cases: list items in long lists, components receiving callbacks from
      frequently-updating parents. Do NOT memo every component — the comparison
      cost can exceed the render cost for simple components.
  - question: Why should I never use array index as key in React lists?
    answer: >-
      Index keys cause React to reuse the wrong DOM elements when items are
      reordered, inserted, or deleted. This leads to stale state, wrong
      animations, and subtle bugs. Always use a unique, stable identifier
      (database ID, UUID) as the key. Only use index keys for static lists that
      never change order.
relatedItems:
  - react-component-patterns
  - react-hooks-rules
version: 1.0.0
lastUpdated: '2026-03-12'
---

# React Performance Optimization Rules

## Rule
Optimize only after measuring. Use React DevTools Profiler to identify bottlenecks. Apply memo, useMemo, useCallback only where measured benefit exists. Always use stable keys in lists.

## Performance Checklist
| Issue | Solution | When |
|-------|----------|------|
| List re-renders | Stable keys (never index) | Always |
| Expensive computation | useMemo | Measured > 1ms |
| Callback re-creation | useCallback | Passed to memo'd children |
| Component re-renders | React.memo | Measured frequent re-renders |
| Large bundles | React.lazy + Suspense | Routes, modals, tabs |
| Heavy initial load | Dynamic import | Below-fold content |

## Good Examples
```tsx
// Stable keys — use unique IDs, never array index
{users.map((user) => (
  <UserCard key={user.id} user={user} />  // Stable ID
))}

// Lazy loading routes
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// useCallback only when passing to memoized child
const MemoizedList = React.memo(ItemList);

function Parent() {
  const handleSelect = useCallback((id: string) => {
    setSelected(id);
  }, []);

  return <MemoizedList items={items} onSelect={handleSelect} />;
}
```

## Bad Examples
```tsx
// BAD: Index as key — causes bugs on reorder/delete
{users.map((user, index) => (
  <UserCard key={index} user={user} />
))}

// BAD: Premature optimization — memo everything
const Button = React.memo(({ label }: { label: string }) => (
  <button>{label}</button>
));
// Simple components don't need memo

// BAD: useMemo for cheap operations
const fullName = useMemo(
  () => `${first} ${last}`,  // String concat is not expensive!
  [first, last]
);

// BAD: New object in JSX — re-renders child every time
<Component style={{ color: "red" }} />
// If Component uses memo, extract to constant or useMemo
```

## Enforcement
- React DevTools Profiler for measuring render performance
- ESLint: react/jsx-key catches missing keys
- Bundle analyzer (webpack-bundle-analyzer) for code splitting
- Lighthouse CI for performance regression detection
