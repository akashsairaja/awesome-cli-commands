---
id: ngrok-config-setup
stackId: ngrok
type: skill
name: Configure Ngrok for Team Development
description: >-
  Set up ngrok v3 configuration files — endpoints with traffic policies, OAuth
  authentication, rate limiting, IP restrictions, webhook verification, and
  team-shared development environments.
difficulty: advanced
tags:
  - ngrok
  - configure
  - team
  - development
  - architecture
  - api
  - microservices
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Configure Ngrok for Team Development skill?"
    answer: >-
      Use this skill to set up reproducible ngrok tunnel configurations for
      team development — multiple simultaneous tunnels, OAuth-protected
      endpoints, traffic policies with rate limiting and IP restrictions, and
      webhook development with custom domains.
  - question: "What tools and setup does Configure Ngrok for Team Development require?"
    answer: >-
      Requires ngrok v3 CLI with an authtoken (free tier works for basic
      tunnels). Custom domains, OAuth, and traffic policies require a paid
      plan. Configuration is YAML-based in ~/.config/ngrok/ngrok.yml or a
      project-local file.
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# Configure Ngrok for Team Development

## Overview

The ngrok configuration file (ngrok.yml) defines tunnels, authentication, and traffic policies in a reproducible YAML format. Instead of passing flags on every `ngrok` invocation, you define your tunnel setup once and share it across the team. In ngrok v3, agent configuration is nested under the `agent` field and endpoints are defined under `endpoints` (the older `tunnels` field is deprecated).

## Configuration File Location

ngrok looks for its config file in this order:

1. `--config` flag path
2. `NGROK_CONFIG` environment variable
3. `~/.config/ngrok/ngrok.yml` (Linux/macOS)
4. `%APPDATA%\ngrok\ngrok.yml` (Windows)

For project-specific configs, keep a `ngrok.yml` in your repo and reference it with `--config`:

```bash
ngrok start --config ./ngrok-dev.yml --all
```

## Basic Multi-Tunnel Configuration

```yaml
# ngrok.yml (v3 format)
version: "3"
agent:
  authtoken: "${NGROK_AUTHTOKEN}"  # Use env var, never hardcode

endpoints:
  # Frontend development server
  - name: frontend
    url: "https://myapp-dev.ngrok.dev"
    upstream:
      url: "http://localhost:3000"
    traffic_policy:
      on_http_request:
        - actions:
            - type: add-headers
              config:
                headers:
                  X-Forwarded-Host: "myapp-dev.ngrok.dev"

  # API server
  - name: api
    url: "https://myapi-dev.ngrok.dev"
    upstream:
      url: "http://localhost:8080"

  # Database (TCP tunnel — no domain)
  - name: postgres
    url: "tcp://0.tcp.ngrok.io:0"
    upstream:
      url: "tcp://localhost:5432"
```

Note the v3 changes: configuration uses `endpoints` instead of `tunnels`, and each endpoint specifies `url` and `upstream` rather than `proto` and `addr`.

## OAuth Authentication

Protect tunnels with OAuth so only authenticated users from your organization can access them:

```yaml
endpoints:
  - name: staging
    url: "https://staging.ngrok.dev"
    upstream:
      url: "http://localhost:3000"
    traffic_policy:
      on_http_request:
        - actions:
            - type: oauth
              config:
                provider: google
                # Only allow your company's Google Workspace domain
                allow_domains:
                  - yourcompany.com
                # Or restrict to specific email addresses
                allow_emails:
                  - lead@yourcompany.com
                  - qa@yourcompany.com
```

Supported OAuth providers: Google, GitHub, Microsoft, Facebook, LinkedIn, GitLab, Twitch, and Amazon. For most teams, Google or GitHub provides the simplest setup since your team already has accounts.

## Traffic Policies

Traffic policies are ngrok's policy engine — they evaluate rules using Common Expression Language (CEL) expressions and execute actions at three lifecycle phases: `on_tcp_connect`, `on_http_request`, and `on_http_response`.

### Rate Limiting

```yaml
endpoints:
  - name: api
    url: "https://api-dev.ngrok.dev"
    upstream:
      url: "http://localhost:8080"
    traffic_policy:
      on_http_request:
        - actions:
            - type: rate-limit
              config:
                name: api-rate-limit
                algorithm: sliding_window
                capacity: 100
                rate: 60s
                bucket_key:
                  - "conn.client_ip"
```

The `bucket_key` determines how rate limits are applied. Using `conn.client_ip` creates per-IP limits. You can also bucket by header values (e.g., API keys) for per-client limits.

### API Key Validation

```yaml
traffic_policy:
  on_http_request:
    # Reject requests without a valid API key
    - expressions:
        - "!('x-api-key' in req.headers) || req.headers['x-api-key'][0] != 'dev-secret-key'"
      actions:
        - type: custom-response
          config:
            status_code: 401
            content: '{"error": "Invalid or missing API key"}'
            headers:
              content-type: "application/json"
```

