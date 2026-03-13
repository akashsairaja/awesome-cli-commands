---
id: homebrew-service-management
stackId: homebrew
type: skill
name: Homebrew Service Management
description: >-
  Manage background services with brew services — start, stop, and restart
  databases, queues, and daemons installed via Homebrew with launchd
  integration.
difficulty: beginner
tags:
  - homebrew
  - service
  - management
  - testing
  - monitoring
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Homebrew Service Management skill?"
    answer: >-
      Manage background services with brew services — start, stop, and restart
      databases, queues, and daemons installed via Homebrew with launchd
      integration. It includes practical examples for homebrew development.
  - question: "What tools and setup does Homebrew Service Management require?"
    answer: >-
      Works with standard homebrew tooling (relevant CLI tools and
      frameworks). Review the setup section in the skill content for specific
      configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Homebrew Service Management

## Overview
`brew services` manages background daemons installed via Homebrew — databases (PostgreSQL, MySQL, Redis), queues (RabbitMQ), and other services. It wraps macOS launchd (or Linux systemd) with simple start/stop/restart commands.

## Why This Matters
- **Simple management** — `brew services start postgresql@16` replaces launchctl complexity
- **Auto-start on boot** — services persist across reboots
- **Consistent interface** — same commands for all services
- **Status monitoring** — see what's running at a glance

## How It Works

### Basic Commands
```bash
# List all services and their status
brew services list

# Start a service (auto-starts on boot)
brew services start postgresql@16
brew services start redis

# Stop a service
brew services stop postgresql@16

# Restart a service
brew services restart postgresql@16

# Run once (don't auto-start on boot)
brew services run postgresql@16
```

### Common Service Configurations
```bash
# PostgreSQL
brew install postgresql@16
brew services start postgresql@16
createdb myapp_dev

# Redis
brew install redis
brew services start redis
redis-cli ping  # Should return PONG

# MySQL
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Service Status
```bash
# Check if services are running
brew services list
# Name          Status  User    File
# postgresql@16 started alice   ~/Library/LaunchAgents/...
# redis         started alice   ~/Library/LaunchAgents/...
# mysql         stopped

# Check logs for a service
cat $(brew --prefix)/var/log/postgresql@16.log
cat $(brew --prefix)/var/log/redis.log
```

### Troubleshooting Services
```bash
# Service won't start? Check:
brew services list          # Status
brew info postgresql@16     # Install details
cat $(brew --prefix)/var/log/postgresql@16.log  # Logs

# Reset a service
brew services stop postgresql@16
brew services cleanup       # Remove stale plists
brew services start postgresql@16

# Nuclear option: reinstall
brew reinstall postgresql@16
brew services restart postgresql@16
```

## Best Practices
- **Use `brew services start`** for persistent services (databases)
- **Use `brew services run`** for temporary services (one-off testing)
- **Check logs** at `$(brew --prefix)/var/log/` for service issues
- **Pin database versions**: `postgresql@16` not just `postgresql`
- **Stop unused services** — each one consumes memory
- **Include services in Brewfile** — they auto-start on `brew bundle`

## Common Mistakes
- Using launchctl directly instead of brew services
- Not pinning database versions (upgrades can break data)
- Leaving unused services running (memory waste)
- Not checking logs when services fail to start
- Forgetting to initialize databases after installation
