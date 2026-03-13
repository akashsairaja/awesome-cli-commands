---
id: sshgpg-ssh-config
stackId: sshgpg
type: skill
name: SSH Config File Mastery
description: >-
  Configure ~/.ssh/config for efficient multi-host management — host aliases,
  per-host keys, jump/bastion hosts, connection multiplexing, Match blocks for
  conditional logic, and wildcard patterns for fleet-scale SSH management.
difficulty: advanced
tags:
  - sshgpg
  - ssh
  - config
  - file
  - mastery
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
  - question: "How does SSH config file matching work?"
    answer: >-
      SSH matches Host blocks by the alias you provide on the command line, not
      the actual hostname. If multiple Host entries match (e.g., a specific host
      and a wildcard), SSH merges them top-to-bottom — the first value for each
      option wins. This means specific hosts must come before wildcards. Match
      blocks add conditional logic based on hostname, user, network, or custom
      commands.
  - question: "Is it safe to use ControlMaster on shared systems?"
    answer: >-
      Use caution. The control socket allows anyone with filesystem access to
      the socket to piggyback on your SSH session. Set the ControlPath in a
      directory owned by you with 700 permissions. On shared servers or
      untrusted machines, disable ControlMaster entirely. Never use it on jump
      hosts that other users share.
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# SSH Config File Mastery

## Overview
The SSH config file (`~/.ssh/config`) is the central control point for all SSH client behavior. It eliminates repetitive command-line flags, enforces per-host security policies, routes connections through bastion hosts, and multiplexes connections for performance. A well-structured config file turns `ssh -i ~/.ssh/work_key -p 2222 -J bastion deploy@prod-app-01.internal.example.com` into `ssh prod-app`.

## How Matching Works

Understanding SSH's matching rules is essential before writing any config. SSH processes the config file top-to-bottom and collects settings from every `Host` or `Match` block that matches. For any given option, the **first** matching value wins. Later blocks can only add options that haven't been set yet — they cannot override earlier values.

This means: put specific hosts at the top, wildcard patterns in the middle, and your global `Host *` defaults at the bottom.

```
Host prod-app         <- matches "ssh prod-app" only
Host *.prod.example   <- matches "ssh anything.prod.example"
Host *                <- matches everything (defaults)
```

## Host Configuration

### Basic Host Aliases

```bash
# ~/.ssh/config

# GitHub (personal)
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/personal_ed25519
  IdentitiesOnly yes

# GitHub (work) — separate account, separate key
Host github-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/work_ed25519
  IdentitiesOnly yes

# Production application server
Host prod-app
  HostName 203.0.113.10
  User deploy
  Port 2222
  IdentityFile ~/.ssh/work_ed25519
  IdentitiesOnly yes

# Staging
Host staging
  HostName 203.0.113.20
  User deploy
  IdentityFile ~/.ssh/work_ed25519
```

`IdentitiesOnly yes` is critical. Without it, SSH sends every key loaded in your agent to the server, one by one. If you have five keys loaded and the server has `MaxAuthTries 3`, you'll get locked out before the correct key is even tried. `IdentitiesOnly` restricts the connection to only the specified `IdentityFile`.

### Multiple GitHub/GitLab Accounts

A common challenge is using multiple Git hosting accounts from the same machine. The trick is using a different Host alias that still resolves to the same HostName:

```bash
# In your config
Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/personal_ed25519
  IdentitiesOnly yes

Host github-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/work_ed25519
  IdentitiesOnly yes
```

Then clone with the alias: `git clone github-work:company/repo.git`. Git uses the Host alias to look up SSH settings, so each account gets its own key automatically.

## Jump Hosts and Bastion Access

`ProxyJump` is the modern way to route SSH through an intermediate host. It's simpler and more secure than the older `ProxyCommand` approach because traffic is encrypted end-to-end — the bastion host never sees your private key or the decrypted session.

```bash
# Bastion host
Host bastion
  HostName bastion.example.com
  User admin
  IdentityFile ~/.ssh/work_ed25519
  IdentitiesOnly yes

# All internal servers jump through bastion
Host internal-*
  ProxyJump bastion
  User admin
  IdentityFile ~/.ssh/work_ed25519
  IdentitiesOnly yes

Host internal-db
  HostName 10.0.1.50

Host internal-app
  HostName 10.0.1.51

Host internal-cache
  HostName 10.0.1.52

# Usage: ssh internal-db
# Connects to bastion first, then to 10.0.1.50
```

For multi-hop chains (rare but sometimes necessary in segmented networks):

```bash
Host deep-internal
  HostName 10.10.1.100
  ProxyJump bastion,internal-app
  # Hops: local -> bastion -> internal-app -> 10.10.1.100
```

ProxyJump keeps your private keys on your local machine at all times. Unlike agent forwarding, the bastion host never has access to your key material. Prefer ProxyJump over `ForwardAgent yes` whenever possible.

## Connection Multiplexing

