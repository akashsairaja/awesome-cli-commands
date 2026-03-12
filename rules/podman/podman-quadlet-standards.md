---
id: podman-quadlet-standards
stackId: podman
type: rule
name: Quadlet File Standards
description: >-
  Enforce standards for Podman Quadlet unit files — naming conventions, required
  directives, health checks, restart policies, and file placement for rootless
  and rootful services.
difficulty: intermediate
globs:
  - '**/*.container'
  - '**/*.pod'
  - '**/*.volume'
  - '**/*.network'
  - '**/*.kube'
tags:
  - quadlet-standards
  - systemd-units
  - health-checks
  - service-management
  - container-policy
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: What are the required fields in a Podman Quadlet file?
    answer: >-
      Every Quadlet .container file should include: Image with a pinned tag,
      HealthCmd for monitoring, Restart policy in [Service], Description in
      [Unit], and WantedBy in [Install] for auto-start. Add
      Label=io.containers.autoupdate=registry if the image should auto-update.
  - question: How do I handle secrets in Quadlet files?
    answer: >-
      Never put secrets in the Environment directive. Use the Secret directive
      with type=mount to inject Podman secrets as files inside the container.
      Create secrets with 'podman secret create name file' and reference them in
      the Quadlet file.
relatedItems:
  - podman-rootless-first
  - podman-image-standards
  - podman-quadlet-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Quadlet File Standards

## Rule
All container services MUST be managed through Quadlet files with health checks, restart policies, and appropriate file placement.

## Format
```ini
# service-name.container
[Unit]
Description=<service description>
After=network-online.target

[Container]
Image=<registry>/<image>:<pinned-tag>
HealthCmd=<health check command>
HealthInterval=30s
Label=io.containers.autoupdate=registry

[Service]
Restart=always
TimeoutStartSec=90

[Install]
WantedBy=default.target
```

## Requirements
1. **File placement** — rootless: `~/.config/containers/systemd/`, rootful: `/etc/containers/systemd/`
2. **Image pinning** — ALWAYS use pinned tags, never :latest
3. **Health checks** — REQUIRED for all long-running services
4. **Restart policy** — set `Restart=always` for production services
5. **Auto-update labels** — add for images that should track registry updates
6. **Description** — meaningful [Unit] Description for `systemctl status`
7. **Timeouts** — set TimeoutStartSec appropriate to the service

## Examples

### Good
```ini
[Unit]
Description=Application API Server
After=network-online.target

[Container]
Image=ghcr.io/myorg/api:2.1.0
PublishPort=8080:8080
Volume=api-data.volume:/data
Environment=NODE_ENV=production
Secret=api-keys,type=mount
HealthCmd=curl -sf http://localhost:8080/health || exit 1
HealthInterval=30s
HealthStartPeriod=10s
Label=io.containers.autoupdate=registry

[Service]
Restart=always
TimeoutStartSec=90
TimeoutStopSec=30

[Install]
WantedBy=default.target
```

### Bad
```ini
# Missing: description, health check, restart policy, pinned image
[Container]
Image=myapp:latest
PublishPort=8080:8080
Environment=DB_PASSWORD=secret123
```

## Enforcement
Lint Quadlet files in CI before deployment. Check for required fields: Image with pinned tag, HealthCmd, Restart, Description.
