---
id: ngrok-config-setup
stackId: ngrok
type: skill
name: Configure Ngrok for Team Development
description: >-
  Set up ngrok configuration files — multiple tunnels, custom domains, OAuth
  authentication, traffic policies, and team-shared development environments.
difficulty: intermediate
tags:
  - ngrok
  - configuration
  - tunnels
  - oauth
  - team-development
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - ngrok installed
  - ngrok paid plan (for custom domains and OAuth)
faq:
  - question: Where is the ngrok configuration file located?
    answer: >-
      On macOS/Linux: ~/.config/ngrok/ngrok.yml. On Windows:
      %USERPROFILE%/.config/ngrok/ngrok.yml. You can also specify a custom path
      with 'ngrok start --config ./my-config.yml'. Use 'ngrok config check' to
      validate your configuration file.
  - question: How do I run multiple ngrok tunnels simultaneously?
    answer: >-
      Define multiple tunnels in ngrok.yml under the 'tunnels' section, each
      with a unique name and port. Start them with 'ngrok start --all' for all
      tunnels, or 'ngrok start frontend api' for specific ones. Each tunnel gets
      its own URL and shows in the inspection UI.
  - question: Can I add authentication to an ngrok tunnel?
    answer: >-
      Yes. Use ngrok's built-in OAuth integration (Google, GitHub, Microsoft) to
      require login before accessing the tunnel. Configure it in ngrok.yml with
      the 'oauth' section. You can restrict access to specific email domains for
      team-only access.
relatedItems:
  - ngrok-tunnel-architect
  - ngrok-webhook-testing
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Configure Ngrok for Team Development

## Overview
The ngrok configuration file (ngrok.yml) defines tunnels, authentication, and policies in a reproducible format. Use it to standardize tunnel setup across your team and configure advanced features like OAuth, IP restrictions, and traffic policies.

## Why This Matters
- **Reproducible** — same tunnel configuration every time
- **Team sharing** — everyone uses consistent settings
- **Advanced features** — OAuth, policies, custom domains in config
- **Multiple tunnels** — run frontend, API, and services simultaneously

## How It Works

### Step 1: Create Configuration File
```yaml
# ~/.config/ngrok/ngrok.yml
version: "3"
agent:
  authtoken: your-auth-token

tunnels:
  # Frontend development server
  frontend:
    addr: 3000
    proto: http
    domain: myapp-dev.ngrok.dev
    inspect: true

  # API server
  api:
    addr: 8080
    proto: http
    domain: myapi-dev.ngrok.dev
    inspect: true

  # Database (TCP tunnel)
  postgres:
    addr: 5432
    proto: tcp
```

### Step 2: Add OAuth Authentication
```yaml
tunnels:
  staging:
    addr: 3000
    proto: http
    domain: staging.ngrok.dev
    oauth:
      provider: google
      allow_domains:
        - company.com    # Only allow company email domain
```

### Step 3: Traffic Policies
```yaml
tunnels:
  api:
    addr: 8080
    proto: http
    domain: api-dev.ngrok.dev
    traffic_policy:
      on_http_request:
        - actions:
            - type: rate-limit
              config:
                name: api-limit
                algorithm: sliding_window
                capacity: 100
                rate: 60s
        - expressions:
            - "req.headers['x-api-key'][0] != 'secret-key'"
          actions:
            - type: deny
              config:
                status_code: 401
```

### Step 4: IP Restrictions
```yaml
tunnels:
  internal:
    addr: 3000
    proto: http
    domain: internal.ngrok.dev
    traffic_policy:
      on_http_request:
        - expressions:
            - "conn.client_ip not in ['1.2.3.4', '5.6.7.8']"
          actions:
            - type: deny
              config:
                status_code: 403
```

### Step 5: Start Tunnels
```bash
# Start a specific tunnel
ngrok start frontend

# Start multiple tunnels
ngrok start frontend api

# Start all tunnels
ngrok start --all

# Use a specific config file
ngrok start --config ./ngrok-dev.yml --all
```

## Best Practices
- Store ngrok.yml in the project (gitignore the authtoken line)
- Use custom domains for webhook endpoints
- Add OAuth for any publicly accessible tunnel
- Use traffic policies for rate limiting and access control
- Run multiple tunnels for microservice architectures
- Share configuration (without authtoken) with team via Git

## Common Mistakes
- Committing authtoken to version control
- Not using configuration file (CLI flags are not reproducible)
- Running single tunnel when multiple services need exposure
- No authentication on publicly accessible tunnels
- Not using inspect mode for debugging
