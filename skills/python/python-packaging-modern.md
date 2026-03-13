---
id: python-packaging-modern
stackId: python
type: skill
name: Modern Python Packaging with pyproject.toml
description: >-
  Set up Python projects with pyproject.toml — dependency management with uv
  or poetry, virtual environments, building packages, and publishing to PyPI
  following PEP 621/517.
difficulty: intermediate
tags:
  - python
  - modern
  - packaging
  - pyprojecttoml
  - machine-learning
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Modern Python Packaging with pyproject.toml skill?"
    answer: >-
      Set up Python projects with pyproject.toml — dependency management with
      uv or poetry, virtual environments, building packages, and publishing to
      PyPI following PEP 621/517. This skill provides a structured workflow
      for package management, testing, async patterns, and project
      scaffolding.
  - question: "What tools and setup does Modern Python Packaging with pyproject.toml require?"
    answer: >-
      Requires pip/poetry installed. Works with Python projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Modern Python Packaging with pyproject.toml

## Overview
pyproject.toml is the modern standard for Python project configuration (PEP 621). It replaces setup.py, setup.cfg, requirements.txt, and MANIFEST.in with a single, declarative configuration file.

## Why This Matters
- **Single file** — replaces setup.py + setup.cfg + requirements.txt
- **Standard** — PEP 621 is the official Python packaging standard
- **Tool support** — uv, poetry, pip, hatch all support pyproject.toml
- **Reproducible** — lock files ensure consistent environments

## Step 1: Project Structure
```
my-project/
  pyproject.toml        # Project metadata and dependencies
  src/
    my_package/
      __init__.py
      main.py
  tests/
    test_main.py
  .python-version       # Pin Python version
```

## Step 2: pyproject.toml Configuration
```toml
[project]
name = "my-package"
version = "1.0.0"
description = "A modern Python package"
readme = "README.md"
license = { text = "MIT" }
requires-python = ">=3.11"
authors = [{ name = "Your Name", email = "you@example.com" }]
dependencies = [
    "httpx>=0.27",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "mypy>=1.8",
    "ruff>=0.3",
]

[project.scripts]
my-cli = "my_package.main:cli"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
line-length = 88
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP"]

[tool.mypy]
strict = true
python_version = "3.11"

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --tb=short"
```

## Step 3: Dependency Management with uv
```bash
# Install uv (extremely fast Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment and install
uv venv
source .venv/bin/activate  # Linux/macOS
uv pip install -e ".[dev]"

# Add dependencies
uv pip install httpx
uv pip compile pyproject.toml -o requirements.lock  # Lock file

# Sync environment from lock file
uv pip sync requirements.lock
```

## Step 4: Virtual Environments
```bash
# Create with uv (fastest)
uv venv

# Create with built-in venv
python -m venv .venv

# Activate
source .venv/bin/activate  # Linux/macOS
.venv\Scripts\activate      # Windows

# Always add to .gitignore
echo ".venv/" >> .gitignore
```

## Step 5: Build and Publish
```bash
# Build package
python -m build

# Publish to PyPI
python -m twine upload dist/*

# Or use uv for everything
uv build
uv publish
```

## Best Practices
- Use pyproject.toml for ALL project configuration (no setup.py)
- Pin Python version with `.python-version` file
- Use `src/` layout to prevent import confusion
- Use uv for dependency management (10-100x faster than pip)
- Always use virtual environments — never install globally
- Generate lock files for reproducible builds

## Common Mistakes
- Using requirements.txt as the primary dependency specification
- Not using a virtual environment (pollutes global Python)
- Mixing setup.py and pyproject.toml
- Not pinning dependency versions for applications (use lock files)
