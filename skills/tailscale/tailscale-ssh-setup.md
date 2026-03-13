---
id: tailscale-ssh-setup
stackId: tailscale
type: skill
name: Configure Tailscale SSH for Keyless Access
description: >-
  Replace traditional SSH key management with Tailscale SSH — identity-based
  access, ACL-controlled permissions, session recording, and automatic key
  rotation.
difficulty: advanced
tags:
  - tailscale
  - configure
  - ssh
  - keyless
  - access
  - prompting
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Configure Tailscale SSH for Keyless Access skill?"
    answer: >-
      Replace traditional SSH key management with Tailscale SSH —
      identity-based access, ACL-controlled permissions, session recording,
      and automatic key rotation. This skill provides a structured workflow
      for development tasks.
  - question: "What tools and setup does Configure Tailscale SSH for Keyless Access require?"
    answer: >-
      Works with standard tailscale tooling (relevant CLI tools and
      frameworks). Review the setup section in the skill content for specific
      configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Configure Tailscale SSH for Keyless Access

## Overview
Tailscale SSH replaces traditional SSH key management with identity-based access. Users authenticate with their Tailscale identity (SSO), and ACLs control who can SSH where. No more distributing SSH keys, managing authorized_keys, or rotating credentials.

## Why This Matters
- **No SSH keys** — no key generation, distribution, or rotation
- **Identity-based** — access tied to SSO identity, not key files
- **ACL controlled** — SSH access managed centrally in ACL policies
- **Session recording** — optional recording for compliance and audit
- **Automatic rotation** — Tailscale handles key lifecycle

## How It Works

### Step 1: Enable Tailscale SSH on Servers
```bash
# On the server, enable Tailscale SSH
sudo tailscale up --ssh

# Verify SSH is advertised
tailscale status
```

### Step 2: Configure ACL for SSH Access
```json
{
  "ssh": [
    // Ops team can SSH as root to production servers
    {
      "action": "accept",
      "src": ["group:ops"],
      "dst": ["tag:production"],
      "users": ["root", "deploy"]
    },
    // Engineering can SSH to staging as their own user
    {
      "action": "accept",
      "src": ["group:engineering"],
      "dst": ["tag:staging"],
      "users": ["autogroup:nonroot"]
    },
    // CI can SSH to staging as deploy user
    {
      "action": "accept",
      "src": ["tag:ci"],
      "dst": ["tag:staging"],
      "users": ["deploy"]
    },
    // Check mode — prompt for approval
    {
      "action": "check",
      "src": ["group:engineering"],
      "dst": ["tag:production"],
      "users": ["autogroup:nonroot"]
    }
  ]
}
```

### Step 3: Connect via Tailscale SSH
```bash
# SSH using MagicDNS name (no key needed!)
ssh user@server-name

# Tailscale handles authentication automatically
# Your SSO identity is verified by the destination

# Use with standard SSH tools
scp file.txt user@server-name:/tmp/
rsync -avz ./build/ user@server-name:/var/www/
```

### Step 4: Enable Session Recording
```json
{
  "ssh": [
    {
      "action": "accept",
      "src": ["group:ops"],
      "dst": ["tag:production"],
      "users": ["root"],
      "recorder": ["tag:recorder"]
    }
  ]
}
```

### Step 5: Configure Check Mode (Approval Required)
```json
{
  "ssh": [
    {
      "action": "check",
      "src": ["group:engineering"],
      "dst": ["tag:production"],
      "users": ["root"],
      "checkPeriod": "12h"
    }
  ]
}
```

## Best Practices
- Use "check" action for production root access (requires approval)
- Use "accept" for staging and development access
- Enable session recording for production servers (compliance)
- Use autogroup:nonroot to prevent root SSH for most users
- Combine with Tailscale ACLs for network-level access control
- Use MagicDNS names in SSH config, not IP addresses

## Common Mistakes
- Allowing root SSH without approval mode (use "check")
- Not disabling traditional SSH after enabling Tailscale SSH
- No session recording for production servers (compliance gap)
- Using IP addresses instead of MagicDNS in SSH configs
- Not testing SSH ACL changes before applying to production
