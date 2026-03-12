---
id: podman-rootless-setup
stackId: podman
type: skill
name: Set Up Rootless Podman from Scratch
description: >-
  Configure rootless Podman with user namespace mappings, storage drivers,
  networking, and verify the setup with your first rootless container.
difficulty: beginner
tags:
  - podman-rootless
  - container-setup
  - user-namespace
  - subuid
  - daemonless
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Linux with kernel 5.11+ (user namespaces)
  - Non-root user account
faq:
  - question: How do I set up rootless Podman?
    answer: >-
      Install Podman, configure subuid/subgid with 'usermod --add-subuids', run
      'podman system migrate', and verify with 'podman info | grep rootless'.
      Enable lingering with 'loginctl enable-linger' for containers that should
      survive logout.
  - question: Can rootless Podman containers bind to port 80?
    answer: >-
      By default, rootless containers cannot bind ports below 1024. Either use a
      higher port with -p 8080:80 mapping, or lower the unprivileged port start
      with 'sysctl net.ipv4.ip_unprivileged_port_start=80' (requires root to
      set).
relatedItems:
  - podman-quadlet-services
  - podman-compose-migration
  - podman-rootless-specialist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Set Up Rootless Podman from Scratch

## Overview
Rootless Podman runs containers entirely in user space without needing root privileges or a background daemon. This is the most secure way to run containers — even if a container is compromised, the attacker only has the unprivileged user's access.

## Why This Matters
- **Security** — no root daemon, no root containers by default
- **Multi-user** — each user has isolated container storage and networking
- **No daemon** — containers are direct child processes, not managed by a service
- **Docker compatible** — same CLI commands and image format

## How It Works

### Step 1: Install Podman
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y podman

# Fedora/RHEL
sudo dnf install -y podman

# Verify installation
podman --version
```

### Step 2: Configure User Namespace Mappings
```bash
# Check current subuid/subgid mappings
grep $USER /etc/subuid /etc/subgid

# If missing, add them (100000 subordinate UIDs/GIDs)
sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 $USER

# Apply the new mappings
podman system migrate
```

### Step 3: Configure Storage
```bash
# Check storage configuration
podman info --format '{{.Store.GraphRoot}}'
# Default: ~/.local/share/containers/storage

# For better performance, configure overlay storage (if not default)
mkdir -p ~/.config/containers
cat > ~/.config/containers/storage.conf << 'EOF'
[storage]
driver = "overlay"
EOF
```

### Step 4: Run Your First Rootless Container
```bash
# Pull and run an image
podman run --rm -it alpine sh

# Verify rootless — inside the container:
whoami   # root (but mapped to your UID on host)
id       # uid=0(root) — but actually unprivileged

# From another terminal, check the host process:
ps aux | grep -i alpine
# Running as YOUR user, not root
```

### Step 5: Enable Lingering for Persistent Services
```bash
# Allow user services to run when not logged in
loginctl enable-linger $USER

# Now rootless containers can run as systemd user services
# even when you log out
```

## Best Practices
- Always verify rootless mode with `podman info | grep rootless`
- Enable lingering for any user running long-lived containers
- Use `podman system prune` regularly to reclaim storage
- Configure registries in `~/.config/containers/registries.conf`
- Use `podman unshare` to inspect user namespace mappings

## Common Mistakes
- Running `sudo podman` out of habit (creates rootful containers)
- Missing subuid/subgid entries (user namespace fails)
- Not enabling lingering (containers die on logout)
- Expecting rootless containers to bind port < 1024 (use `sysctl net.ipv4.ip_unprivileged_port_start=80`)
