---
id: sshgpg-config-structure
stackId: sshgpg
type: rule
name: SSH Config File Structure
description: >-
  Standards for ~/.ssh/config organization — section ordering, wildcard
  placement, required Host * defaults, IdentitiesOnly enforcement, and
  security-first settings.
difficulty: intermediate
globs:
  - '**/.ssh/config'
  - '**/ssh_config'
tags:
  - ssh-config
  - organization
  - security
  - structure
  - best-practices
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
  - question: Why must specific SSH hosts come before wildcards?
    answer: >-
      SSH config uses first-match wins for each setting. If Host * appears first
      with certain settings, specific Host blocks can only add settings, not
      override them. Always put specific hosts first, then pattern matches, then
      Host * defaults last.
  - question: Why should I use IdentitiesOnly in SSH config?
    answer: >-
      Without IdentitiesOnly, SSH tries every key in your agent for every host.
      With many keys, you'll hit MaxAuthTries limits and get locked out.
      IdentitiesOnly yes tells SSH to only use the key specified in IdentityFile
      for that host.
relatedItems:
  - sshgpg-key-standards
  - sshgpg-ssh-config
  - sshgpg-key-management
version: 1.0.0
lastUpdated: '2026-03-11'
---

# SSH Config File Structure

## Rule
SSH config files MUST have specific hosts before wildcards, include security defaults in Host *, use IdentitiesOnly, and organize by host category.

## Format
```bash
# ~/.ssh/config — Organized in this order:

# ─── Service Hosts ─────────────────────────────────
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_ed25519
  IdentitiesOnly yes

Host gitlab.com
  HostName gitlab.com
  User git
  IdentityFile ~/.ssh/gitlab_ed25519
  IdentitiesOnly yes

# ─── Work Infrastructure ──────────────────────────
Host bastion
  HostName bastion.work.com
  User admin
  IdentityFile ~/.ssh/work_ed25519
  IdentitiesOnly yes

Host work-*
  ProxyJump bastion
  User admin
  IdentityFile ~/.ssh/work_ed25519

# ─── Personal Servers ─────────────────────────────
Host homelab
  HostName 192.168.1.100
  User pi
  IdentityFile ~/.ssh/personal_ed25519

# ─── Default Settings (MUST BE LAST) ──────────────
Host *
  AddKeysToAgent yes
  IdentitiesOnly yes
  ServerAliveInterval 60
  ServerAliveCountMax 3
  ControlMaster auto
  ControlPath ~/.ssh/sockets/%r@%h-%p
  ControlPersist 600
  HashKnownHosts yes
```

## Requirements
1. **Specific hosts before wildcards** — first match wins
2. **IdentitiesOnly yes** — prevents trying all keys
3. **Host * at the bottom** — default settings for all hosts
4. **Section comments** — organize by category
5. **No ForwardAgent in Host *** — only on trusted hosts

## Good
```bash
Host github.com
  IdentityFile ~/.ssh/github_ed25519
  IdentitiesOnly yes
# Specific host, specific key, no other keys tried
```

## Bad
```bash
Host *
  ForwardAgent yes  # DANGEROUS: forwards agent everywhere

Host github.com
  IdentityFile ~/.ssh/github_ed25519
# Wildcard before specific host — settings may conflict
```
