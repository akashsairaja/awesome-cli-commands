---
id: packer-provisioner-scripts
stackId: packer
type: skill
name: Packer Shell Provisioner Patterns
description: >-
  Write effective Packer shell provisioners — idempotent scripts, environment
  variables, error handling, multi-step installations, and cleaning up images
  for production deployment.
difficulty: intermediate
tags:
  - shell
  - provisioners
  - scripts
  - cleanup
  - idempotent
  - installation
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Packer CLI installed
  - Bash scripting knowledge
faq:
  - question: Why does my Packer shell provisioner fail with apt-get?
    answer: >-
      Most likely cloud-init is still running and holds the apt lock. Add
      'cloud-init status --wait || true' before apt commands. Also set
      DEBIAN_FRONTEND=noninteractive and use -y flag. Check for missing sudo
      (provisioner runs as non-root by default).
  - question: What should I clean up in a Packer image?
    answer: >-
      Essential cleanup: apt cache (apt-get clean), SSH host keys (regenerated
      on boot), authorized_keys, shell history, temp files, log files. Optional:
      zero free space with dd (smaller image). Never leave secrets, API tokens,
      or build credentials in the image.
  - question: How do I make Packer shell scripts idempotent?
    answer: >-
      Check before acting: [ -f /etc/app.conf ] || create_config. Use package
      manager's built-in idempotency (apt install is already idempotent). Use
      systemctl enable (idempotent) over manual init.d scripts. Test by running
      the build twice — second run should succeed without changes.
relatedItems:
  - packer-hcl2-templates
  - packer-cicd-pipeline
  - packer-provisioner-chains
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Packer Shell Provisioner Patterns

## Overview
Shell provisioners are the most common way to configure Packer images. Write idempotent, well-structured scripts that install software, configure services, and clean up for production-ready images.

## Why This Matters
- **Reliability** — idempotent scripts work on rebuild
- **Security** — proper cleanup removes sensitive data
- **Debugging** — structured scripts are easier to troubleshoot
- **Speed** — efficient script ordering minimizes build time

## How It Works

### Step 1: Inline vs Script Provisioners
```bash
# Inline — for short commands
# provisioner "shell" {
#   inline = [
#     "sudo apt-get update -y",
#     "sudo apt-get upgrade -y",
#     "sudo apt-get install -y curl wget git"
#   ]
# }

# Script file — for complex setup
# provisioner "shell" {
#   script = "scripts/install-app.sh"
#   environment_vars = [
#     "APP_VERSION=${var.version}",
#     "DEBIAN_FRONTEND=noninteractive"
#   ]
# }

# Multiple scripts in order
# provisioner "shell" {
#   scripts = [
#     "scripts/01-system-update.sh",
#     "scripts/02-install-deps.sh",
#     "scripts/03-configure-app.sh",
#     "scripts/99-cleanup.sh"
#   ]
# }
```

### Step 2: Robust Script Patterns
```bash
# scripts/install-app.sh
#!/bin/bash
set -euo pipefail

echo "=== Installing application v${APP_VERSION} ==="

# Wait for cloud-init to finish
cloud-init status --wait || true

# Install dependencies
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sudo apt-get install -y --no-install-recommends \
  nginx \
  certbot \
  python3-certbot-nginx

# Configure service
sudo systemctl enable nginx
sudo systemctl start nginx

# Verify installation
nginx -v
echo "=== Application installed successfully ==="
```

### Step 3: Environment Variables & Secrets
```bash
# Pass build-time variables
# provisioner "shell" {
#   environment_vars = [
#     "APP_VERSION=${var.version}",
#     "DB_HOST=${var.db_host}",
#     "DEBIAN_FRONTEND=noninteractive"
#   ]
#   script = "scripts/configure.sh"
# }

# Use Vault for secrets
# provisioner "shell" {
#   inline = [
#     "export DB_PASS=$(vault kv get -field=password secret/db)",
#     "configure-app --db-pass=$DB_PASS",
#     "unset DB_PASS"
#   ]
# }
```

### Step 4: Cleanup Script
```bash
# scripts/99-cleanup.sh — always run last
#!/bin/bash
set -euo pipefail

echo "=== Cleaning up image ==="

# Remove package cache
sudo apt-get clean
sudo apt-get autoremove -y
sudo rm -rf /var/lib/apt/lists/*

# Remove SSH keys (regenerated on first boot)
sudo rm -f /etc/ssh/ssh_host_*
sudo rm -f /home/*/.ssh/authorized_keys
sudo rm -f /root/.ssh/authorized_keys

# Clear logs
sudo truncate -s 0 /var/log/*.log
sudo truncate -s 0 /var/log/**/*.log 2>/dev/null || true
sudo journalctl --vacuum-time=1s

# Clear temp files
sudo rm -rf /tmp/* /var/tmp/*

# Clear shell history
unset HISTFILE
sudo rm -f /root/.bash_history
rm -f ~/.bash_history

# Zero free space (smaller image)
sudo dd if=/dev/zero of=/EMPTY bs=1M 2>/dev/null || true
sudo rm -f /EMPTY

echo "=== Cleanup complete ==="
```

## Best Practices
- Start scripts with set -euo pipefail (fail on any error)
- Number scripts for clear execution order (01-, 02-, 99-)
- Set DEBIAN_FRONTEND=noninteractive for apt
- Wait for cloud-init before installing packages
- Always end with a cleanup script
- Verify installations with version checks

## Common Mistakes
- No set -euo pipefail (errors silently ignored)
- No cleanup provisioner (images contain secrets and cache)
- Interactive prompts (apt-get without -y, missing DEBIAN_FRONTEND)
- Not waiting for cloud-init (package manager locked)
- Inline scripts longer than 5 lines (use script files instead)
