---
id: linux-service-security
stackId: linux
type: rule
name: Linux Service Security Rules
description: >-
  Enforce security standards for Linux services — dedicated service users,
  systemd sandboxing directives, resource limits, and network isolation for
  production deployments.
difficulty: intermediate
globs:
  - '**/*.service'
  - '**/systemd/**'
tags:
  - service-security
  - systemd
  - sandboxing
  - resource-limits
  - hardening
  - linux
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
  - question: Why should Linux services run as non-root users?
    answer: >-
      If a service running as root is compromised, the attacker has full system
      access — they can read all files, install rootkits, and pivot to other
      systems. Running as a dedicated user limits the blast radius: the attacker
      can only access what that user can access. Use systemd's User= directive
      and security sandboxing for defense in depth.
  - question: What does systemd-analyze security show?
    answer: >-
      It scores each service from 0 (most secure) to 10 (least secure) based on
      security directives used: file system protection, capabilities,
      networking, user namespace isolation, etc. It highlights which directives
      are missing and their security impact. Aim for a score below 4.0 for
      production services.
relatedItems:
  - linux-systemd-services
  - linux-security-hardening
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Linux Service Security Rules

## Rule
Every service MUST run as a dedicated non-root user with systemd security directives enabled.

## Format
```ini
[Service]
User=myservice
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
```

## Requirements

### 1. Dedicated Service Users
```bash
# Create system user for each service
sudo useradd --system --shell /usr/sbin/nologin --home-dir /opt/myservice myservice

# NEVER run services as root unless absolutely necessary
# (Only systemd itself and a few system services need root)
```

### 2. systemd Security Directives
```ini
[Service]
# Prevent privilege escalation
NoNewPrivileges=yes

# File system protection
ProtectSystem=strict          # / is read-only, /usr /boot /etc read-only
ReadWritePaths=/opt/myservice/data  # Whitelist writable paths
ProtectHome=yes               # /home is inaccessible
PrivateTmp=yes                # Isolated /tmp

# Kernel protection
ProtectKernelTunables=yes     # /proc/sys read-only
ProtectKernelModules=yes      # Cannot load kernel modules
ProtectKernelLogs=yes         # Cannot read kernel logs

# Network restrictions (if service doesn't need network)
# PrivateNetwork=yes

# Capabilities (drop all, add only what's needed)
CapabilityBoundingSet=
AmbientCapabilities=
# For port < 1024: CapabilityBoundingSet=CAP_NET_BIND_SERVICE
```

### 3. Resource Limits
```ini
[Service]
MemoryMax=512M               # OOM kill if exceeds 512MB
MemoryHigh=400M              # Throttle at 400MB
CPUQuota=200%                # Max 2 CPU cores
TasksMax=100                 # Max 100 processes/threads
LimitNOFILE=65535            # Max open files
```

### 4. Verify Security
```bash
# Check security score for a service
systemd-analyze security myservice.service

# Output shows a score from 0 (most secure) to 10 (least secure)
# Aim for < 4.0
```

## Anti-Patterns
- Running application services as root
- No resource limits (runaway process consumes all memory)
- Services with full file system access (no ProtectSystem)
- Not using PrivateTmp (temp file attacks)
- Services that can load kernel modules (privilege escalation)

## Enforcement
Run systemd-analyze security on all services monthly. Require security review for new service unit files. Alert on any service running as root.
