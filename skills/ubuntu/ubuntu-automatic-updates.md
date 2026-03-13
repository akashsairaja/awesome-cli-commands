---
id: ubuntu-automatic-updates
stackId: ubuntu
type: skill
name: Ubuntu Automatic Security Updates
description: >-
  Configure unattended-upgrades on Ubuntu — automatic security patches, email
  notifications, reboot scheduling, needrestart integration, package
  blacklisting, Livepatch for rebootless kernel updates, and monitoring.
difficulty: advanced
tags:
  - ubuntu
  - automatic
  - security
  - updates
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
  - question: "When should I use the Ubuntu Automatic Security Updates skill?"
    answer: >-
      Configure unattended-upgrades on every Ubuntu server to automatically
      apply security patches. This closes the window between vulnerability
      disclosure and patching — the number one cause of breaches from known
      CVEs. Covers email alerts, reboot scheduling, needrestart, Livepatch,
      and package blacklisting.
  - question: "What tools and setup does Ubuntu Automatic Security Updates require?"
    answer: >-
      Requires Ubuntu 20.04+ with root/sudo access. The unattended-upgrades
      package is pre-installed on Ubuntu Server. Optional: needrestart for
      automatic service restarts, mailutils for email notifications, and an
      Ubuntu Pro subscription for Livepatch kernel patching.
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# Ubuntu Automatic Security Updates

## Overview

unattended-upgrades automatically installs security patches on Ubuntu servers. It is the single most effective defense against known vulnerabilities. Most breaches exploit known, patched CVEs — automatic updates close the exposure window from weeks to hours. Every Ubuntu server should have this enabled, no exceptions.

## Install and Enable

```bash
# Install (usually pre-installed on Ubuntu Server)
sudo apt install unattended-upgrades apt-listchanges needrestart

# Enable automatic updates interactively
sudo dpkg-reconfigure -plow unattended-upgrades

# Or enable non-interactively
echo 'APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";' | \
  sudo tee /etc/apt/apt.conf.d/20auto-upgrades
```

The `dpkg-reconfigure` command creates `/etc/apt/apt.conf.d/20auto-upgrades` with the periodic update settings. On fresh Ubuntu Server installations, this is typically already enabled.

## Configure Update Sources

Edit `/etc/apt/apt.conf.d/50unattended-upgrades` to control which repositories are included:

```bash
Unattended-Upgrade::Allowed-Origins {
    // Security updates (always enable these)
    "${distro_id}:${distro_codename}-security";

    // Extended Security Maintenance (Ubuntu Pro)
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";

    // Uncomment for all stable updates (not just security):
    // "${distro_id}:${distro_codename}-updates";
};
```

The `${distro_id}` and `${distro_codename}` variables expand automatically (e.g., `Ubuntu:noble-security` on 24.04). Keep `-updates` commented unless you have tested non-security updates on staging first — they can introduce behavioral changes.

## Package Blacklisting

Some packages should never be auto-updated because upgrades can break compatibility or require data migration:

```bash
Unattended-Upgrade::Package-Blacklist {
    // Databases — always test upgrades manually
    "postgresql*";
    "mysql*";
    "mongodb*";
    "redis-server";

    // Runtimes with potential breaking changes
    "nodejs";
    "php8*";

    // Container runtime — coordinate with orchestrator
    "docker-ce";
    "containerd.io";
};
```

The blacklist uses fnmatch patterns. Blacklisted packages still receive security advisories — you must patch them manually during maintenance windows. The goal is controlled upgrades, not skipped upgrades.

## Email Notifications

```bash
# Install mail utilities
sudo apt install mailutils

# Configure in 50unattended-upgrades
Unattended-Upgrade::Mail "ops-team@example.com";

# Options: "always", "only-on-error", "on-change"
Unattended-Upgrade::MailReport "on-change";
```

Use `"on-change"` for production servers — you get notified when packages are actually updated or when errors occur, without daily noise from "nothing to do" reports.

## Automatic Reboot Configuration

Kernel updates, glibc updates, and some system library patches require a reboot to take effect. Without a scheduled reboot, these patches sit dormant and the system remains vulnerable:

```bash
# Enable automatic reboot when required
Unattended-Upgrade::Automatic-Reboot "true";

# Schedule reboot during maintenance window
Unattended-Upgrade::Automatic-Reboot-Time "03:00";

# Reboot even if users are logged in (production servers)
Unattended-Upgrade::Automatic-Reboot-WithUsers "true";
```

For high-availability setups, coordinate reboots with your load balancer. Drain the node before reboot and verify health after. Do not enable automatic reboot on all nodes simultaneously — stagger maintenance windows.

## Needrestart: Service-Level Restarts

