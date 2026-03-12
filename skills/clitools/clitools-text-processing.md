---
id: clitools-text-processing
stackId: clitools
type: skill
name: 'Text Processing with awk, sed, and cut'
description: >-
  Master text processing with core Unix tools — awk for column extraction and
  calculations, sed for stream editing and substitution, and cut for field
  splitting in data pipelines.
difficulty: intermediate
tags:
  - awk
  - sed
  - cut
  - text-processing
  - data-transformation
  - unix
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Unix-like shell with GNU coreutils
faq:
  - question: When should I use awk vs sed vs cut?
    answer: >-
      cut: simple field extraction by delimiter or character position. sed:
      search-and-replace, line deletion, in-place file editing. awk:
      column-based processing with math, conditionals, and formatting. Rule of
      thumb: if you need math or if/else, use awk. If you need substitution, use
      sed. If you need columns, try cut first.
  - question: How do I process CSV files with awk?
    answer: >-
      Set the field separator: awk -F',' '{print $2}' data.csv. For CSVs with
      quoted fields containing commas, use gawk with FPAT: gawk
      'BEGIN{FPAT="[^,]*|\"[^\"]*\""} {print $2}' data.csv. For complex CSVs,
      consider csvkit or Miller instead.
  - question: How do I edit files in-place with sed?
    answer: >-
      Use -i flag: sed -i 's/old/new/g' file.txt. On macOS, use -i '' (empty
      backup extension). Always make backups: sed -i.bak 's/old/new/g' file.txt.
      Test without -i first to preview changes. Use -i with -e for multiple
      operations.
relatedItems:
  - clitools-io-redirection
  - clitools-xargs-parallel
  - clitools-pipeline-architect
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Text Processing with awk, sed, and cut

## Overview
The Unix text processing trio — awk, sed, and cut — handles 90% of text transformation tasks. Master these tools to process logs, CSVs, configuration files, and command output without writing scripts.

## Why This Matters
- **Log analysis** — extract timestamps, error codes, and metrics
- **Data transformation** — reformat CSV, TSV, and delimited data
- **Config management** — modify settings in-place across files
- **Pipeline building** — transform data between pipeline stages

## How It Works

### Step 1: cut — Simple Field Extraction
```bash
# Extract columns from delimited data
cut -d',' -f1,3 data.csv           # fields 1 and 3, comma-delimited
cut -d':' -f1 /etc/passwd           # usernames from passwd
cut -c1-10 file.txt                 # first 10 characters per line
echo "2024-01-15" | cut -d'-' -f1   # extract year
```

### Step 2: sed — Stream Editing
```bash
# Substitution
sed 's/old/new/g' file.txt          # replace all occurrences
sed -i 's/http:/https:/g' *.html    # in-place edit
sed -n '10,20p' file.txt            # print lines 10-20
sed '/^#/d' config.txt              # delete comment lines
sed '/^$/d' file.txt                # delete empty lines

# Multiple operations
sed -e 's/foo/bar/g' -e '/^$/d' file.txt

# Insert and append
sed '3i\New line before line 3' file.txt
sed '3a\New line after line 3' file.txt
```

### Step 3: awk — Column Processing & Calculations
```bash
# Column extraction
awk '{print $1, $3}' file.txt       # print columns 1 and 3
awk -F',' '{print $2}' data.csv     # CSV column 2

# Filtering
awk '$3 > 100' data.txt             # rows where column 3 > 100
awk '/ERROR/' app.log               # lines matching pattern
awk '$NF == "FAIL"' results.txt     # last field equals FAIL

# Calculations
awk '{sum += $2} END {print sum}' data.txt           # sum column 2
awk '{sum += $2; n++} END {print sum/n}' data.txt    # average
awk 'NR==1 || $3 > max {max=$3; line=$0} END {print line}' data.txt  # max

# Reformatting
awk -F',' '{printf "%-20s %10.2f\n", $1, $3}' data.csv
awk '{print NR": "$0}' file.txt     # add line numbers
```

### Step 4: Combining Tools
```bash
# Top 10 IP addresses in access log
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# Convert CSV to TSV
sed 's/,/\t/g' data.csv

# Extract and sum values from JSON-like logs
grep "duration_ms" app.log | sed 's/.*duration_ms=//;s/ .*//' | awk '{sum+=$1;n++} END {printf "avg: %.1fms\n", sum/n}'
```

## Best Practices
- Use cut for simple field extraction (fastest)
- Use sed for search-and-replace and line filtering
- Use awk for column math, conditional logic, and formatting
- Use -i flag carefully with sed (make backups: sed -i.bak)
- Quote awk programs in single quotes to prevent shell expansion

## Common Mistakes
- Forgetting -F flag in awk for non-space delimiters
- Using sed without -i for in-place edits (output goes to stdout)
- Not escaping special regex chars in sed patterns
- Using awk when cut suffices (unnecessary complexity)
- Not quoting variables in awk patterns
