---
id: python-import-organization
stackId: python
type: rule
name: Import Organization and Standards
description: >-
  Organize Python imports in three groups — standard library, third-party, local
  — with alphabetical sorting within groups, absolute imports preferred, and no
  wildcard imports.
difficulty: beginner
globs:
  - '**/*.py'
  - '**/pyproject.toml'
tags:
  - imports
  - isort
  - organization
  - pep8
  - code-style
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
  - question: Why are wildcard imports bad in Python?
    answer: >-
      Wildcard imports (from module import *) pollute the namespace with unknown
      names, make it impossible to trace where a name comes from, can silently
      shadow built-ins, and break static analysis tools. Always import specific
      names to keep dependencies explicit and code reviewable.
  - question: Should I use relative or absolute imports in Python?
    answer: >-
      Prefer absolute imports (from app.models import User) for clarity and IDE
      navigation. Relative imports (from .utils import helper) are acceptable
      within a package for closely related modules. Never use relative imports
      that go up more than one level (from ...core import config) — they are
      fragile and confusing.
relatedItems:
  - python-pep8-style
  - python-type-hints
  - python-docstrings
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Import Organization and Standards

## Rule
Imports MUST be organized in three groups separated by blank lines: (1) standard library, (2) third-party, (3) local application. Use absolute imports. Never use wildcard imports.

## Format
```python
# 1. Standard library
import os
import sys
from collections.abc import Sequence
from pathlib import Path

# 2. Third-party packages
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# 3. Local application
from app.models import User
from app.services.auth import AuthService
```

## Good Examples
```python
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

import sqlalchemy as sa
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User
```

## Bad Examples
```python
# BAD: Wildcard import — pollutes namespace
from os.path import *
from django.shortcuts import *

# BAD: No grouping
import os
from app.models import User
import sys
from fastapi import FastAPI
from pathlib import Path

# BAD: Relative imports in application code
from ..models import User        # Use absolute: from app.models import User
from .utils import helper         # Acceptable within packages
```

## Enforcement
- isort or Ruff (I rules) for automatic sorting
- Ruff rule F403 catches wildcard imports
- Configure in pyproject.toml:
```toml
[tool.ruff.isort]
known-first-party = ["app"]
section-order = ["future", "standard-library", "third-party", "first-party", "local-folder"]
```
