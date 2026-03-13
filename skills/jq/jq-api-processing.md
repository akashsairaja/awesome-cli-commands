---
id: jq-api-processing
stackId: jq
type: skill
name: Processing API Responses with jq
description: >-
  Transform API JSON responses with jq — extracting fields, filtering arrays,
  reshaping data, pagination handling, and building API data processing
  pipelines from the command line.
difficulty: beginner
tags:
  - jq
  - processing
  - api
  - responses
  - automation
  - debugging
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Processing API Responses with jq skill?"
    answer: >-
      Transform API JSON responses with jq — extracting fields, filtering
      arrays, reshaping data, pagination handling, and building API data
      processing pipelines from the command line. This skill provides a
      structured workflow for development tasks.
  - question: "What tools and setup does Processing API Responses with jq require?"
    answer: >-
      Requires pip/poetry installed. Works with jq projects. No additional
      configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Processing API Responses with jq

## Overview
jq is the standard tool for processing JSON API responses on the command line. Extract fields, filter arrays, reshape data, and build processing pipelines that turn raw API output into actionable data.

## Why This Matters
- **API automation** — process API data in shell scripts
- **Data extraction** — pull specific fields from complex responses
- **Reporting** — aggregate and summarize API data
- **Debugging** — inspect and format API responses quickly

## How It Works

### Step 1: Basic Field Extraction
```bash
# Access nested fields
curl -sS https://api.github.com/repos/jqlang/jq | jq '.name, .stargazers_count'

# Extract from arrays
curl -sS https://api.github.com/users/octocat/repos | jq '.[].name'

# Select specific fields
curl -sS https://api.github.com/users/octocat/repos | jq '.[] | {name, language, stars: .stargazers_count}'
```

### Step 2: Filtering Results
```bash
# Filter by field value
curl -sS https://api.example.com/users | jq '.data[] | select(.role == "admin")'

# Multiple conditions
curl -sS https://api.example.com/products | jq '
  .data[] | select(.price > 10 and .in_stock == true)
'

# Null-safe filtering
curl -sS https://api.example.com/users | jq '
  .data[] | select(.email != null and (.email | length) > 0)
'
```

### Step 3: Transforming Data
```bash
# Reshape objects
curl -sS https://api.example.com/users | jq '
  .data | map({
    id,
    full_name: "\(.first_name) \(.last_name)",
    contact: .email
  })
'

# Count and aggregate
curl -sS https://api.example.com/orders | jq '
  .data | {
    total_orders: length,
    total_revenue: (map(.amount) | add),
    avg_order: (map(.amount) | add / length)
  }
'

# Group by field
curl -sS https://api.example.com/orders | jq '
  .data | group_by(.status) | map({
    status: .[0].status,
    count: length,
    total: (map(.amount) | add)
  })
'
```

### Step 4: Pagination Handling
```bash
# Process paginated API
page=1
while true; do
  response=$(curl -sS "https://api.example.com/items?page=$page&limit=100")
  items=$(echo "$response" | jq '.data | length')
  echo "$response" | jq -r '.data[] | [.id, .name] | @tsv'
  [ "$items" -lt 100 ] && break
  page=$((page + 1))
done
```

## Best Practices
- Use -r for raw string output when piping to other commands
- Use -e for validation scripts (exits non-zero on false/null)
- Cache API responses to a file for iterative jq development
- Use // for default values on optional fields
- Use ? for optional access to prevent errors on missing keys

## Common Mistakes
- Not using -r (quotes in output break downstream commands)
- Parsing JSON with grep/sed instead of jq
- Not handling null values (causes unexpected output)
- Missing -e flag in validation scripts (false returns 0)
- Fetching API on every jq iteration (cache response to variable)
