---
id: sshgpg-ssh-config
stackId: sshgpg
type: skill
name: SSH Config File Mastery
description: >-
  Configure ~/.ssh/config for efficient multi-host management — host aliases,
  per-host keys, jump/bastion hosts, connection multiplexing, and wildcard
  patterns.
difficulty: advanced
tags:
  - sshgpg
  - ssh
  - config
  - file
  - mastery
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
  - question: "When should I use the SSH Config File Mastery skill?"
    answer: >-
      Configure ~/.ssh/config for efficient multi-host management — host
      aliases, per-host keys, jump/bastion hosts, connection multiplexing, and
      wildcard patterns. This skill provides a structured workflow for key
      management, secure connections, threat modeling, and security auditing.
  - question: "What tools and setup does SSH Config File Mastery require?"
    answer: >-
      Works with standard SSH/GPG Security tooling (ssh, ssh-agent). Review
      the setup section in the skill content for specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# SSH Config File Mastery

## Overview
The SSH config file (~/.ssh/config) eliminates repetitive SSH commands by defining per-host settings. Instead of typing `ssh -i ~/.ssh/work_key -p 2222 user@long-hostname.example.com`, just type `ssh work`.

## Why This Matters
- **Short aliases** — `ssh prod` instead of full connection strings
- **Per-host keys** — different keys for GitHub, work, personal servers
- **Jump hosts** — seamless bastion/proxy connections
- **Multiplexing** — reuse connections for faster subsequent SSH sessions

## How It Works

### Step 1: Basic Host Configuration
```bash
# ~/.ssh/config

# GitHub
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_ed25519
  IdentitiesOnly yes

# Production server
Host prod
  HostName 203.0.113.10
  User deploy
  Port 2222
  IdentityFile ~/.ssh/work_ed25519
  IdentitiesOnly yes

# Staging server
Host staging
  HostName 203.0.113.20
  User deploy
  IdentityFile ~/.ssh/work_ed25519
```

### Step 2: Jump/Bastion Host
```bash
# Bastion host
Host bastion
  HostName bastion.example.com
  User admin
  IdentityFile ~/.ssh/work_ed25519

# Servers behind bastion (automatic jump)
Host internal-*
  ProxyJump bastion
  User admin
  IdentityFile ~/.ssh/work_ed25519

Host internal-db
  HostName 10.0.1.50

Host internal-app
  HostName 10.0.1.51

# Usage: ssh internal-db (automatically jumps through bastion)
```

### Step 3: Connection Multiplexing
```bash
# Reuse connections (faster subsequent SSH/SCP/SFTP)
Host *
  ControlMaster auto
  ControlPath ~/.ssh/sockets/%r@%h-%p
  ControlPersist 600
  ServerAliveInterval 60
  ServerAliveCountMax 3
  AddKeysToAgent yes
```

### Step 4: Wildcard Patterns
```bash
# Apply settings to all hosts matching a pattern
Host *.prod.example.com
  User deploy
  IdentityFile ~/.ssh/prod_ed25519
  LogLevel QUIET

Host *.dev.example.com
  User developer
  IdentityFile ~/.ssh/dev_ed25519
  ForwardAgent yes
```

## Create Socket Directory
```bash
mkdir -p ~/.ssh/sockets
chmod 700 ~/.ssh/sockets
```

## Best Practices
- **Use IdentitiesOnly yes** — prevents SSH from trying all keys
- **Put specific hosts before wildcards** — first match wins
- **Use ProxyJump over ProxyCommand** — simpler, more secure
- **Enable ControlMaster** for connection reuse
- **Set ServerAliveInterval** to prevent idle disconnects
- **Set AddKeysToAgent yes** to auto-add keys to agent on first use

## Common Mistakes
- Missing IdentitiesOnly (SSH tries all keys, gets locked out)
- Wildcard (*) before specific hosts (first match wins)
- ForwardAgent on untrusted hosts (security risk)
- Missing socket directory for ControlMaster
- Not setting file permissions (chmod 600 ~/.ssh/config)
