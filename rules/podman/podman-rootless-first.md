---
id: podman-rootless-first
stackId: podman
type: rule
name: Rootless-First Container Policy
description: >-
  Enforce rootless Podman as the default execution mode — require justification
  for root containers, mandate user namespace isolation, and prohibit
  unnecessary privilege escalation.
difficulty: beginner
globs:
  - '**/Containerfile'
  - '**/Dockerfile'
  - '**/*compose*.yml'
  - '**/*compose*.yaml'
  - '**/containers/systemd/*.container'
tags:
  - rootless-policy
  - container-security
  - privilege-restriction
  - podman-best-practices
  - user-namespace
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Why should containers run rootless by default?
    answer: >-
      Rootless containers run in user namespaces where root inside the container
      maps to an unprivileged user on the host. If a container escape
      vulnerability is exploited, the attacker only has the limited permissions
      of the host user, not root access to the system.
  - question: When is it acceptable to run Podman containers as root?
    answer: >-
      Root containers are justified for: binding privileged ports (< 1024) when
      sysctl cannot be modified, NFS or FUSE storage drivers, direct hardware
      device access, and specific kernel module loading. Each case requires
      documented justification and security review.
relatedItems:
  - podman-image-standards
  - podman-quadlet-standards
  - podman-rootless-specialist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Rootless-First Container Policy

## Rule
All containers MUST run in rootless mode by default. Root (sudo podman) requires documented justification and security review.

## Format
```bash
# Correct — rootless
podman run --rm -it alpine sh

# Requires approval — rootful
sudo podman run --rm -it --privileged alpine sh
```

## Requirements
1. **Default rootless** — never use `sudo podman` without documented need
2. **User namespace** — verify subuid/subgid configured for all container users
3. **No --privileged** — never use in production; break into specific capabilities
4. **Port mapping** — use ports > 1024 or configure `ip_unprivileged_port_start`
5. **Volume ownership** — use `--userns=keep-id` for bind mounts, not `chown 0:0`

## Examples

### Good
```bash
# Rootless with proper UID mapping
podman run --userns=keep-id -v ./data:/app/data:Z myapp:1.2.0

# Rootless with specific capabilities only
podman run --cap-add=NET_BIND_SERVICE myapp:1.2.0
```

### Bad
```bash
# Running as root without justification
sudo podman run myapp:latest

# Using --privileged (grants ALL capabilities)
podman run --privileged myapp:latest

# Running as root just for port 80
sudo podman run -p 80:80 myapp:latest
# Fix: sysctl net.ipv4.ip_unprivileged_port_start=80
```

## Exceptions (Require Documentation)
- Binding ports < 1024 on systems where sysctl cannot be changed
- Running NFS or FUSE-based storage drivers
- Host device access (--device) for hardware passthrough

## Enforcement
Use CI/CD pipeline checks to scan deployment scripts for `sudo podman` and `--privileged`. Flag for security review.
