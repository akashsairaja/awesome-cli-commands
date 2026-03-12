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
  - api
  - json
  - data-extraction
  - filtering
  - aggregation
  - curl-integration
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - jq installed
  - curl or httpie for API calls
faq:
  - question: How do I extract a single field from a JSON API response?
    answer: >-
      Pipe through jq with the field path: curl -sS url | jq '.data.name'. For
      arrays: jq '.data[].name'. For raw string output (no quotes): jq -r
      '.data.name'. Chain with select() to filter: jq '.data[] | select(.id ==
      5) | .name'.
  - question: How do I handle paginated API responses with jq?
    answer: >-
      Loop with page counter: fetch each page, process with jq, break when
      results are fewer than the page size. Store results in a file and process
      after: while fetch; do jq '.data[]' >> all.json; done. Or use jq --slurp
      to combine multiple API calls.
  - question: How do I validate an API response structure with jq?
    answer: >-
      Use jq -e for boolean assertions: curl url | jq -e '.data | length > 0'
      checks the array is non-empty. Check required fields: jq -e '.data |
      all(.id and .name)' verifies all items have id and name. The -e flag exits
      non-zero on false/null for script error handling.
relatedItems:
  - jq-object-construction
  - jq-array-operations
  - jq-data-transformer
version: 1.0.0
lastUpdated: '2026-03-12'
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
