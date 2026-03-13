---
id: ubuntu-ufw-management
stackId: ubuntu
type: skill
name: Ubuntu UFW Firewall Configuration
description: >-
  Configure Ubuntu's UFW firewall — enable default deny, allow specific ports
  and services, create application profiles, rate limiting, and logging for
  production server security.
difficulty: advanced
tags:
  - ubuntu
  - ufw
  - firewall
  - configuration
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
  - question: "When should I use the Ubuntu UFW Firewall Configuration skill?"
    answer: >-
      Configure Ubuntu's UFW firewall — enable default deny, allow specific
      ports and services, create application profiles, rate limiting, and
      logging for production server security. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Ubuntu UFW Firewall Configuration require?"
    answer: >-
      Works with standard ubuntu tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Ubuntu UFW Firewall Configuration

## Overview
UFW (Uncomplicated Firewall) is Ubuntu's default firewall management tool. It provides a simple interface to iptables/nftables for managing network access rules. Every production Ubuntu server should have UFW enabled with a default deny policy.

## Why This Matters
- An unprotected server is scanned within minutes of going online
- Default deny blocks all unexpected traffic automatically
- UFW makes firewall management accessible without iptables expertise

## Configuration

### Step 1: Set Default Policies
```bash
# Default deny incoming, allow outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Check status
sudo ufw status verbose
```

### Step 2: Allow Essential Services
```bash
# SSH (CRITICAL: do this BEFORE enabling UFW)
sudo ufw allow ssh         # Port 22
sudo ufw allow 2222/tcp    # Custom SSH port

# Web server
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 'Nginx Full'  # UFW app profile (80 + 443)

# Application ports
sudo ufw allow 3000/tcp    # Node.js app
sudo ufw allow 5432/tcp    # PostgreSQL (from specific IP only — see below)
```

### Step 3: Restrict by Source IP
```bash
# Allow database access only from application server
sudo ufw allow from 10.0.1.5 to any port 5432

# Allow SSH only from office IP
sudo ufw allow from 203.0.113.0/24 to any port 22

# Allow Redis only from localhost
sudo ufw allow from 127.0.0.1 to any port 6379
```

### Step 4: Rate Limiting for SSH
```bash
# Limit SSH connection attempts (blocks IPs with > 6 connections in 30s)
sudo ufw limit ssh

# This is a basic DDoS protection — use fail2ban for more control
```

### Step 5: Enable UFW
```bash
# IMPORTANT: Ensure SSH is allowed before enabling!
sudo ufw enable

# Verify rules
sudo ufw status numbered

# Enable logging
sudo ufw logging medium
# Logs to /var/log/ufw.log
```

### Managing Rules
```bash
# List rules with numbers
sudo ufw status numbered

# Delete a rule by number
sudo ufw delete 3

# Delete a rule by specification
sudo ufw delete allow 3000/tcp

# Insert a rule at a specific position
sudo ufw insert 1 deny from 192.168.1.100

# Reset all rules (start fresh)
sudo ufw reset
```

## Best Practices
- ALWAYS allow SSH before enabling UFW (or you lock yourself out)
- Use default deny incoming — whitelist only what you need
- Restrict database ports to specific source IPs
- Use UFW application profiles (ufw app list) when available
- Enable logging to detect scanning attempts
- Use rate limiting on SSH to slow brute force attacks
- Test rules on staging before applying to production

## Common Mistakes
- Enabling UFW without allowing SSH first (locked out of server)
- Allowing 0.0.0.0/0 access to database ports (should be specific IPs)
- Not enabling UFW at all (relying on "security through obscurity")
- Forgetting to open ports after deploying new services
- Using allow instead of limit for SSH (no brute force protection)
