---
id: python-docstrings
stackId: python
type: rule
name: Docstring Standards
description: >-
  Write meaningful docstrings for all public modules, classes, and functions —
  follow Google style or NumPy style consistently, document parameters, returns,
  raises, and include examples.
difficulty: beginner
globs:
  - '**/*.py'
  - '**/pyproject.toml'
tags:
  - docstrings
  - documentation
  - google-style
  - pydocstyle
  - api-docs
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
  - question: Should I use Google style or NumPy style docstrings?
    answer: >-
      Both are excellent — pick one and enforce it project-wide. Google style is
      more compact and widely used in web/API projects. NumPy style is standard
      in scientific computing and data science. Configure your choice in
      pyproject.toml: [tool.ruff.pydocstyle] convention = 'google'.
  - question: Do private methods need docstrings?
    answer: >-
      Private methods (_method) do not require docstrings per PEP 257, but
      complex private methods benefit from them. Public methods, classes, and
      modules always need docstrings. A good rule: if a private method has
      non-obvious behavior or takes more than one parameter, add a docstring.
relatedItems:
  - python-pep8-style
  - python-type-hints
  - python-import-organization
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Docstring Standards

## Rule
All public modules, classes, functions, and methods MUST have docstrings. Follow Google style format consistently. Include parameters, return values, exceptions, and examples for complex functions.

## Format (Google Style)
```python
def function_name(param1: str, param2: int) -> bool:
    """One-line summary of what the function does.

    Longer description if needed. Explain the behavior,
    not the implementation.

    Args:
        param1: Description of param1.
        param2: Description of param2.

    Returns:
        Description of the return value.

    Raises:
        ValueError: When param2 is negative.
        ConnectionError: When the database is unreachable.

    Example:
        >>> function_name("hello", 42)
        True
    """
```

## Good Examples
```python
class UserService:
    """Service for managing user lifecycle operations.

    Handles user creation, authentication, profile updates,
    and account deactivation with audit logging.

    Attributes:
        repository: User data access layer.
        cache: In-memory cache for active users.
    """

    def create_user(
        self, email: str, name: str, *, role: str = "user"
    ) -> User:
        """Create a new user account.

        Validates the email uniqueness, hashes the password,
        and sends a verification email.

        Args:
            email: User's email address (must be unique).
            name: Display name (2-100 characters).
            role: User role. Defaults to "user".

        Returns:
            The newly created User instance.

        Raises:
            DuplicateEmailError: If email is already registered.
            ValidationError: If name is too short or too long.

        Example:
            >>> service = UserService(repo)
            >>> user = service.create_user("alice@example.com", "Alice")
            >>> user.email
            'alice@example.com'
        """
```

## Bad Examples
```python
# BAD: No docstring
def process(data):
    return data

# BAD: Useless docstring
def get_user(user_id):
    """Get user."""  # Just restates the function name

# BAD: Missing Args/Returns
def calculate_price(items, discount, tax_rate):
    """Calculate the total price."""
    # What are the parameter types? What does it return?
```

## Enforcement
- Ruff rule D for docstring conventions (pydocstyle)
- Configure: `convention = "google"` in pyproject.toml
- CI fails on missing public docstrings
