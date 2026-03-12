---
id: python-pep8-style
stackId: python
type: rule
name: PEP 8 Code Style Standards
description: >-
  Enforce PEP 8 code style in all Python projects — consistent naming, proper
  formatting, line length limits, and whitespace conventions verified by
  automated tools.
difficulty: beginner
globs:
  - '**/*.py'
  - '**/pyproject.toml'
  - '**/.ruff.toml'
  - '**/setup.cfg'
tags:
  - pep8
  - code-style
  - naming-conventions
  - black
  - ruff
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
  - question: Should I use Black or Ruff for Python formatting?
    answer: >-
      Ruff is recommended for new projects — it includes a Black-compatible
      formatter plus a linter that replaces flake8, isort, and dozens of other
      tools, all written in Rust for extreme speed. Black remains excellent and
      widely used. Both produce consistent, readable code. Pick one and enforce
      it project-wide.
  - question: What is the maximum line length for Python code?
    answer: >-
      PEP 8 recommends 79 characters, but most modern projects use 88 (Black's
      default) or 100. Configure your formatter's line length in pyproject.toml
      and apply it consistently. The key is consistency within a project — never
      mix different line lengths.
relatedItems:
  - python-type-hints
  - python-import-organization
  - python-docstrings
version: 1.0.0
lastUpdated: '2026-03-12'
---

# PEP 8 Code Style Standards

## Rule
All Python code MUST comply with PEP 8 style guidelines. Use automated formatters (Black, Ruff) to enforce consistency. No manual formatting debates.

## Naming Conventions
| Element | Convention | Example |
|---------|-----------|---------|
| Module | snake_case | `user_service.py` |
| Class | PascalCase | `UserService`, `HTTPClient` |
| Function/Method | snake_case | `get_user_by_id()` |
| Variable | snake_case | `user_count`, `file_path` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Private | _prefix | `_internal_method()`, `_cache` |
| Protected | _prefix | `_validate()` |

## Good Examples
```python
"""User service module for managing user operations."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger(__name__)

MAX_LOGIN_ATTEMPTS = 5
DEFAULT_PAGE_SIZE = 20


@dataclass
class UserConfig:
    """Configuration for user service."""

    max_retries: int = 3
    timeout_seconds: float = 30.0


class UserService:
    """Service for managing user operations."""

    def __init__(self, config: UserConfig | None = None) -> None:
        self._config = config or UserConfig()
        self._cache: dict[str, User] = {}

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Retrieve a user by their unique identifier."""
        if user_id in self._cache:
            return self._cache[user_id]

        user = self._repository.find_by_id(user_id)
        if user is not None:
            self._cache[user_id] = user
        return user
```

## Bad Examples
```python
# BAD: Inconsistent naming
class user_service:       # Should be PascalCase
    def GetUser(self):    # Should be snake_case
        myVar = 42        # Should be snake_case
        MAX = 100         # Constants at module level

# BAD: No whitespace conventions
x=1+2                     # Should be x = 1 + 2
def f( x , y ):           # No spaces after ( and before )
```

## Enforcement
- Format with Black or Ruff: `ruff format .`
- Lint with Ruff: `ruff check . --fix`
- Pre-commit hook: `ruff check && ruff format --check`
- CI: fail on any formatting violations
