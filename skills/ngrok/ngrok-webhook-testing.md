---
id: ngrok-webhook-testing
stackId: ngrok
type: skill
name: Test Webhooks Locally with Ngrok
description: >-
  Set up ngrok for local webhook development — Stripe, GitHub, and Twilio
  webhook testing with payload inspection, request replay, and stable URLs.
difficulty: beginner
tags:
  - ngrok
  - test
  - webhooks
  - locally
  - security
  - debugging
  - api
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Test Webhooks Locally with Ngrok skill?"
    answer: >-
      Set up ngrok for local webhook development — Stripe, GitHub, and Twilio
      webhook testing with payload inspection, request replay, and stable
      URLs. This skill provides a structured workflow for development tasks.
  - question: "What tools and setup does Test Webhooks Locally with Ngrok require?"
    answer: >-
      Requires npm/yarn/pnpm installed. Works with ngrok projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Test Webhooks Locally with Ngrok

## Overview
Webhooks require a publicly accessible URL, but your development server runs on localhost. Ngrok creates a secure tunnel that gives your local server a public HTTPS URL, letting you receive and debug webhooks from Stripe, GitHub, Twilio, and other services.

## Why This Matters
- **Rapid iteration** — test webhook handlers without deploying
- **Payload inspection** — see exactly what the service sends
- **Request replay** — re-test without retriggering the webhook
- **Debugging** — full request/response visibility

## How It Works

### Step 1: Start Your Local Server
```bash
# Start your development server (e.g., Next.js API route)
npm run dev
# Server running on http://localhost:3000
```

### Step 2: Create an Ngrok Tunnel
```bash
# Basic tunnel
ngrok http 3000

# With custom subdomain (paid plan)
ngrok http --domain=myapp-dev.ngrok.dev 3000

# With request inspection
ngrok http 3000 --inspect
```

### Step 3: Configure Webhook Provider

#### Stripe
```bash
# Use Stripe CLI (recommended) or ngrok URL
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Or set ngrok URL in Stripe Dashboard
# Webhook endpoint: https://your-subdomain.ngrok.dev/api/webhooks/stripe
```

#### GitHub
```bash
# In GitHub repo Settings > Webhooks > Add webhook
# Payload URL: https://your-subdomain.ngrok.dev/api/webhooks/github
# Content type: application/json
# Secret: your-webhook-secret
```

#### Twilio
```bash
# In Twilio Console > Phone Numbers > Configure
# Webhook URL: https://your-subdomain.ngrok.dev/api/webhooks/twilio
```

### Step 4: Inspect Requests
```bash
# Open ngrok inspection UI
open http://localhost:4040

# See:
# - Full request headers and body
# - Response status and body
# - Timing information
# - Click "Replay" to re-send any request
```

### Step 5: Use ngrok.yml for Consistent Setup
```yaml
# ~/.config/ngrok/ngrok.yml (or ~/.ngrok2/ngrok.yml)
version: "3"
agent:
  authtoken: your-auth-token

tunnels:
  web:
    addr: 3000
    proto: http
    domain: myapp-dev.ngrok.dev
    inspect: true

  api:
    addr: 8080
    proto: http
    domain: myapi-dev.ngrok.dev
```

```bash
# Start specific tunnel
ngrok start web

# Start all tunnels
ngrok start --all
```

## Best Practices
- Use custom domains for stable webhook URLs (do not reconfigure on restart)
- Enable request inspection for debugging (localhost:4040)
- Use ngrok.yml for reproducible tunnel configuration
- Verify webhook signatures in your handler (do not trust blindly)
- Use Stripe CLI for Stripe webhooks (better developer experience)
- Set up separate tunnels for frontend and API servers

## Common Mistakes
- Using free plan random URLs for webhook endpoints (break on restart)
- Not verifying webhook signatures (security vulnerability)
- Forgetting to update webhook URL after ngrok restart
- Not using the inspection UI for debugging (reinventing the wheel)
- Running ngrok without a configuration file (inconsistent setup)