### IP Allowlisting

```yaml
traffic_policy:
  on_http_request:
    # Only allow specific IPs (office, VPN, CI)
    - expressions:
        - "conn.client_ip not in ['203.0.113.10', '198.51.100.0/24']"
      actions:
        - type: custom-response
          config:
            status_code: 403
            content: "Forbidden"
```

### Webhook Verification

Verify incoming webhooks from services like GitHub or Stripe:

```yaml
endpoints:
  - name: webhooks
    url: "https://webhooks-dev.ngrok.dev"
    upstream:
      url: "http://localhost:9000"
    traffic_policy:
      on_http_request:
        - actions:
            - type: verify-webhook
              config:
                provider: github
                secret: "${GITHUB_WEBHOOK_SECRET}"
```

Ngrok verifies the webhook signature before the request reaches your local server. Invalid signatures get rejected at the edge, reducing noise during development.

### Response Header Manipulation

```yaml
traffic_policy:
  on_http_response:
    - actions:
        - type: add-headers
          config:
            headers:
              Strict-Transport-Security: "max-age=31536000"
              X-Frame-Options: "DENY"
              X-Content-Type-Options: "nosniff"
```

## Combining Multiple Policies

Traffic policy rules are evaluated in order. Combine authentication, rate limiting, and header manipulation in a single endpoint:

```yaml
endpoints:
  - name: staging-api
    url: "https://staging-api.ngrok.dev"
    upstream:
      url: "http://localhost:8080"
    traffic_policy:
      on_http_request:
        # Rule 1: Block non-allowlisted IPs
        - expressions:
            - "conn.client_ip not in ['203.0.113.10']"
          actions:
            - type: custom-response
              config:
                status_code: 403
                content: "Forbidden"

        # Rule 2: Rate limit allowed IPs
        - actions:
            - type: rate-limit
              config:
                name: staging-limit
                algorithm: sliding_window
                capacity: 200
                rate: 60s

      on_http_response:
        # Add security headers to all responses
        - actions:
            - type: add-headers
              config:
                headers:
                  X-Robots-Tag: "noindex, nofollow"
```

## Starting Tunnels

```bash
# Start a specific endpoint
ngrok start frontend

# Start multiple endpoints
ngrok start frontend api

# Start all endpoints from config
ngrok start --all

# Start with a project-specific config
ngrok start --config ./ngrok-dev.yml --all

# Override the upstream URL at runtime
ngrok start frontend --url https://myapp-dev.ngrok.dev --upstream-url http://localhost:4000
```

## Inspection and Debugging

ngrok's built-in inspector captures all traffic for debugging:

```bash
# Web inspector runs at http://localhost:4040 by default
# View requests, replay them, and inspect headers/bodies

# Enable inspection in config (enabled by default)
# In older tunnel format:
# inspect: true

# Replay a request from the inspector API
curl http://localhost:4040/api/requests/replay -d id=<request-id>
```

## Team Configuration Pattern

Share tunnel configuration through Git without exposing secrets:

```yaml
# ngrok-dev.yml (committed to repo)
version: "3"
agent:
  # Each developer sets their own authtoken via environment variable
  authtoken: "${NGROK_AUTHTOKEN}"

endpoints:
  - name: frontend
    url: "https://${NGROK_SUBDOMAIN:-dev}.ngrok.dev"
    upstream:
      url: "http://localhost:3000"

  - name: api
    url: "https://${NGROK_SUBDOMAIN:-dev}-api.ngrok.dev"
    upstream:
      url: "http://localhost:8080"
```

Each developer sets their own `NGROK_AUTHTOKEN` and `NGROK_SUBDOMAIN` environment variables. The configuration file is safe to commit because it contains no secrets.

## Best Practices

- Store the ngrok config in your project repo and gitignore nothing except the authtoken (use env vars for the token).
- Use custom domains for webhook endpoints — random ngrok URLs change on every restart, breaking webhook registrations.
- Add OAuth on every publicly accessible tunnel. Unauthenticated tunnels are indexed by scanners within minutes.
- Use traffic policies for rate limiting and access control — they execute at the ngrok edge before traffic reaches your machine.
- Run multiple endpoints for microservice architectures instead of tunneling a single reverse proxy.
- Enable the web inspector (`http://localhost:4040`) during development to debug request/response cycles.
- Use webhook verification policies to filter invalid payloads at the edge.

## Common Pitfalls

- Committing authtokens to version control — always use environment variables.
- Using CLI flags instead of a config file — flags are not reproducible or shareable.
- Running a single tunnel when multiple services need exposure — each service should get its own endpoint.
- No authentication on public tunnels — bots scan ngrok subdomains continuously.
- Not using the web inspector — it is the fastest way to debug webhook payloads and API issues.
- Using the deprecated `tunnels` field in v3 configs — migrate to `endpoints` with `url` and `upstream`.
