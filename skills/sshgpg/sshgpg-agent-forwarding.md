---
id: sshgpg-agent-forwarding
stackId: sshgpg
type: skill
name: SSH Agent Forwarding & Key Caching
description: >-
  Configure SSH agent for passphrase caching and secure agent forwarding —
  ssh-agent setup, keychain integration, forwarding to remote hosts, and
  security considerations.
difficulty: intermediate
tags:
  - ssh-agent
  - agent-forwarding
  - passphrase
  - keychain
  - security
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - SSH keys with passphrases
  - OpenSSH 7.3+
faq:
  - question: What is SSH agent forwarding?
    answer: >-
      SSH agent forwarding lets a remote server use your local SSH keys for
      authentication without copying private keys to the server. When you SSH to
      a bastion and then to an internal server, the internal server
      authenticates using your local key through the forwarded agent connection.
  - question: Is SSH agent forwarding secure?
    answer: >-
      It has risks — root on the remote server can hijack your agent socket.
      Only enable ForwardAgent for hosts you fully trust. Never use it in Host *
      wildcard. For most use cases, ProxyJump is a safer alternative that
      tunnels the connection without exposing your agent.
relatedItems:
  - sshgpg-ssh-config
  - sshgpg-key-management
  - sshgpg-gpg-signing
version: 1.0.0
lastUpdated: '2026-03-11'
---

# SSH Agent Forwarding & Key Caching

## Overview
The SSH agent caches your decrypted private keys in memory so you only type your passphrase once per session. Agent forwarding extends this to remote servers, letting you authenticate from a remote machine using your local keys without copying private keys to the server.

## Why This Matters
- **Type passphrase once** — agent caches decrypted keys in memory
- **No private keys on servers** — forward local agent instead
- **Seamless multi-hop** — authenticate through chains of servers
- **Git from remote** — push/pull on servers using local GitHub keys

## How It Works

### Step 1: Start SSH Agent
```bash
# macOS: auto-starts, add keys to Keychain
ssh-add --apple-use-keychain ~/.ssh/id_ed25519

# Linux: start agent in shell
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Auto-start in .zshrc
if [ -z "$SSH_AUTH_SOCK" ]; then
  eval "$(ssh-agent -s)" > /dev/null
fi
```

### Step 2: Configure AddKeysToAgent
```bash
# ~/.ssh/config — auto-add keys on first use
Host *
  AddKeysToAgent yes
  IdentitiesOnly yes

# macOS: integrate with Keychain
Host *
  AddKeysToAgent yes
  UseKeychain yes
```

### Step 3: Enable Agent Forwarding (Selective)
```bash
# ~/.ssh/config — ONLY for trusted hosts
Host bastion
  HostName bastion.example.com
  ForwardAgent yes

Host prod
  HostName prod.example.com
  ForwardAgent no   # Never forward to production!

# NEVER use ForwardAgent in Host * wildcard
```

### Step 4: Verify Agent Forwarding
```bash
# On remote host, verify agent is available
ssh-add -l    # Should list your local keys
ssh -T git@github.com  # Should authenticate via forwarded agent
```

## Using Keychain for Persistent Agent
```bash
# Install keychain (persists agent across sessions)
# macOS: brew install keychain
# Linux: apt install keychain

# Add to .zshrc
eval "$(keychain --eval --quiet id_ed25519)"
```

## Security Considerations
```bash
# Agent forwarding risks:
# - Root on remote server can hijack your agent socket
# - Only enable for trusted hosts you control
# - Prefer ProxyJump over ForwardAgent when possible

# Safer alternative: ProxyJump (no agent exposure)
Host internal
  HostName 10.0.1.50
  ProxyJump bastion  # Tunnels connection, doesn't forward agent
```

## Best Practices
- **AddKeysToAgent yes** — auto-cache on first use
- **ForwardAgent only to trusted hosts** — never wildcard
- **Prefer ProxyJump over ForwardAgent** — more secure
- **Use keychain** on Linux for persistent agent across sessions
- **Use macOS Keychain** for seamless passphrase storage
- **Verify with ssh-add -l** after forwarding

## Common Mistakes
- ForwardAgent yes in Host * (security risk on every host)
- Not starting ssh-agent (keys not cached)
- Forwarding to untrusted/shared servers
- Using agent forwarding when ProxyJump would work
- Forgetting AddKeysToAgent (typing passphrase every time)
