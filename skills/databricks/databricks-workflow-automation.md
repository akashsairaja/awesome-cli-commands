---
id: databricks-workflow-automation
stackId: databricks
type: skill
name: Databricks Workflows & Job Orchestration
description: >-
  Build and manage Databricks Workflows — multi-task jobs, dependencies,
  schedules, parameterization, alerting, and CI/CD integration for automated
  data pipelines.
difficulty: intermediate
tags:
  - workflows
  - jobs
  - orchestration
  - scheduling
  - pipelines
  - automation
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - python
  - sql
prerequisites:
  - Databricks workspace with job creation permissions
  - Notebooks to orchestrate
faq:
  - question: What is a Databricks Workflow?
    answer: >-
      A Databricks Workflow is a multi-task job that orchestrates notebooks,
      Python scripts, SQL queries, and Delta Live Tables with dependencies,
      schedules, and monitoring. Tasks execute in order based on dependency
      definitions, with configurable retry and failure handling.
  - question: Should I use job clusters or all-purpose clusters for workflows?
    answer: >-
      Always use job clusters for workflows. They auto-terminate when the job
      completes, reducing costs. All-purpose clusters stay running and are meant
      for interactive development. Job clusters also support autoscaling
      specific to the workload.
  - question: How do I handle workflow failures?
    answer: >-
      Configure retry policies for transient failures, set up email/Slack
      notifications for persistent failures, use task dependencies to prevent
      downstream tasks from running on upstream failure, and implement data
      quality checks as dedicated tasks that block the pipeline.
relatedItems:
  - databricks-delta-lake-optimization
  - databricks-unity-catalog-setup
  - databricks-notebook-engineer
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Databricks Workflows & Job Orchestration

## Overview
Databricks Workflows orchestrate multi-task jobs with dependencies, schedules, and monitoring. Use them to run notebooks, Python scripts, SQL queries, and Delta Live Tables as automated pipelines.

## Why This Matters
- **Automation** — scheduled pipelines run without manual intervention
- **Dependencies** — tasks execute in correct order with failure handling
- **Monitoring** — built-in alerting and run history
- **Scalability** — job clusters spin up only when needed

## How It Works

### Step 1: Create a Multi-Task Workflow
```json
{
  "name": "daily-etl-pipeline",
  "tasks": [
    {
      "task_key": "ingest_raw",
      "notebook_task": {
        "notebook_path": "/pipelines/01_ingest_raw",
        "base_parameters": {
          "env": "prod",
          "date": "{{job.start_time.iso_date}}"
        }
      },
      "job_cluster_key": "etl_cluster"
    },
    {
      "task_key": "clean_transform",
      "depends_on": [{"task_key": "ingest_raw"}],
      "notebook_task": {
        "notebook_path": "/pipelines/02_clean_transform"
      },
      "job_cluster_key": "etl_cluster"
    },
    {
      "task_key": "build_aggregates",
      "depends_on": [{"task_key": "clean_transform"}],
      "notebook_task": {
        "notebook_path": "/pipelines/03_build_aggregates"
      },
      "job_cluster_key": "etl_cluster"
    },
    {
      "task_key": "data_quality_check",
      "depends_on": [{"task_key": "build_aggregates"}],
      "sql_task": {
        "query": {
          "query_id": "dq-check-daily"
        }
      }
    }
  ],
  "job_clusters": [
    {
      "job_cluster_key": "etl_cluster",
      "new_cluster": {
        "spark_version": "14.3.x-scala2.12",
        "node_type_id": "i3.xlarge",
        "autoscale": {"min_workers": 2, "max_workers": 8}
      }
    }
  ],
  "schedule": {
    "quartz_cron_expression": "0 0 6 * * ?",
    "timezone_id": "UTC"
  },
  "email_notifications": {
    "on_failure": ["data-team@company.com"]
  }
}
```

### Step 2: Parameterize for Environments
```python
# In notebook — read job parameters
dbutils.widgets.text("env", "dev")
dbutils.widgets.text("date", "")

env = dbutils.widgets.get("env")
run_date = dbutils.widgets.get("date") or str(date.today())

# Use environment-specific catalog
catalog = f"{env}_catalog"
spark.sql(f"USE CATALOG {catalog}")
```

### Step 3: Deploy with Databricks CLI
```bash
# Create or update workflow
databricks jobs create --json @workflow.json

# Trigger a manual run
databricks jobs run-now --job-id 12345 \
  --notebook-params '{"env": "prod", "date": "2026-03-11"}'

# List recent runs
databricks jobs list-runs --job-id 12345 --limit 10
```

## Best Practices
- Use job clusters (not all-purpose) for workflows — they auto-terminate
- Set up email/Slack alerts for failures
- Parameterize environment (dev/staging/prod) in all notebooks
- Use task dependencies, not sleep/wait patterns
- Enable retry policies for transient failures (network, cluster startup)
- Store workflow definitions in Git for version control

## Common Mistakes
- Using all-purpose clusters for jobs (expensive, don't auto-terminate)
- No alerting configured (failures go unnoticed)
- Hardcoded environments in notebooks (can't reuse for dev/prod)
- No retry policy (transient failures crash the whole pipeline)
- Manual workflow creation (not version controlled, not reproducible)
