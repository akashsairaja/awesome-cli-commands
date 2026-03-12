---
id: jq-object-construction
stackId: jq
type: skill
name: Object Construction & Reshaping with jq
description: >-
  Reshape JSON data with jq — constructing new objects, renaming fields, merging
  structures, string interpolation, and building output formats like CSV, TSV,
  and custom templates.
difficulty: intermediate
tags:
  - object-construction
  - string-interpolation
  - csv
  - data-reshaping
  - merging
  - format-conversion
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - jq 1.6+
faq:
  - question: How do I rename fields in jq?
    answer: >-
      Construct a new object with the desired names: jq '{new_name: .old_name}'.
      For multiple fields: jq '{user_name: .name, user_email: .email, id}'
      (shorthand keeps original name for id).
  - question: How do I merge two JSON objects with jq?
    answer: >-
      Use * for deep merge: jq '. * {"new_field": "value"}'. Use + for shallow
      merge. Merge files: jq -s '.[0] * .[1]' file1.json file2.json. The right
      operand wins on conflicts for both operators.
  - question: How do I convert JSON to CSV with jq?
    answer: >-
      Use @csv format: jq -r '.[] | [.id, .name, .email] | @csv'. This properly
      escapes quotes and commas. Add a header: (echo 'id,name,email'; jq -r '.[]
      | [.id, .name, .email] | @csv' data.json) > output.csv.
relatedItems:
  - jq-api-processing
  - jq-array-operations
  - jq-data-transformer
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Object Construction & Reshaping with jq

## Overview
jq's object construction syntax lets you reshape JSON data into any structure. Rename fields, merge objects, interpolate strings, and convert JSON to CSV, TSV, or custom text formats.

## Why This Matters
- **Data transformation** — reshape API responses for downstream systems
- **Format conversion** — convert JSON to CSV, TSV, or custom formats
- **Field normalization** — standardize field names across data sources
- **Reporting** — build human-readable summaries from JSON data

## How It Works

### Step 1: New Object Construction
```bash
# Select specific fields
echo '{"id":1,"name":"Alice","email":"a@b.com","age":30}' | \
  jq '{name, email}'

# Rename fields
echo '{"first_name":"Alice","last_name":"Smith"}' | \
  jq '{full_name: "\(.first_name) \(.last_name)"}'

# Computed fields
echo '{"price":100,"tax_rate":0.08}' | \
  jq '{price, tax: (.price * .tax_rate), total: (.price * (1 + .tax_rate))}'
```

### Step 2: Object Merging
```bash
# Merge two objects (* operator)
echo '{"a":1,"b":2}' | jq '. * {"b":99,"c":3}'
# Result: {"a":1,"b":99,"c":3}

# Merge with addition (+ operator, no deep merge)
echo '{"a":1}' | jq '. + {"b":2}'

# Merge from two files
jq -s '.[0] * .[1]' defaults.json overrides.json

# Conditional field addition
echo '{"name":"Alice","role":"admin"}' | jq '
  . + (if .role == "admin" then {admin_access: true} else {} end)
'
```

### Step 3: String Interpolation
```bash
# Interpolation in strings
echo '{"name":"Alice","age":30}' | jq '"\(.name) is \(.age) years old"'

# Build URLs
echo '{"org":"acme","repo":"api"}' | jq -r '"https://github.com/\(.org)/\(.repo)"'

# Template output
echo '[{"name":"Alice","score":95},{"name":"Bob","score":87}]' | jq -r '
  .[] | "Student: \(.name) | Score: \(.score)/100"
'
```

### Step 4: Format Conversion
```bash
# JSON to CSV
echo '[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]' | \
  jq -r '.[] | [.id, .name] | @csv'

# JSON to TSV
echo '[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]' | \
  jq -r '.[] | [.id, .name] | @tsv'

# JSON to HTML table rows
echo '[{"name":"Alice","role":"admin"}]' | jq -r '
  .[] | "<tr><td>\(.name)</td><td>\(.role)</td></tr>"
'

# JSON to shell variables
echo '{"host":"db.example.com","port":5432}' | jq -r '
  to_entries | .[] | "export \(.key | ascii_upcase)=\(.value)"
'

# JSON to YAML-like output
echo '{"database":{"host":"localhost","port":5432}}' | jq -r '
  paths(scalars) as $p | "\($p | join(".")): \(getpath($p))"
'
```

## Best Practices
- Use string interpolation \() for readable templates
- Use @csv/@tsv for proper escaping in delimited output
- Use * for deep merge, + for shallow merge
- Use to_entries/from_entries for key-value transformations
- Always use -r flag with string output formats

## Common Mistakes
- Forgetting -r flag (output includes JSON quotes)
- Using + instead of * for nested object merge (shallow only)
- Building CSV manually instead of using @csv (escaping issues)
- Not handling null values in string interpolation
- Using string concatenation instead of interpolation syntax
