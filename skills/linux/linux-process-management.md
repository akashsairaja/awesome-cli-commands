---
id: linux-process-management
stackId: linux
type: skill
name: Linux Process Management & Monitoring
description: >-
  Master Linux process management — finding processes, reading resource usage,
  sending signals, managing priorities, diagnosing high CPU/memory, and using
  /proc for deep inspection.
difficulty: beginner
tags:
  - processes
  - monitoring
  - signals
  - top
  - htop
  - resource-management
  - linux
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Linux terminal basics
faq:
  - question: 'What is the difference between kill, kill -9, and kill -HUP on Linux?'
    answer: >-
      kill (SIGTERM) asks the process to shut down gracefully — it can save
      state and clean up. kill -9 (SIGKILL) forces immediate termination — the
      process cannot catch or ignore it, no cleanup occurs. kill -HUP (SIGHUP)
      traditionally means 'reload configuration' — many daemons re-read their
      config files on this signal.
  - question: How do I find which process is using the most CPU or memory on Linux?
    answer: >-
      For CPU: 'ps aux --sort=-%cpu | head' or press P in top/htop. For memory:
      'ps aux --sort=-%mem | head' or press M in top/htop. Check 'free -h' for
      system-wide memory and 'uptime' for CPU load averages. Load average above
      your CPU core count indicates overload.
relatedItems:
  - linux-system-administrator
  - linux-systemd-services
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Linux Process Management & Monitoring

## Overview
Every running program on Linux is a process with a PID, parent, resource usage, and state. Understanding process management is essential for debugging slow servers, killing stuck processes, and monitoring application health.

## Why This Matters
- A runaway process can consume all CPU/memory and crash your server
- Knowing which process uses resources is the first step in debugging
- Proper signal handling enables graceful shutdowns

## Process Management

### Step 1: Find and Inspect Processes
```bash
# List all processes with full details
ps aux

# Find a specific process
ps aux | grep nginx
pgrep -a nginx           # Simpler: PID + command
pidof nginx               # Just PIDs

# Process tree (shows parent-child relationships)
pstree -p                 # All processes
pstree -p $(pgrep -o nginx)  # Specific process tree
```

### Step 2: Monitor Resource Usage
```bash
# Real-time system overview
top                       # Classic
htop                      # Better UI, requires install

# Sort by resource in top:
# Press M for memory, P for CPU, T for time

# Top CPU consumers
ps aux --sort=-%cpu | head -20

# Top memory consumers
ps aux --sort=-%mem | head -20

# System-wide stats
vmstat 1 5               # CPU, memory, I/O every 1s for 5 iterations
iostat -xz 1 5           # Disk I/O per device
free -h                   # Memory overview
uptime                    # Load averages (1m, 5m, 15m)
```

### Step 3: Send Signals to Processes
```bash
# Graceful shutdown (SIGTERM — process can clean up)
kill 12345
kill -TERM 12345

# Force kill (SIGKILL — immediate, no cleanup)
kill -9 12345
kill -KILL 12345

# Reload configuration (SIGHUP)
kill -HUP 12345

# Kill all processes by name
killall nginx
pkill -f "node server.js"    # Match by full command string

# Signal reference:
# SIGTERM (15) — Graceful shutdown (default for kill)
# SIGKILL (9)  — Force kill (cannot be caught/ignored)
# SIGHUP (1)   — Reload config / hangup
# SIGINT (2)   — Interrupt (Ctrl+C)
# SIGUSR1 (10) — User-defined (often: reopen logs)
```

### Step 4: Diagnose High CPU/Memory
```bash
# Which process is using all CPU?
top -bn1 | head -20

# Which process is using all memory?
ps aux --sort=-%mem | head -10

# Check if OOM killer has been triggered
dmesg | grep -i "oom"
journalctl -k | grep -i "oom"

# Check process open files (too many = file descriptor leak)
ls /proc/12345/fd | wc -l
lsof -p 12345 | wc -l

# Check process network connections
ss -tnp | grep 12345
```

### Step 5: Background and Job Control
```bash
# Run command in background
long_running_command &

# Move running process to background
# Press Ctrl+Z (suspend), then:
bg                # Resume in background

# List background jobs
jobs

# Bring to foreground
fg %1
```

## Best Practices
- Always try SIGTERM before SIGKILL (allows graceful cleanup)
- Use htop for interactive process management (sort, filter, kill from UI)
- Monitor load averages: > CPU cores means system is overloaded
- Check dmesg for OOM killer events after unexpected process deaths
- Use systemd for long-running processes (not nohup or screen)

## Common Mistakes
- Using kill -9 as the first option (prevents graceful shutdown)
- Not checking load average context (4.0 is fine on an 8-core machine)
- Ignoring the D (uninterruptible sleep) state in top (usually I/O wait)
- Not monitoring file descriptor count (leaks cause "too many open files")
