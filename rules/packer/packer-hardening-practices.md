---
id: packer-hardening-practices
stackId: packer
type: rule
name: Image Hardening Best Practices
description: >-
  Build secure machine images with Packer — apply CIS benchmarks, remove SSH
  keys, clean package caches, disable unnecessary services, and validate with
  security scanners.
difficulty: intermediate
globs:
  - '**/*.pkr.hcl'
  - '**/scripts/*.sh'
  - '**/packer/**'
tags:
  - hardening
  - security
  - cis-benchmarks
  - cleanup
  - ssh-keys
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
  - question: Why is image hardening important in Packer builds?
    answer: >-
      Machine images are the foundation of your infrastructure. An unhardened
      image with default passwords, build SSH keys, or unnecessary services
      becomes a security vulnerability replicated across every instance launched
      from it. Hardening once in Packer prevents security drift across your
      fleet.
  - question: Why must cleanup scripts run last in Packer provisioners?
    answer: >-
      The cleanup script removes SSH authorized_keys, temp files, package
      caches, and shell history. If any provisioner runs after cleanup, it may
      recreate temp files or re-add SSH keys. Always make cleanup the final
      provisioner step to ensure the published image is clean.
relatedItems:
  - packer-template-conventions
  - packer-provisioner-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Image Hardening Best Practices

## Rule
All Packer-built images MUST include a hardening provisioner step. Clean up build artifacts, remove SSH keys, disable root login, and validate against CIS benchmarks before publishing.

## Hardening Checklist
| Step | Purpose | Priority |
|------|---------|----------|
| Remove SSH authorized_keys | Prevent build key persistence | Critical |
| Clean package manager cache | Reduce image size | High |
| Remove temp files | No build artifacts in image | High |
| Disable root SSH | Security hardening | Critical |
| Update packages | Patch vulnerabilities | Critical |
| Remove unnecessary packages | Reduce attack surface | Medium |
| Configure firewall | Default-deny rules | High |

## Good Examples
```bash
#!/usr/bin/env bash
# scripts/harden.sh
set -euo pipefail

echo "=== Security Hardening ==="

# Update all packages
sudo apt-get update && sudo apt-get upgrade -y

# Remove unnecessary packages
sudo apt-get purge -y telnet ftp
sudo apt-get autoremove -y

# Disable root SSH login
sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config

# Set secure file permissions
sudo chmod 600 /etc/ssh/sshd_config
sudo chmod 700 /root

# Configure basic firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw --force enable
```

```bash
#!/usr/bin/env bash
# scripts/cleanup.sh — MUST run last
set -euo pipefail

echo "=== Cleanup ==="

# Remove SSH keys from build
sudo rm -f /home/*/.ssh/authorized_keys
sudo rm -f /root/.ssh/authorized_keys

# Clean package cache
sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*

# Remove temp and log files
sudo rm -rf /tmp/* /var/tmp/*
sudo find /var/log -type f -exec truncate --size=0 {} \;

# Clear shell history
history -c
cat /dev/null > ~/.bash_history
```

## Bad Examples
```hcl
# BAD: No cleanup — build SSH key persists in image
build {
  sources = ["source.amazon-ebs.base"]
  provisioner "shell" {
    inline = ["sudo apt-get install -y nginx"]
  }
  # No hardening, no cleanup!
}
```

## Enforcement
- Always run cleanup.sh as the LAST provisioner
- Scan images with CIS benchmarks: `cis-cat-pro`
- Vulnerability scan: `trivy image` or AWS Inspector
- Verify no SSH keys remain in published images
