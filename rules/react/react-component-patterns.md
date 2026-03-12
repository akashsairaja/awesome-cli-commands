---
id: react-component-patterns
stackId: react
type: rule
name: Component Design Patterns
description: >-
  Follow consistent React component patterns — function components only, proper
  prop typing with TypeScript, composition over inheritance, and clear component
  file structure.
difficulty: beginner
globs:
  - '**/*.tsx'
  - '**/*.jsx'
  - '**/components/**'
tags:
  - components
  - function-components
  - composition
  - typescript
  - props
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
  - question: >-
      Why should I use named exports instead of default exports for React
      components?
    answer: >-
      Named exports prevent renaming inconsistencies (import { UserCard } always
      matches the component name), enable better IDE auto-import, and make
      refactoring safer. Default exports allow any import name (import Foo from
      './UserCard'), leading to naming drift across the codebase.
  - question: Why one component per file in React?
    answer: >-
      One component per file makes components easy to find (file name =
      component name), simplifies imports, enables code splitting, and keeps
      files focused. Helper components used only within one parent can be in the
      same file, but exported components should always have their own file.
relatedItems:
  - react-hooks-rules
  - react-performance-patterns
  - typescript-strict-mode
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Component Design Patterns

## Rule
All React components MUST be function components with TypeScript interfaces for props. Use composition over inheritance. One component per file. Export named components, not default exports.

## Format
```tsx
interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: number;
  children?: React.ReactNode;
}

export function ComponentName({ requiredProp, optionalProp = 10, children }: ComponentNameProps) {
  return <div>{children}</div>;
}
```

## Good Examples
```tsx
// UserCard.tsx — single component, named export, typed props
interface UserCardProps {
  user: User;
  onEdit?: (userId: string) => void;
  variant?: "compact" | "detailed";
  className?: string;
}

export function UserCard({
  user,
  onEdit,
  variant = "compact",
  className = "",
}: UserCardProps) {
  return (
    <article className={`user-card user-card--${variant} ${className}`}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onEdit && (
        <button onClick={() => onEdit(user.id)}>Edit</button>
      )}
    </article>
  );
}

// Composition pattern
export function UserList({ users }: { users: User[] }) {
  return (
    <div className="user-list">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

## Bad Examples
```tsx
// BAD: Class component
class UserCard extends React.Component<Props> {
  render() { return <div />; }
}

// BAD: Default export
export default function UserCard() { ... }

// BAD: Untyped props
export function UserCard(props: any) { ... }

// BAD: Multiple components in one file
export function UserCard() { ... }
export function UserAvatar() { ... }
export function UserBadge() { ... }
```

## Enforcement
- ESLint: react/function-component-definition
- ESLint: no-default-export (prefer named)
- One component per file, filename matches component name
