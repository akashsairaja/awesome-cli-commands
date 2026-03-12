---
id: podman-quadlet-services
stackId: podman
type: skill
name: Create Systemd Services with Podman Quadlet
description: >-
  Build production-ready container services using Podman Quadlet — declarative
  .container files, pod grouping, volume management, and auto-update
  configuration.
difficulty: intermediate
tags:
  - quadlet
  - systemd-containers
  - podman-services
  - auto-update
  - pod-management
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Podman 4.4+
  - systemd-based Linux
  - Rootless Podman configured
faq:
  - question: What is the difference between Quadlet and podman generate systemd?
    answer: >-
      Quadlet uses simple declarative .container files that systemd's generator
      converts to units on daemon-reload. 'podman generate systemd' creates
      static unit files that become outdated as Podman evolves. Quadlet is the
      recommended approach starting with Podman 4.4 and 'podman generate
      systemd' is deprecated.
  - question: How do Quadlet auto-updates work?
    answer: >-
      Add Label=io.containers.autoupdate=registry to your .container file and
      enable the podman-auto-update.timer. Podman periodically checks if a newer
      image exists in the registry. If found, it pulls the new image, stops the
      container, and restarts it with the updated image.
relatedItems:
  - podman-rootless-setup
  - podman-compose-migration
  - podman-quadlet-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Create Systemd Services with Podman Quadlet

## Overview
Podman Quadlet is a systemd generator that turns simple declarative files into fully managed systemd services. Instead of writing complex systemd unit files or using `podman generate systemd`, you write .container, .pod, .volume, and .network files that Quadlet converts automatically.

## Why This Matters
- **Native systemd integration** — containers managed like any other service
- **Declarative** — simple INI-like format, version-controllable
- **Auto-start** — containers start on boot and restart on failure
- **Auto-update** — automatic image pulls and container recreation

## How It Works

### Step 1: Create a Container Quadlet File
```ini
# ~/.config/containers/systemd/webapp.container
[Unit]
Description=My Web Application
After=network-online.target

[Container]
Image=docker.io/library/nginx:1.25-alpine
PublishPort=8080:80
Volume=webapp-data.volume:/usr/share/nginx/html:ro
Environment=NGINX_HOST=localhost
Label=io.containers.autoupdate=registry
HealthCmd=curl -f http://localhost/ || exit 1
HealthInterval=30s

[Service]
Restart=always
TimeoutStartSec=60

[Install]
WantedBy=default.target
```

### Step 2: Create a Volume Quadlet File
```ini
# ~/.config/containers/systemd/webapp-data.volume
[Volume]
Label=app=webapp
```

### Step 3: Create a Pod with Multiple Containers
```ini
# ~/.config/containers/systemd/myapp.pod
[Pod]
PodName=myapp
PublishPort=5432:5432
PublishPort=6379:6379

# ~/.config/containers/systemd/postgres.container
[Unit]
Description=PostgreSQL Database

[Container]
Image=docker.io/library/postgres:16-alpine
Pod=myapp.pod
Volume=pgdata.volume:/var/lib/postgresql/data
Environment=POSTGRES_PASSWORD_FILE=/run/secrets/pg-pass
Secret=pg-pass,type=mount
HealthCmd=pg_isready -U postgres
HealthInterval=10s

[Service]
Restart=always

[Install]
WantedBy=default.target

# ~/.config/containers/systemd/redis.container
[Unit]
Description=Redis Cache

[Container]
Image=docker.io/library/redis:7-alpine
Pod=myapp.pod
Volume=redisdata.volume:/data
HealthCmd=redis-cli ping
HealthInterval=10s

[Service]
Restart=always

[Install]
WantedBy=default.target
```

### Step 4: Activate and Manage
```bash
# Reload systemd to pick up Quadlet files
systemctl --user daemon-reload

# Start the service (Quadlet generates the unit name)
systemctl --user start webapp.service
systemctl --user start myapp-pod.service

# Enable auto-start on boot
systemctl --user enable webapp.service

# Check status
systemctl --user status webapp.service
podman ps

# View logs
journalctl --user -u webapp.service -f

# Configure auto-update timer
systemctl --user enable --now podman-auto-update.timer
```

## Best Practices
- Name .container files to match the desired service name
- Use .volume files instead of inline volume definitions for persistence
- Always configure health checks for production services
- Enable `podman-auto-update.timer` for automatic image freshness
- Use Secrets for sensitive configuration instead of Environment
- Set `Restart=always` and appropriate `TimeoutStartSec`

## Common Mistakes
- Placing rootless Quadlet files in /etc instead of ~/.config/containers/systemd/
- Forgetting `daemon-reload` after adding or changing Quadlet files
- Not enabling lingering (services die on logout)
- Missing the .pod reference in container files (containers not grouped)
- Using `podman generate systemd` for new services (use Quadlet instead)
