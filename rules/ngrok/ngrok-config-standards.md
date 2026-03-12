---
id: ngrok-config-standards
stackId: ngrok
type: rule
name: Ngrok Configuration File Standards
description: >-
  Enforce consistent ngrok configuration — file structure, tunnel naming, domain
  conventions, and required settings for team development environments.
difficulty: beginner
globs:
  - '**/ngrok.yml'
  - '**/ngrok*.yaml'
tags:
  - ngrok
  - configuration
  - standards
  - naming
  - team-development
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: Why should I use an ngrok config file instead of CLI flags?
    answer: >-
      Configuration files are reproducible, shareable, and version-controllable.
      Team members can start the exact same tunnel setup with 'ngrok start
      --all' instead of remembering complex CLI flags. Store the config in Git
      (without the authtoken) for consistent team development.
  - question: How do I manage ngrok configuration across environments?
    answer: >-
      Create separate config files: ngrok-dev.yml for local development,
      ngrok-staging.yml for staging with OAuth. Use 'ngrok start --config
      ./ngrok-dev.yml --all' to start with a specific configuration. This keeps
      environment-specific settings separate and clear.
relatedItems:
  - ngrok-tunnel-architect
  - ngrok-security-rules
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Ngrok Configuration File Standards

## Rule
All ngrok setups MUST use a configuration file (ngrok.yml) instead of CLI flags. Configuration MUST be consistent across the team.

## Format
```yaml
version: "3"
agent:
  authtoken: ${NGROK_AUTHTOKEN}

tunnels:
  tunnel-name:
    addr: service:port
    proto: http
    domain: descriptive-name.ngrok.dev
    inspect: true
```

## Naming Conventions
| Item | Convention | Example |
|------|-----------|---------|
| Tunnel name | kebab-case, matches service | `web-app`, `api-server` |
| Domain | project-env.ngrok.dev | `myapp-dev.ngrok.dev` |
| Config file | ngrok.yml or ngrok-{env}.yml | `ngrok-dev.yml` |

## Required Settings
```yaml
tunnels:
  web:
    addr: 3000
    proto: http
    inspect: true       # REQUIRED: enable debugging
    domain: app.ngrok.dev  # RECOMMENDED: stable URL
```

## Multiple Environments
```yaml
# ngrok-dev.yml — for local development
tunnels:
  app:
    addr: 3000
    proto: http
    domain: myapp-dev.ngrok.dev

# ngrok-staging.yml — for staging exposure
tunnels:
  app:
    addr: 3000
    proto: http
    domain: myapp-staging.ngrok.dev
    oauth:
      provider: google
      allow_domains: ["company.com"]
```

## Examples

### Good
- Configuration file in project root (gitignored authtoken)
- Descriptive tunnel names matching services
- Custom domains for stable URLs
- inspect: true for debugging

### Bad
```bash
# CLI flags instead of config file
ngrok http 3000 --domain=my-app.ngrok.dev --inspect

# No one remembers the exact flags to use
```

## Enforcement
Include ngrok.yml template in project setup documentation.
Add authtoken patterns to .gitignore.
Review tunnel configurations in team onboarding.
