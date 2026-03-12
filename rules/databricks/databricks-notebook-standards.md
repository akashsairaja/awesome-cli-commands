---
id: databricks-notebook-standards
stackId: databricks
type: rule
name: Notebook Development Standards
description: >-
  Enforce consistent Databricks notebook structure — widget parameterization,
  markdown documentation, cell organization, error handling, and
  production-readiness requirements.
difficulty: beginner
globs:
  - '**/*.py'
  - '**/*.sql'
tags:
  - notebooks
  - standards
  - widgets
  - documentation
  - production-readiness
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - python
  - sql
faq:
  - question: Why must all Databricks notebooks use widgets?
    answer: >-
      Widgets make notebooks reusable across environments (dev/staging/prod) and
      time periods (different dates). When converted to scheduled jobs, widget
      values become job parameters. Hardcoded values require code changes for
      each environment, risking production incidents.
  - question: What structure should every Databricks notebook follow?
    answer: >-
      Start with markdown title/description, then widget definitions, then
      imports. Follow with transformation steps separated by markdown section
      headers. End with data quality assertions and a write-to-Delta cell. This
      structure ensures readability and production-readiness.
relatedItems:
  - databricks-sql-style-rules
  - databricks-delta-table-rules
  - databricks-notebook-engineer
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Notebook Development Standards

## Rule
All Databricks notebooks MUST use widgets for parameters, include markdown documentation, follow the standard cell structure, and handle errors for production readiness.

## Required Cell Structure
```
Cell 1: Markdown — Title, description, author, last updated
Cell 2: Python — Widget definitions (ALL configurable parameters)
Cell 3: Python — Imports and configuration
Cell 4+: Python/SQL — Transformations with markdown section headers
Cell N-1: Python — Data quality assertions
Cell N: Python/SQL — Write output to Delta table
```

## Widget Requirements

### Good — Fully Parameterized
```python
# All configurable values as widgets
dbutils.widgets.text("env", "dev", "Environment")
dbutils.widgets.text("run_date", "", "Run Date (YYYY-MM-DD)")
dbutils.widgets.text("catalog", "", "Catalog Name")
dbutils.widgets.dropdown("mode", "append", ["append", "overwrite"], "Write Mode")

env = dbutils.widgets.get("env")
run_date = dbutils.widgets.get("run_date") or str(date.today())
catalog = dbutils.widgets.get("catalog") or f"{env}_catalog"
```

### Bad — Hardcoded Values
```python
# NEVER hardcode these
catalog = "prod_catalog"  # Should be a widget
run_date = "2026-03-01"   # Should be a widget
```

## Markdown Requirements
- Title cell with notebook purpose and author
- Section headers before each logical transformation step
- Comments explaining business logic (not just code mechanics)

## Error Handling
```python
# Good — explicit error handling
try:
    df = spark.read.table(f"{catalog}.bronze.events")
    assert df.count() > 0, "Source table is empty"
except Exception as e:
    dbutils.notebook.exit(f"FAILED: {str(e)}")
```

## Anti-Patterns
- Hardcoded dates, paths, catalog names, or environment strings
- No markdown cells between code cells (unreadable)
- Using display() as the final output (results not persisted)
- No error handling (silent failures in production)
- collect() on large datasets without limit (OOM)
- print() for logging instead of structured logging
