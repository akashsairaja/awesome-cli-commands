---
id: python-type-hints
stackId: python
type: rule
name: Type Hints Required for All Functions
description: >-
  All Python functions must have complete type annotations — parameter types,
  return types, and generic types verified by mypy or pyright in strict mode for
  full type safety.
difficulty: intermediate
globs:
  - '**/*.py'
  - '**/pyproject.toml'
  - '**/mypy.ini'
tags:
  - type-hints
  - mypy
  - pyright
  - type-safety
  - annotations
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
  - python
faq:
  - question: Why are type hints important in Python?
    answer: >-
      Type hints catch bugs before runtime — mypy finds type mismatches, missing
      None checks, and incorrect function calls at CI time instead of in
      production. They also serve as documentation, enable better IDE
      autocomplete, and make refactoring safer. Modern Python type hints are
      concise and readable.
  - question: Should I use typing.Optional or the pipe syntax for optional types?
    answer: >-
      Use the modern pipe syntax: 'str | None' instead of 'Optional[str]'. Add
      'from __future__ import annotations' for Python 3.9 compatibility. The
      pipe syntax is clearer, shorter, and the recommended approach in Python
      3.10+. Avoid importing Optional, List, Dict from typing.
relatedItems:
  - python-pep8-style
  - python-import-organization
  - python-docstrings
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Type Hints Required for All Functions

## Rule
Every function and method MUST have complete type annotations for all parameters and return values. Run mypy or pyright in strict mode in CI. Use modern syntax (Python 3.10+).

## Format
```python
def function_name(param: Type, optional: Type | None = None) -> ReturnType:
    ...
```

## Good Examples
```python
from __future__ import annotations

from collections.abc import Sequence
from typing import Any, TypeVar

T = TypeVar("T")


def get_user(user_id: str) -> User | None:
    """Retrieve a user by ID."""
    ...


def create_users(data: list[CreateUserRequest]) -> list[User]:
    """Create multiple users from request data."""
    ...


def process_items(
    items: Sequence[T],
    transform: Callable[[T], T],
    *,
    max_workers: int = 4,
) -> list[T]:
    """Process items with a transform function."""
    ...


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_email(self, email: str) -> User | None:
        ...

    async def save(self, user: User) -> User:
        ...

    async def list_active(
        self, *, limit: int = 20, offset: int = 0
    ) -> list[User]:
        ...
```

## Bad Examples
```python
# BAD: No type hints
def get_user(user_id):
    ...

# BAD: Missing return type
def process(data: list) -> None:
    return data[0]  # Actually returns something!

# BAD: Using Any as escape hatch
def handle_request(data: Any) -> Any:
    ...

# BAD: Old-style Optional
from typing import Optional, List, Dict
def f(x: Optional[List[Dict[str, int]]]) -> Optional[str]:
    ...
# Modern: def f(x: list[dict[str, int]] | None) -> str | None:
```

## Configuration
```toml
# pyproject.toml
[tool.mypy]
strict = true
warn_return_any = true
warn_unused_ignores = true

[tool.pyright]
typeCheckingMode = "strict"
```

## Enforcement
- mypy --strict or pyright in CI (zero errors required)
- Pre-commit hook for type checking
- Ruff rule ANN for missing annotations
