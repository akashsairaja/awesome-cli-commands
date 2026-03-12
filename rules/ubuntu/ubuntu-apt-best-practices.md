---
id: ubuntu-apt-best-practices
stackId: ubuntu
type: rule
name: Ubuntu apt Package Management Rules
description: >-
  Enforce safe apt practices — always update before install, pin critical
  packages, use official repositories, clean up unused dependencies, and verify
  package authenticity.
difficulty: beginner
globs:
  - '**/*.sh'
  - '**/apt/**'
  - '**/sources.list*'
tags:
  - apt
  - package-management
  - versioning
  - repositories
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
  - tabnine
  - zed
faq:
  - question: Why should I always run apt update before apt install?
    answer: >-
      apt install uses a local cache of package metadata. Without running apt
      update first, the cache may be stale — pointing to old versions or
      unavailable packages. apt update fetches the latest package lists from all
      configured repositories, ensuring you install the correct and current
      version.
  - question: How do I prevent a specific package from being upgraded on Ubuntu?
    answer: >-
      Use apt-mark hold: 'sudo apt-mark hold postgresql-16'. This prevents the
      package from being upgraded by apt upgrade. Check held packages with
      'apt-mark showhold'. Remove the hold with 'apt-mark unhold'. Also exclude
      in unattended-upgrades config for automatic updates.
relatedItems:
  - ubuntu-package-manager
  - ubuntu-automatic-updates
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Ubuntu apt Package Management Rules

## Rule
All package operations MUST follow safe practices: update before install, verify sources, pin critical versions, and clean up unused packages.

## Format
```bash
sudo apt update && sudo apt install <package>
```

## Requirements

### 1. Always Update Package Lists First
```bash
# GOOD: Update then install
sudo apt update
sudo apt install nginx

# BAD: Install without update (may get old version or fail)
sudo apt install nginx
```

### 2. Pin Critical Package Versions
```bash
# Hold packages that should not auto-upgrade
sudo apt-mark hold postgresql-16
sudo apt-mark hold nodejs

# View held packages
apt-mark showhold

# Unhold when ready to upgrade
sudo apt-mark unhold postgresql-16
```

### 3. Use Official Sources Only
```bash
# GOOD: Official Ubuntu repository
sudo apt install nginx

# GOOD: Vendor-maintained repository (e.g., NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# CAUTION: Third-party PPAs (verify trust)
sudo add-apt-repository ppa:example/ppa  # Review before adding

# BAD: Random .deb from the internet
wget https://sketchy-site.com/tool.deb && sudo dpkg -i tool.deb
```

### 4. Clean Up Regularly
```bash
# Remove unused dependencies
sudo apt autoremove

# Clean download cache
sudo apt clean

# Remove old config files from removed packages
sudo apt purge $(dpkg -l | grep '^rc' | awk '{print $2}')
```

### 5. Review Before Upgrading
```bash
# Check what will be upgraded
apt list --upgradable

# Simulate upgrade (dry run)
sudo apt upgrade --dry-run

# Upgrade specific package only
sudo apt install --only-upgrade nginx
```

## Anti-Patterns
- Installing without apt update (stale package lists)
- Running apt upgrade blindly on production (review first)
- Adding untrusted PPAs (supply chain risk)
- Not pinning database/runtime versions (unexpected upgrades)
- Leaving unused packages installed (attack surface + disk usage)
- Using dpkg -i without dependency resolution

## Enforcement
Document approved package sources. Pin all critical packages. Include apt autoremove in monthly maintenance.
