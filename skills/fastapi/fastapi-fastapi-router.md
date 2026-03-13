---
id: fastapi-fastapi-router
stackId: fastapi
type: skill
name: FastAPI Router Py
description: >-
  Create FastAPI routers with CRUD operations, authentication dependencies,
  and proper response models.
difficulty: intermediate
tags:
  - fastapi
  - router
  - api
compatibility:
  - claude-code
faq:
  - question: "When should I use the FastAPI Router Py skill?"
    answer: >-
      Create FastAPI routers with CRUD operations, authentication
      dependencies, and proper response models. This skill provides a
      structured workflow for API endpoint design, async request handling,
      Pydantic validation, and OpenAPI generation.
  - question: "What tools and setup does FastAPI Router Py require?"
    answer: >-
      Works with standard FastAPI tooling (FastAPI, Uvicorn). No special setup
      required beyond a working FastAPI backend environment.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# FastAPI Router

Create FastAPI routers following established patterns with proper authentication, response models, and HTTP status codes.

## Quick Start

Copy the template from assets/template.py and replace placeholders:
- `{{ResourceName}}` → PascalCase name (e.g., `Project`)
- `{{resource_name}}` → snake_case name (e.g., `project`)
- `{{resource_plural}}` → plural form (e.g., `projects`)

## Authentication Patterns

```python
# Optional auth - returns None if not authenticated
current_user: Optional[User] = Depends(get_current_user)

# Required auth - raises 401 if not authenticated
current_user: User = Depends(get_current_user_required)
```

## Response Models

```python
@router.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: str) -> Item:
    ...

@router.get("/items", response_model=list[Item])
async def list_items() -> list[Item]:
    ...
```

## HTTP Status Codes

```python
@router.post("/items", status_code=status.HTTP_201_CREATED)
@router.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)
```

## Integration Steps

1. Create router in `src/backend/app/routers/`
2. Mount in `src/backend/app/main.py`
3. Create corresponding Pydantic models
4. Create service layer if needed
5. Add frontend API functions

## When to Use
This skill is applicable to execute the workflow or actions described in the overview.
