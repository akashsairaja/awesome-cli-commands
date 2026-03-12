---
id: sshgpg-key-standards
stackId: sshgpg
type: rule
name: SSH Key Generation Standards
description: >-
  Enforce Ed25519 key generation, passphrase requirements, per-device key
  policy, naming conventions, and proper file permissions for SSH key
  management.
difficulty: beginner
globs:
  - '**/.ssh/**'
  - '**/ssh_config'
  - '**/sshd_config'
tags:
  - ssh-keys
  - ed25519
  - key-generation
  - permissions
  - security
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - zed
faq:
  - question: Why should I use Ed25519 over RSA for SSH keys?
    answer: >-
      Ed25519 provides equivalent or better security than RSA-4096 with much
      smaller keys (68 chars vs 544 chars public key). It's faster for
      authentication, resistant to side-channel attacks, and is the recommended
      algorithm by OpenSSH, GitHub, and GitLab.
  - question: Why must SSH private keys have a passphrase?
    answer: >-
      Without a passphrase, anyone who gains access to your private key file
      (stolen laptop, compromised backup, accidental exposure) can impersonate
      you on every server. A passphrase encrypts the key at rest. Use ssh-agent
      to cache it in memory so you only type it once.
relatedItems:
  - sshgpg-key-management
  - sshgpg-ssh-config
  - sshgpg-config-structure
version: 1.0.0
lastUpdated: '2026-03-11'
---

# SSH Key Generation Standards

## Rule
All SSH keys MUST use Ed25519 algorithm, include passphrases, follow one-key-per-device policy, and use descriptive filenames with correct permissions.

## Format
```bash
# Required key generation command
ssh-keygen -t ed25519 -C "user@device-YYYY" -f ~/.ssh/purpose_ed25519
```

## Requirements

### Algorithm
```bash
# Good: Ed25519 (modern, secure, fast)
ssh-keygen -t ed25519

# Acceptable: RSA 4096 (legacy compatibility only)
ssh-keygen -t rsa -b 4096

# Bad: RSA 2048, DSA, ECDSA
ssh-keygen -t rsa -b 2048  # Too short
ssh-keygen -t dsa           # Deprecated
```

### Passphrase
- Every private key MUST have a passphrase
- Use ssh-agent or Keychain for caching
- Never generate keys with empty passphrase

### Naming Convention
```bash
~/.ssh/github_ed25519        # Service-specific
~/.ssh/work_ed25519          # Organization-specific
~/.ssh/personal_ed25519      # Personal servers
~/.ssh/deploy_ed25519        # CI/CD (no passphrase exception)
```

### File Permissions
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/*_ed25519       # Private keys
chmod 644 ~/.ssh/*.pub           # Public keys
chmod 600 ~/.ssh/config          # SSH config
chmod 600 ~/.ssh/authorized_keys # If present
```

### Key Comment
```bash
# Good: identifies owner and device
ssh-keygen -t ed25519 -C "alice@macbook-2026"
ssh-keygen -t ed25519 -C "alice@work-desktop"

# Bad: default comment or empty
ssh-keygen -t ed25519  # Default: user@hostname (not portable)
```

## Good
```bash
ssh-keygen -t ed25519 -C "alice@macbook-2026" -f ~/.ssh/github_ed25519
# Prompted for passphrase → enters strong passphrase
chmod 600 ~/.ssh/github_ed25519
```

## Bad
```bash
ssh-keygen  # Defaults to RSA, default filename, no comment
# Passphrase: (empty) → NO!
```
