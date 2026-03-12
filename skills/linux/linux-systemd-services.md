---
id: linux-systemd-services
stackId: linux
type: skill
name: Creating & Managing systemd Services
description: >-
  Create production-ready systemd services — unit file structure, security
  directives, dependency management, automatic restarts, logging with journald,
  and timer-based scheduling.
difficulty: intermediate
tags:
  - systemd
  - services
  - unit-files
  - journald
  - timers
  - process-management
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
  - Linux basics
  - Root or sudo access
faq:
  - question: What is systemd and why should I use it for my applications?
    answer: >-
      systemd is the standard service manager on modern Linux. It provides
      automatic process restart on crash, boot-time startup with dependency
      ordering, resource limits (memory, CPU), security sandboxing, and
      centralized logging via journald. Every production application should run
      as a systemd service instead of using nohup, screen, or pm2.
  - question: How do I view logs for a systemd service?
    answer: >-
      Use journalctl: 'journalctl -u myapp.service -f' for live logs, '-n 100'
      for last 100 lines, '--since' and '--until' for time ranges, '-b' for
      current boot. Output formats include text (default), json, and
      short-precise. Logs are persisted across reboots if /var/log/journal
      exists.
  - question: What is the difference between systemd timers and cron?
    answer: >-
      systemd timers offer: journald logging (cron uses mail), dependency
      management, persistent scheduling (runs missed jobs after downtime),
      randomized delays (avoid thundering herd), resource limits, and
      calendar-based or monotonic scheduling. Cron is simpler for basic tasks
      but lacks these production features.
relatedItems:
  - linux-system-administrator
  - linux-process-management
version: 1.0.0
lastUpdated: '2026-03-11'
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