Multiplexing reuses a single TCP connection for multiple SSH sessions to the same host. The first connection creates a master socket; subsequent connections piggyback on it, skipping TCP handshake and authentication entirely.

```bash
Host *
  ControlMaster auto
  ControlPath ~/.ssh/sockets/%r@%h-%p
  ControlPersist 600
```

`ControlMaster auto` creates a master connection if one doesn't exist or reuses an existing one. `ControlPersist 600` keeps the master alive for 10 minutes after the last session disconnects, so reconnecting within that window is instant.

The `ControlPath` must include `%r` (remote user), `%h` (host), and `%p` (port) to avoid collisions between different connections. Create the socket directory:

```bash
mkdir -p ~/.ssh/sockets
chmod 700 ~/.ssh/sockets
```

**Performance impact**: On a typical SSH connection, the TCP handshake + key exchange + authentication takes 200-500ms. Multiplexed connections skip all of that. This is especially noticeable when running `git pull` or `scp` repeatedly against the same host — each operation reuses the existing connection.

**When to disable multiplexing**: On shared jump hosts (other users could access your socket), when running long-lived tunnels (a stuck master socket blocks all connections), or when debugging connection issues (multiplexing masks connection setup problems).

```bash
# Temporarily bypass multiplexing
ssh -S none prod-app

# Manually close a master connection
ssh -O exit prod-app
```

## Match Blocks for Conditional Logic

`Match` blocks apply settings conditionally based on hostname, user, network, or the result of an external command. They're powerful for handling environments where your SSH behavior needs to change based on context.

```bash
# Use corporate proxy when on office network
Match host *.internal.company.com exec "ip route | grep -q '10.0.0.0/8'"
  ProxyJump corporate-proxy

# Use direct connection when on VPN
Match host *.internal.company.com exec "ip route | grep -q '172.16.0.0/12'"
  ProxyJump none

# Different user for CI/CD service accounts
Match host * exec "test -f /etc/ci-runner"
  User ci-deploy
  IdentityFile /etc/ci-keys/deploy_ed25519
```

The `exec` keyword runs a local command; if it returns exit code 0, the Match block applies. This lets you adapt SSH behavior based on which network you're on, whether you're in a container, or any other condition you can test with a command.

## Wildcard Patterns for Fleet Management

When managing dozens or hundreds of servers, wildcard patterns prevent config file explosion:

```bash
# All production servers share these settings
Host *.prod.example.com
  User deploy
  IdentityFile ~/.ssh/prod_ed25519
  IdentitiesOnly yes
  LogLevel ERROR
  StrictHostKeyChecking yes

# Development servers are more relaxed
Host *.dev.example.com
  User developer
  IdentityFile ~/.ssh/dev_ed25519
  StrictHostKeyChecking accept-new

# All AWS instances via SSM (no direct SSH)
Host i-*
  ProxyCommand aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p'
  User ec2-user
  IdentityFile ~/.ssh/aws_ed25519
```

The AWS SSM pattern is especially useful — it uses AWS Systems Manager as a transport layer, so instances don't need public IPs or open SSH ports. The `Host i-*` pattern matches EC2 instance IDs directly.

## Security Defaults

Place these at the bottom of your config as global defaults:

```bash
Host *
  # Use strong key types only
  HostKeyAlgorithms ssh-ed25519,ssh-ed25519-cert-v01@openssh.com,rsa-sha2-512,rsa-sha2-256

  # Auto-add keys to agent on first use
  AddKeysToAgent yes

  # Prevent idle disconnects
  ServerAliveInterval 60
  ServerAliveCountMax 3

  # Visual host key verification
  VisualHostKey yes

  # Hash known_hosts entries (hides hostnames if file is stolen)
  HashKnownHosts yes

  # Never forward agent by default (override per-host)
  ForwardAgent no
```

`HashKnownHosts yes` is an often-missed security measure. If your `~/.ssh/known_hosts` file is exfiltrated, hashed entries prevent an attacker from learning what servers you connect to. The tradeoff is that you lose tab-completion for hostnames from known_hosts.

## File Permissions

SSH refuses to use the config file if permissions are too open:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/*_ed25519      # private keys
chmod 644 ~/.ssh/*.pub           # public keys
chmod 700 ~/.ssh/sockets
```

## Common Mistakes
- **Missing IdentitiesOnly**: SSH tries all agent keys, hits MaxAuthTries before the right key
- **Wildcards before specific hosts**: First match wins — specific hosts must come first
- **ForwardAgent on untrusted hosts**: Anyone with root on that host can use your agent keys
- **Missing socket directory**: ControlMaster fails silently if `~/.ssh/sockets/` doesn't exist
- **Wrong config permissions**: SSH ignores the config file if it's group/world-readable
- **ControlMaster on shared bastions**: Other users can hijack your multiplexed sessions
- **Using ProxyCommand when ProxyJump works**: ProxyJump is simpler and chains more cleanly
- **StrictHostKeyChecking set to no globally**: Disables MITM protection for all connections
