---
id: ubuntu-automatic-updates
stackId: ubuntu
type: skill
name: Ubuntu Automatic Security Updates
description: >-
  Configure unattended-upgrades on Ubuntu — automatic security patches, email
  notifications, reboot scheduling, blacklist specific packages, and monitoring
  update status.
difficulty: beginner
tags:
  - unattended-upgrades
  - security-updates
  - apt
  - patching
  - automation
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
  - question: Should I enable automatic updates on production Ubuntu servers?
    answer: >-
      Yes, always enable automatic security updates. Most breaches exploit
      known, patched vulnerabilities. The risk of a security update breaking
      something is far lower than the risk of an unpatched vulnerability being
      exploited. Blacklist critical packages (databases, runtimes) and test
      those manually.
  - question: Do automatic updates require reboots on Ubuntu?
    answer: >-
      Most security updates don't require a reboot — services are restarted
      automatically. Kernel updates do require a reboot to take effect.
      Configure Automatic-Reboot in unattended-upgrades to reboot during
      maintenance windows. Check 'needs-restarting' or /var/run/reboot-required
      to see if a reboot is pending.
relatedItems:
  - ubuntu-server-architect
  - ubuntu-package-manager
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Ubuntu Automatic Security Updates

## Overview
unattended-upgrades automatically installs security patches on Ubuntu servers. It is the single most effective defense against known vulnerabilities. Most breaches exploit known, patched vulnerabilities — automatic updates close this window.

## Why This Matters
- Most attacks exploit known vulnerabilities that have patches available
- Manual patching creates a window of exposure between disclosure and update
- Automatic security updates reduce this window to hours instead of weeks

## Configuration

### Step 1: Install and Enable
```bash
# Install (usually pre-installed on Ubuntu Server)
sudo apt install unattended-upgrades apt-listchanges

# Enable automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Step 2: Configure Update Sources
```bash
# /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Allowed-Origins {
  "${distro_id}:${distro_codename}-security";
  "${distro_id}ESMApps:${distro_codename}-apps-security";
  "${distro_id}ESM:${distro_codename}-infra-security";
  // Uncomment for all updates (not just security):
  // "${distro_id}:${distro_codename}-updates";
};
```

### Step 3: Configure Blacklist and Email
```bash
# /etc/apt/apt.conf.d/50unattended-upgrades

# Don't auto-update these packages (manage manually)
Unattended-Upgrade::Package-Blacklist {
  "postgresql*";
  "mysql*";
  "mongodb*";
  "nodejs";
};

# Email notifications
Unattended-Upgrade::Mail "admin@example.com";
Unattended-Upgrade::MailReport "on-change";

# Automatic reboot (for kernel updates)
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";

# Remove unused dependencies
Unattended-Upgrade::Remove-Unused-Dependencies "true";
```

### Step 4: Configure Update Schedule
```bash
# /etc/apt/apt.conf.d/20auto-upgrades
APT::Periodic::Update-Package-Lists "1";        # Daily apt update
APT::Periodic::Unattended-Upgrade "1";           # Daily upgrade check
APT::Periodic::Download-Upgradeable-Packages "1"; # Pre-download
APT::Periodic::AutocleanInterval "7";             # Clean cache weekly
```

### Step 5: Monitor and Verify
```bash
# Check if unattended-upgrades is active
systemctl status unattended-upgrades

# View update log
cat /var/log/unattended-upgrades/unattended-upgrades.log

# Dry run — see what would be updated
sudo unattended-upgrades --dry-run --debug

# Check for pending updates
apt list --upgradable

# Verify last update time
stat /var/lib/apt/periodic/update-success-stamp
```

## Best Practices
- Enable security updates on every server — no exceptions
- Blacklist database and runtime packages (test upgrades manually)
- Enable automatic reboot during maintenance windows for kernel updates
- Set up email notifications to track what gets updated
- Monitor /var/log/unattended-upgrades/ for failures
- Test the same updates on staging before production auto-applies them

## Common Mistakes
- Not enabling automatic updates at all (most common security failure)
- Auto-updating database packages without testing (can break compatibility)
- Not scheduling automatic reboots (kernel updates need reboot to take effect)
- Not monitoring for failed updates (silent failures leave vulnerabilities open)
- Blacklisting too many packages (defeats the purpose)
