---
id: ubuntu-service-management
stackId: ubuntu
type: rule
name: Ubuntu systemd Service Standards
description: >-
  Enforce Ubuntu service management standards — systemd unit file requirements,
  security directives, logging with journald, restart policies, and dependency
  ordering.
difficulty: intermediate
globs:
  - '**/*.service'
  - '**/systemd/**'
tags:
  - systemd
  - services
  - security
  - resource-limits
  - standards
  - ubuntu
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: Why should I use systemd instead of pm2 or screen on Ubuntu servers?
    answer: >-
      systemd provides: automatic restart on crash, boot-time startup with
      dependency ordering, resource limits (memory, CPU), security sandboxing
      (ProtectSystem, PrivateTmp), centralized logging via journald, and is the
      standard Linux service manager. pm2 and screen lack security sandboxing,
      resource limits, and OS-level integration.
  - question: What are the minimum security directives for a systemd service?
    answer: >-
      At minimum: User= (non-root), NoNewPrivileges=yes, ProtectSystem=strict,
      ProtectHome=yes, PrivateTmp=yes. These prevent privilege escalation, make
      the filesystem read-only except whitelisted paths, hide home directories,
      and isolate temporary files. Check your score with 'systemd-analyze
      security myapp.service'.
relatedItems:
  - ubuntu-server-baseline
  - linux-systemd-services
  - linux-service-security
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Ubuntu systemd Service Standards

## Rule
All application services on Ubuntu MUST run as systemd units with security hardening, resource limits, and proper logging.

## Format
```ini
[Unit]
Description=Service description
After=network.target

[Service]
Type=simple
User=dedicated-user
ExecStart=/path/to/binary
Restart=on-failure
NoNewPrivileges=yes

[Install]
WantedBy=multi-user.target
```

## Requirements

### 1. Every Application Is a systemd Service
```bash
# GOOD: systemd service
sudo systemctl enable --now myapp.service

# BAD: Running in screen/tmux/nohup
nohup node server.js &          # No auto-restart, no logging
screen -dmS myapp node server.js # Not production-grade
```

### 2. Mandatory Unit File Fields
```ini
[Unit]
Description=My Application API Server   # Required: what it does
After=network.target                     # Required: start after network
Wants=postgresql.service                 # Optional: soft dependency

[Service]
Type=simple                              # Required: simple, notify, or oneshot
User=myapp                               # Required: non-root user
Group=myapp                              # Required: dedicated group
WorkingDirectory=/opt/myapp              # Required: working directory
ExecStart=/usr/bin/node server.js        # Required: start command
Restart=on-failure                       # Required: auto-restart
RestartSec=5                             # Required: delay between restarts

[Install]
WantedBy=multi-user.target               # Required: boot target
```

### 3. Security Directives (Minimum Set)
```ini
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
ReadWritePaths=/opt/myapp/data
```

### 4. Resource Limits
```ini
MemoryMax=1G
CPUQuota=200%
TasksMax=256
LimitNOFILE=65535
```

## Anti-Patterns
- Running apps with nohup, screen, or pm2 on servers
- Services running as root without justification
- No Restart directive (service dies and stays dead)
- No resource limits (runaway process takes down the server)
- Missing security directives (full file system access)

## Enforcement
Use systemd-analyze security for all services. Require unit file review in PRs.
