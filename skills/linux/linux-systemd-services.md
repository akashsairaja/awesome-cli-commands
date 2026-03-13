---
id: linux-systemd-services
stackId: linux
type: skill
name: >-
  Creating & Managing systemd Services
description: >-
  Create production-ready systemd services — unit file structure, security
  directives, dependency management, automatic restarts, logging with
  journald, and timer-based scheduling.
difficulty: advanced
tags:
  - linux
  - creating
  - managing
  - systemd
  - services
  - security
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Creating & Managing systemd Services skill?"
    answer: >-
      Create production-ready systemd services — unit file structure, security
      directives, dependency management, automatic restarts, logging with
      journald, and timer-based scheduling. This skill provides a structured
      workflow for shell scripting, process management, file permissions, and
      system troubleshooting.
  - question: "What tools and setup does Creating & Managing systemd Services require?"
    answer: >-
      Works with standard Linux tooling (Bash, coreutils). No special setup
      required beyond a working Linux system administration environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Creating & Managing systemd Services

## Overview
systemd is the init system and service manager for modern Linux. It manages service lifecycle (start, stop, restart), handles dependencies, provides logging via journald, and supports security sandboxing. Every production application should run as a systemd service.

## Why This Matters
- Automatic restart on crash — your app stays running without manual intervention
- Boot-time startup — services start in the right order
- Security sandboxing — limit what a service can access
- Centralized logging — journald captures all output

## Creating a Service

### Step 1: Write the Unit File
```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Application Server
Documentation=https://docs.myapp.com
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=myapp
Group=myapp
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/node /opt/myapp/server.js
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5
StartLimitBurst=3
StartLimitIntervalSec=60

# Environment
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=/opt/myapp/.env

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=myapp

# Security hardening
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
ReadWritePaths=/opt/myapp/data
MemoryMax=512M
CPUQuota=200%

[Install]
WantedBy=multi-user.target
```

### Step 2: Create the Service User
```bash
# Create a system user with no login shell
sudo useradd --system --shell /usr/sbin/nologin --home-dir /opt/myapp myapp
sudo chown -R myapp:myapp /opt/myapp
```

### Step 3: Enable and Start the Service
```bash
# Reload systemd to pick up new unit file
sudo systemctl daemon-reload

# Enable (start on boot) and start
sudo systemctl enable --now myapp.service

# Check status
sudo systemctl status myapp.service
```

### Step 4: View Logs with journald
```bash
# Follow live logs
sudo journalctl -u myapp.service -f

# Last 100 lines
sudo journalctl -u myapp.service -n 100

# Logs since last boot
sudo journalctl -u myapp.service -b

# Logs in time range
sudo journalctl -u myapp.service --since "2025-03-01" --until "2025-03-02"

# JSON output for parsing
sudo journalctl -u myapp.service -o json
```

### Step 5: systemd Timers (Modern Cron)
```ini
# /etc/systemd/system/backup.timer
[Unit]
Description=Run daily backup

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target

# /etc/systemd/system/backup.service
[Unit]
Description=Backup service

[Service]
Type=oneshot
ExecStart=/opt/scripts/backup.sh
User=backup
```

## Best Practices
- Always run services as a dedicated user (never root)
- Use security directives (ProtectSystem, PrivateTmp, NoNewPrivileges)
- Set resource limits (MemoryMax, CPUQuota) to prevent runaway processes
- Use EnvironmentFile for secrets (not Environment for sensitive values)
- Use Type=notify for services that signal readiness
- Set RestartSec to avoid tight restart loops on persistent failures

## Common Mistakes
- Running services as root when a dedicated user would work
- Using nohup or screen instead of systemd (no auto-restart, no logging)
- Not setting Restart=on-failure (service dies and stays dead)
- Hardcoding secrets in the unit file (readable by all)
- Forgetting daemon-reload after changing unit files
