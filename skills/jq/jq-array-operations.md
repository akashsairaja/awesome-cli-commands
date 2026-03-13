---
id: jq-array-operations
stackId: jq
type: skill
name: >-
  Array Operations & Aggregation in jq
description: >-
  Process JSON arrays with jq — map, select, group_by, sort_by, unique_by,
  flatten, and reduce for transforming, filtering, and aggregating array data
  in pipelines.
difficulty: intermediate
tags:
  - jq
  - array
  - operations
  - aggregation
  - api
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Array Operations & Aggregation in jq skill?"
    answer: >-
      Process JSON arrays with jq — map, select, group_by, sort_by, unique_by,
      flatten, and reduce for transforming, filtering, and aggregating array
      data in pipelines. This skill provides a structured workflow for
      development tasks.
  - question: "What tools and setup does Array Operations & Aggregation in jq require?"
    answer: >-
      Works with standard jq tooling (relevant CLI tools and frameworks). No
      special setup required beyond a working jq environment.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Array Operations & Aggregation in jq

## Overview
Arrays are the most common JSON structure in API responses. jq provides powerful array operations — map, select, group_by, sort_by, and reduce — to filter, transform, and aggregate array data.

## Why This Matters
- **Data filtering** — find items matching complex criteria
- **Aggregation** — sum, average, count, and group data
- **Sorting** — order results by any field
- **Deduplication** — remove duplicates by key

## How It Works

### Step 1: Map & Select (Filter + Transform)
```bash
# Map — transform each element
echo '[1,2,3,4,5]' | jq 'map(. * 10)'
# [10,20,30,40,50]

# Select — filter elements
echo '[1,2,3,4,5]' | jq 'map(select(. > 3))'
# [4,5]

# Map with object transformation
echo '[{"name":"Alice","age":30},{"name":"Bob","age":25}]' | jq '
  map(select(.age >= 28) | {name, senior: true})
'
```

### Step 2: Sorting & Deduplication
```bash
# Sort by field
echo '[{"name":"Bob","age":25},{"name":"Alice","age":30}]' | jq 'sort_by(.name)'

# Reverse sort
echo '[{"name":"Bob","score":90},{"name":"Alice","score":95}]' | jq 'sort_by(.score) | reverse'

# Unique by field
echo '[{"id":1,"name":"A"},{"id":1,"name":"B"},{"id":2,"name":"C"}]' | jq 'unique_by(.id)'

# Min and max
echo '[3,1,4,1,5,9]' | jq 'min, max'

# Min/max by field
echo '[{"name":"A","score":80},{"name":"B","score":95}]' | jq 'max_by(.score)'
```

### Step 3: Grouping & Aggregation
```bash
# Group by field
echo '[{"dept":"eng","name":"A"},{"dept":"eng","name":"B"},{"dept":"sales","name":"C"}]' | jq '
  group_by(.dept) | map({
    department: .[0].dept,
    count: length,
    members: map(.name)
  })
'

# Sum
echo '[{"amount":100},{"amount":250},{"amount":50}]' | jq 'map(.amount) | add'

# Average
echo '[10,20,30,40,50]' | jq 'add / length'

# Count by category
echo '[{"status":"active"},{"status":"inactive"},{"status":"active"}]' | jq '
  group_by(.status) | map({status: .[0].status, count: length})
'
```

### Step 4: Flatten & Combine
```bash
# Flatten nested arrays
echo '[[1,2],[3,4],[5]]' | jq 'flatten'
# [1,2,3,4,5]

# Flatten one level
echo '[[[1]],[2,[3]]]' | jq 'flatten(1)'

# Zip two arrays
echo '{"names":["A","B"],"scores":[90,85]}' | jq '
  [.names, .scores] | transpose | map({name: .[0], score: .[1]})
'

# Array difference
echo '{"all":[1,2,3,4,5],"exclude":[2,4]}' | jq '
  .all - .exclude
'
```

## Best Practices
- Use map(select(...)) for filter+transform in one pass
- Use group_by + map for pivot-table-style aggregation
- Use sort_by(.field) over sort (which sorts lexicographically)
- Use unique_by over unique for object arrays
- Use add for summing (works on numbers and arrays)

## Common Mistakes
- Using sort instead of sort_by (sorts as strings, not by field)
- Forgetting that group_by requires pre-sorted input? No, jq handles it
- Using length on objects (returns key count, not useful for "size")
- Not using // for default values in aggregation (null + number = null)
- Nested map() when a single pipe would work