The `needrestart` package detects services using outdated libraries and restarts them without a full reboot. This covers the majority of patches that would otherwise require a reboot:

```bash
# Install needrestart (included in earlier install command)
sudo apt install needrestart

# Configure automatic restarts
sudo sed -i 's/#$nrconf{restart} = '"'"'i'"'"';/$nrconf{restart} = '"'"'a'"'"';/' \
  /etc/needrestart/needrestart.conf
```

The restart mode options:
- `'i'` — interactive (default, asks before restarting)
- `'a'` — automatic (restarts services without asking)
- `'l'` — list only (shows what needs restarting)

Set `'a'` on servers where you want fully automated patching. On critical production nodes, use `'l'` and handle restarts during maintenance windows.

```bash
# Check which services need restarting (without acting)
sudo needrestart -r l

# Manually trigger needrestart after apt upgrades
sudo needrestart
```

## Livepatch: Rebootless Kernel Patching

Ubuntu Livepatch applies critical and high-severity kernel CVE fixes without rebooting. This is essential for servers with strict uptime requirements:

```bash
# Requires Ubuntu Pro (free for up to 5 machines)
sudo pro attach <your-token>

# Enable Livepatch
sudo pro enable livepatch

# Check Livepatch status
canonical-livepatch status --verbose
```

Livepatch patches the running kernel in memory. It covers critical and high CVEs — lower severity patches still require a traditional reboot. Use Livepatch to extend the window between reboots, not to eliminate them entirely.

## Full Update Schedule Configuration

```bash
# /etc/apt/apt.conf.d/20auto-upgrades
APT::Periodic::Update-Package-Lists "1";          // Daily apt update
APT::Periodic::Unattended-Upgrade "1";             // Daily upgrade check
APT::Periodic::Download-Upgradeable-Packages "1";  // Pre-download packages
APT::Periodic::AutocleanInterval "7";              // Clean cache weekly
```

The `Download-Upgradeable-Packages` setting pre-downloads packages during the update check. This means the actual upgrade step only needs to install — reducing the window where a partially-downloaded state could cause issues.

## Cleanup and Maintenance

```bash
# Remove unused dependencies after upgrades
Unattended-Upgrade::Remove-Unused-Dependencies "true";

# Remove unused kernel packages (frees /boot space)
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";

# Remove new unused dependencies (installed as part of upgrades)
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
```

Enabling all three cleanup options prevents `/boot` from filling up with old kernels — a common cause of failed future upgrades.

## Monitoring and Verification

```bash
# Check service status
systemctl status unattended-upgrades

# View the upgrade log
sudo cat /var/log/unattended-upgrades/unattended-upgrades.log

# Dry run — see what would be upgraded
sudo unattended-upgrades --dry-run --debug

# Check pending upgradable packages
apt list --upgradable

# Verify last successful update timestamp
stat /var/lib/apt/periodic/update-success-stamp

# Check if a reboot is required
cat /var/run/reboot-required 2>/dev/null && echo "Reboot needed" || echo "No reboot needed"

# See which packages triggered the reboot requirement
cat /var/run/reboot-required.pkgs 2>/dev/null
```

## Complete Production Configuration

Here is a battle-tested `/etc/apt/apt.conf.d/50unattended-upgrades` for production:

```bash
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::Package-Blacklist {
    "postgresql*";
    "mysql*";
    "docker-ce";
};

Unattended-Upgrade::Mail "ops-team@example.com";
Unattended-Upgrade::MailReport "on-change";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
Unattended-Upgrade::Automatic-Reboot-WithUsers "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::SyslogEnable "true";
```

## Best Practices

- Enable security updates on every server — no exceptions. This is the single highest-impact security measure.
- Blacklist databases and container runtimes — test their upgrades manually in staging first.
- Enable automatic reboot during off-peak hours. Kernel patches without reboot are security theater.
- Configure needrestart in automatic mode for non-critical services. Most patches take effect via service restart, not reboot.
- Use Livepatch on servers with strict uptime SLAs to bridge the gap between maintenance windows.
- Monitor `/var/log/unattended-upgrades/` and set up alerts for failed updates.
- Test the same update sources on staging before applying to production.
- Enable all cleanup options to prevent `/boot` from filling up with old kernels.

## Common Pitfalls

- Not enabling automatic updates at all — the most common security failure on Ubuntu servers.
- Auto-updating databases without testing — major version bumps can break schema compatibility.
- Not scheduling reboots — kernel patches require reboot; without it, the old vulnerable kernel stays loaded.
- Not monitoring for failures — silent update failures leave vulnerabilities open for weeks.
- Blacklisting too many packages — defeats the purpose. Only blacklist what genuinely needs manual testing.
- Forgetting to clean old kernels — `/boot` fills up, future updates fail, server becomes unpatched.
