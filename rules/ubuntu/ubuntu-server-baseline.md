---
id: ubuntu-server-baseline
stackId: ubuntu
type: rule
name: Ubuntu Server Baseline Configuration
description: >-
  Enforce minimum security baseline for Ubuntu servers — UFW enabled, SSH
  hardened, automatic updates configured, fail2ban installed, and unnecessary
  services disabled.
difficulty: beginner
globs:
  - '**/sshd_config'
  - '**/ufw/**'
  - '**/*.sh'
tags:
  - baseline
  - security
  - hardening
  - checklist
  - server-setup
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
  - question: What is the minimum security baseline for an Ubuntu server?
    answer: >-
      Five essentials: (1) UFW firewall with default deny. (2) SSH hardened (no
      root login, no password auth, key-only). (3) Automatic security updates
      enabled. (4) Fail2ban installed for brute force protection. (5)
      Unnecessary services disabled. This blocks the most common attack vectors.
  - question: How do I verify an Ubuntu server meets security baseline?
    answer: >-
      Check: ufw status (active with rules), grep PermitRootLogin
      /etc/ssh/sshd_config (no), systemctl is-active fail2ban (active),
      systemctl is-active unattended-upgrades (active). Automate with a
      verification script run after every deployment.
relatedItems:
  - ubuntu-server-architect
  - ubuntu-ufw-management
  - linux-security-hardening
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Ubuntu Server Baseline Configuration

## Rule
Every Ubuntu server MUST pass this security baseline before being accessible from the internet.

## Format
Checklist to be verified on every new server deployment.

## Requirements

### 1. System Updates
```bash
# All packages current
sudo apt update && sudo apt upgrade -y

# Automatic security updates enabled
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Verify
systemctl is-active unattended-upgrades  # Should be "active"
```

### 2. UFW Firewall
```bash
# Default deny incoming
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow only required ports
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Verify
sudo ufw status  # Should show active with specific rules
```

### 3. SSH Hardening
```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowTcpForwarding no

sudo systemctl restart sshd
```

### 4. Fail2ban
```bash
sudo apt install fail2ban
sudo systemctl enable --now fail2ban

# Verify
sudo fail2ban-client status sshd
```

### 5. Disable Unnecessary Services
```bash
# List running services
systemctl list-units --type=service --state=running

# Disable unused services
sudo systemctl disable --now cups
sudo systemctl disable --now avahi-daemon
sudo systemctl disable --now bluetooth
```

## Verification Script
```bash
#!/usr/bin/env bash
set -euo pipefail

echo "=== Ubuntu Server Baseline Check ==="
echo "UFW: $(sudo ufw status | head -1)"
echo "SSH root: $(grep ^PermitRootLogin /etc/ssh/sshd_config)"
echo "SSH password: $(grep ^PasswordAuthentication /etc/ssh/sshd_config)"
echo "Fail2ban: $(systemctl is-active fail2ban)"
echo "Auto-updates: $(systemctl is-active unattended-upgrades)"
echo "Reboot needed: $([ -f /var/run/reboot-required ] && echo 'YES' || echo 'no')"
```

## Anti-Patterns
- Deploying servers without a firewall
- SSH with password auth enabled
- Root login via SSH
- No automatic security updates
- Running unnecessary services (cups, bluetooth on servers)

## Enforcement
Run the verification script after every deployment. Add to infrastructure-as-code templates (Ansible, Terraform).
