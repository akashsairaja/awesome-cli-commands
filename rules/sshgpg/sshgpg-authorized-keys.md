---
id: sshgpg-authorized-keys
stackId: sshgpg
type: rule
name: authorized_keys Security Standards
description: >-
  Standards for managing authorized_keys files — key restrictions, command
  forcing, environment options, source IP limits, and regular audit
  requirements.
difficulty: advanced
globs:
  - '**/.ssh/authorized_keys'
  - '**/authorized_keys'
tags:
  - authorized-keys
  - access-control
  - restrictions
  - security
  - audit
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: How do I restrict an SSH key to only run specific commands?
    answer: >-
      Prefix the key in authorized_keys with
      'restrict,command="/path/to/script"'. The 'restrict' keyword disables all
      forwarding and PTY access. The 'command' option forces that specific
      command regardless of what the client requests. This is essential for
      CI/CD deploy keys.
  - question: How do I limit SSH access by IP address?
    answer: >-
      Add 'from="IP/CIDR"' before the key in authorized_keys. For example:
      'from="10.0.0.0/8,192.168.1.0/24" ssh-ed25519 AAAA...'. Connections from
      other IPs will be rejected even with the correct private key.
relatedItems:
  - sshgpg-key-standards
  - sshgpg-server-hardening
  - sshgpg-key-management
version: 1.0.0
lastUpdated: '2026-03-11'
---

# authorized_keys Security Standards

## Rule
All authorized_keys entries MUST use restrict options for service accounts, enforce source IP limits for sensitive servers, and be audited quarterly.

## Format
```bash
# Standard user key (minimal)
ssh-ed25519 AAAA... user@device-2026

# Restricted service account
restrict,command="/usr/local/bin/backup.sh" ssh-ed25519 AAAA... backup@server

# IP-restricted access
from="10.0.0.0/8,192.168.1.0/24" ssh-ed25519 AAAA... admin@office
```

## Restriction Options
```bash
# Full restrictions (recommended for service accounts)
restrict,command="/path/to/script" ssh-ed25519 AAAA... deploy@ci

# This enforces:
# - no-agent-forwarding
# - no-port-forwarding
# - no-pty (no interactive shell)
# - no-X11-forwarding
# - no-user-rc
# Plus: only the specified command can run
```

## Examples

### CI/CD Deploy Key
```bash
# Can only run deploy script, no interactive access
restrict,command="/opt/deploy/run.sh" ssh-ed25519 AAAA... deploy@github-actions
```

### Backup Service
```bash
# Can only run rsync, limited to specific IP
from="10.0.1.5",restrict,command="/usr/bin/rsync --server" ssh-ed25519 AAAA... backup@nas
```

### Developer Access
```bash
# Full access but from office IP range only
from="203.0.113.0/24" ssh-ed25519 AAAA... developer@laptop-2026
```

## Audit Requirements
```bash
# Quarterly review script
#!/bin/bash
echo "=== authorized_keys audit ==="
for user_home in /home/*; do
  auth_file="$user_home/.ssh/authorized_keys"
  if [[ -f "$auth_file" ]]; then
    echo "--- $(basename "$user_home") ---"
    grep -c "" "$auth_file"  # Count keys
    grep -v "restrict" "$auth_file"  # Flag unrestricted keys
  fi
done
```

## Good
```bash
restrict,command="/opt/deploy/run.sh",from="10.0.0.0/8" ssh-ed25519 AAAA...
```

## Bad
```bash
ssh-rsa AAAA... root@server  # No restrictions, RSA, root access
```
