---
id: clitools-io-redirection
stackId: clitools
type: skill
name: I/O Redirection & File Descriptors
description: >-
  Master Unix I/O redirection — stdout/stderr control, file descriptors, here
  documents, process substitution, and designing robust data flow in shell
  scripts and pipelines.
difficulty: intermediate
tags:
  - redirection
  - file-descriptors
  - stdout
  - stderr
  - heredoc
  - tee
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Bash or Zsh shell
faq:
  - question: What is the difference between > and >> in bash?
    answer: >-
      > overwrites the file (creates if it doesn't exist). >> appends to the
      file. Use > for fresh output files, >> for log files that accumulate data.
      Common pattern: > file at script start to clear, then >> file for
      subsequent writes.
  - question: How do I redirect stderr and stdout to different files?
    answer: >-
      command > stdout.txt 2> stderr.txt. To merge both: command > combined.txt
      2>&1 (order matters — 2>&1 must come after >). Bash shorthand for both:
      command &> combined.txt.
  - question: 'What are file descriptors 0, 1, and 2?'
    answer: >-
      0 = stdin (input), 1 = stdout (normal output), 2 = stderr (error output).
      You can create custom descriptors 3-9 with exec: exec 3> myfile.txt. Write
      to them with >&3. This is useful for logging to multiple destinations
      simultaneously.
relatedItems:
  - clitools-text-processing
  - clitools-xargs-parallel
  - clitools-pipeline-architect
version: 1.0.0
lastUpdated: '2026-03-12'
---

# I/O Redirection & File Descriptors

## Overview
Unix I/O redirection controls where command input comes from and where output goes. Understanding stdout, stderr, file descriptors, and process substitution is essential for shell scripting and pipeline design.

## Why This Matters
- **Error handling** — separate error messages from data output
- **Logging** — redirect output to files without losing console display
- **Pipelines** — control data flow between commands precisely
- **Scripting** — build robust scripts with proper output management

## How It Works

### Step 1: Basic Redirection
```bash
# Stdout to file (overwrite)
command > output.txt

# Stdout to file (append)
command >> output.txt

# Stderr to file
command 2> errors.txt

# Both stdout and stderr to file
command > output.txt 2>&1
command &> output.txt              # bash shorthand

# Stdin from file
command < input.txt

# Discard output
command > /dev/null 2>&1
```

### Step 2: Separate stdout and stderr
```bash
# Different files for stdout and stderr
./build.sh > build.log 2> build-errors.log

# Stderr to file, stdout to pipe
./process.sh 2> errors.log | next-command

# Swap stdout and stderr
command 3>&1 1>&2 2>&3 3>&-
```

### Step 3: Here Documents & Here Strings
```bash
# Here document (multi-line input)
cat <<EOF
Hello, $USER
Today is $(date)
EOF

# Here document (no variable expansion)
cat <<'EOF'
Literal $USER and $(date)
EOF

# Here string (single-line input)
grep "pattern" <<< "search in this string"
bc <<< "2 + 2"
```

### Step 4: Advanced File Descriptors
```bash
# Open file descriptor for writing
exec 3> logfile.txt
echo "message 1" >&3
echo "message 2" >&3
exec 3>&-                # close fd 3

# Open file descriptor for reading
exec 4< input.txt
read -r line <&4
exec 4<&-                # close fd 4

# Capture stderr in variable while passing stdout
{ error=$(command 2>&1 1>&3-); } 3>&1
```

### Step 5: tee — Split Output
```bash
# Write to file AND display on screen
command | tee output.txt

# Append to file AND display
command | tee -a output.txt

# Write to multiple files
command | tee file1.txt file2.txt

# Capture intermediate pipeline stage
cmd1 | tee /dev/stderr | cmd2    # debug: see data between stages
```

## Best Practices
- Use `2>&1` to merge stderr into stdout for logging
- Use `tee` when you need both file output and console display
- Close file descriptors when done: `exec 3>&-`
- Use `<<'EOF'` (quoted) to prevent variable expansion in heredocs
- Redirect to `/dev/null` to silence unwanted output

## Common Mistakes
- Wrong order: `2>&1 > file` does NOT capture stderr to file (use `> file 2>&1`)
- Forgetting to close custom file descriptors (resource leak)
- Using `>` when you mean `>>` (overwrites existing file)
- Not quoting heredoc delimiter when literals are needed
- Redirecting inside a pipeline stage incorrectly
