---
id: ubuntu-user-management
stackId: ubuntu
type: skill
name: Ubuntu User & Group Management
description: >-
  Manage Ubuntu users and groups — creating service accounts, configuring sudo
  access, SSH key deployment, password policies, and PAM module configuration
  for multi-user servers.
difficulty: beginner
tags:
  - user-management
  - groups
  - sudo
  - ssh-keys
  - security
  - ubuntu
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Ubuntu 22.04+
  - sudo access
faq:
  - question: How do I create a service user on Ubuntu?
    answer: >-
      Use: sudo useradd --system --shell /usr/sbin/nologin --home-dir
      /opt/servicename servicename. The --system flag creates a user with a UID
      in the system range, --shell /usr/sbin/nologin prevents interactive login,
      and the dedicated home directory contains the service files.
  - question: Should I give developers full sudo access on Ubuntu servers?
    answer: >-
      No. Grant minimum necessary sudo permissions using /etc/sudoers.d/ files.
      For example, allow specific commands: 'deployer ALL=(ALL) NOPASSWD:
      /usr/bin/systemctl restart myapp'. Full sudo access means any compromised
      developer account becomes root. Use specific command whitelists.
relatedItems:
  - ubuntu-server-architect
  - ubuntu-ufw-management
  - linux-security-hardening
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Ubuntu User & Group Management

## Overview
Proper user management is the foundation of Linux security. Every person gets their own account, every service gets a dedicated system user, and sudo provides controlled privilege escalation. No shared accounts, no direct root login.

## Why This Matters
- Shared accounts make it impossible to audit who did what
- Service-specific users limit the blast radius of compromised services
- sudo provides an audit trail of privilege escalation

## User Management

### Step 1: Create User Accounts
```bash
# Create a regular user with home directory
sudo adduser janedoe
# Interactive: sets password, full name, etc.

# Create a system user for a service (no home, no login shell)
sudo useradd --system --shell /usr/sbin/nologin --home-dir /opt/myapp myapp

# Create user with specific UID/GID (for Docker volume permissions)
sudo useradd --uid 1001 --gid 1001 --create-home deployer
```

### Step 2: Configure sudo Access
```bash
# Add user to sudo group (full sudo access)
sudo usermod -aG sudo janedoe

# Grant specific sudo permissions (more secure)
sudo visudo -f /etc/sudoers.d/deployer
# deployer ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart myapp
# deployer ALL=(ALL) NOPASSWD: /usr/bin/journalctl -u myapp*
```

### Step 3: Deploy SSH Keys
```bash
# As the target user
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add authorized key
echo "ssh-ed25519 AAAAC3...rest_of_key janedoe@laptop" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Or use ssh-copy-id from the client machine
ssh-copy-id -i ~/.ssh/id_ed25519.pub janedoe@server
```

### Step 4: Manage Groups
```bash
# Create a group for a project
sudo groupadd developers

# Add users to the group
sudo usermod -aG developers janedoe
sudo usermod -aG developers johndoe

# Set group ownership on shared directory
sudo chown -R :developers /opt/project
sudo chmod -R 2775 /opt/project  # setgid: new files inherit group

# List user's groups
groups janedoe
id janedoe
```

### Step 5: Remove Users Safely
```bash
# Disable account (keep files, prevent login)
sudo usermod --lock --expiredate 1970-01-01 janedoe

# Remove user and home directory
sudo deluser --remove-home janedoe

# Check for processes owned by user before removing
ps aux | grep janedoe
crontab -u janedoe -l
```

## Best Practices
- One account per person — never share accounts
- One system user per service — never run services as root
- Use SSH keys only — disable password authentication
- Grant minimum sudo permissions — not blanket sudo access
- Lock accounts immediately when people leave the team
- Use groups for shared resource access (not world-readable permissions)
- Review /etc/sudoers.d/ regularly for stale permissions

## Common Mistakes
- Sharing the root or deploy user account across the team
- Granting NOPASSWD: ALL in sudoers (should be specific commands)
- Not locking accounts when team members leave
- Using adduser for service accounts (should use useradd --system)
- Setting passwords on system user accounts (should use --shell /usr/sbin/nologin)
