---
id: python-testing-patterns
stackId: python
type: skill
name: Python Testing with pytest
description: >-
  Write effective Python tests with pytest — fixtures, parametrize, mocking with
  unittest.mock, async testing, and structuring test suites for maintainability.
difficulty: intermediate
tags:
  - pytest
  - testing
  - fixtures
  - parametrize
  - mocking
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - python
prerequisites:
  - Python 3.11+
  - pytest
faq:
  - question: Why should I use pytest instead of unittest?
    answer: >-
      pytest requires less boilerplate (plain assert, no TestCase classes), has
      a powerful fixture system for reusable setup, supports parametrize for
      data-driven tests, and has a rich plugin ecosystem. Most Python projects
      have adopted pytest as the standard test framework.
  - question: What are pytest fixtures and how do they work?
    answer: >-
      Fixtures are functions decorated with @pytest.fixture that provide test
      setup and teardown. They use 'yield' to separate setup (before yield) from
      cleanup (after yield). Fixtures are composable — a fixture can depend on
      other fixtures. pytest injects them automatically based on function
      parameter names.
  - question: How do I mock external APIs in Python tests?
    answer: >-
      Use unittest.mock.patch to replace HTTP clients at the module boundary.
      For comprehensive API mocking, use the responses library (for requests) or
      respx (for httpx). Mock at the highest possible level — patch the HTTP
      client, not internal functions. This keeps tests resilient to refactoring.
relatedItems:
  - python-async-patterns
  - python-type-annotations
  - python-packaging-modern
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Python Testing with pytest

## Overview
pytest is the standard Python testing framework. Its fixture system, parametrize decorator, and plugin ecosystem make writing and maintaining tests significantly easier than unittest.

## Why This Matters
- **Less boilerplate** — plain assert statements, no TestCase classes needed
- **Fixtures** — reusable, composable test setup and teardown
- **Parametrize** — run the same test with multiple inputs
- **Rich ecosystem** — plugins for async, coverage, mocking, and more

## Step 1: Basic Tests
```python
# tests/test_calculator.py
from my_package.calculator import add, divide
import pytest

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0

def test_divide():
    assert divide(10, 2) == 5.0

def test_divide_by_zero():
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        divide(10, 0)
```

## Step 2: Fixtures
```python
import pytest
from my_package.database import Database

@pytest.fixture
def db():
    """Create a test database and clean up after."""
    database = Database(":memory:")
    database.create_tables()
    yield database
    database.close()

@pytest.fixture
def sample_user(db):
    """Create a sample user in the test database."""
    return db.create_user(name="Alice", email="alice@example.com")

def test_find_user(db, sample_user):
    user = db.find_user(sample_user.id)
    assert user.name == "Alice"

def test_delete_user(db, sample_user):
    db.delete_user(sample_user.id)
    assert db.find_user(sample_user.id) is None
```

## Step 3: Parametrize
```python
import pytest

@pytest.mark.parametrize("input,expected", [
    ("hello", "HELLO"),
    ("World", "WORLD"),
    ("", ""),
    ("123abc", "123ABC"),
])
def test_uppercase(input: str, expected: str):
    assert input.upper() == expected

@pytest.mark.parametrize("a,b,expected", [
    (2, 3, 5),
    (-1, 1, 0),
    (0, 0, 0),
    (100, -50, 50),
])
def test_add(a: int, b: int, expected: int):
    assert add(a, b) == expected
```

## Step 4: Mocking
```python
from unittest.mock import patch, MagicMock, AsyncMock
from my_package.services import UserService

def test_create_user_sends_email():
    with patch("my_package.services.send_email") as mock_email:
        service = UserService()
        service.create_user("Alice", "alice@example.com")
        mock_email.assert_called_once_with(
            to="alice@example.com",
            subject="Welcome, Alice!"
        )

@pytest.mark.asyncio
async def test_async_fetch():
    with patch("my_package.client.httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = MagicMock(json=lambda: {"status": "ok"})
        result = await fetch_status()
        assert result == "ok"
```

## Step 5: Running Tests
```bash
# Run all tests
pytest

# Verbose output
pytest -v

# Run specific file or test
pytest tests/test_users.py
pytest tests/test_users.py::test_create_user

# With coverage
pytest --cov=my_package --cov-report=html

# Stop on first failure
pytest -x

# Run marked tests only
pytest -m "not slow"
```

## Best Practices
- Use fixtures for setup/teardown instead of setUp/tearDown methods
- Use parametrize to test multiple inputs with a single test function
- Mock external dependencies (APIs, databases) at the boundary
- Keep tests fast — mock I/O, use in-memory databases
- Name tests descriptively: `test_create_user_with_duplicate_email_raises`

## Common Mistakes
- Mocking too deep (mock at the boundary, not internal implementation)
- Not using fixtures for shared setup (duplicating code in tests)
- Writing tests that depend on execution order
- Ignoring flaky tests instead of fixing them
