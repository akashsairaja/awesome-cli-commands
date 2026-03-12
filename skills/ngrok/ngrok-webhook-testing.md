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
  - webhooks
  - stripe
  - github
  - local-development
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - ngrok installed and authenticated
  - Local development server running
faq:
  - question: How do I test Stripe webhooks locally?
    answer: >-
      Two options: (1) Use the Stripe CLI with 'stripe listen --forward-to
      localhost:3000/api/webhooks/stripe' — it automatically routes Stripe
      events to your local server. (2) Use ngrok with a stable domain and set it
      as the webhook endpoint in the Stripe Dashboard. The Stripe CLI is
      recommended for development.
  - question: How do I replay a webhook request with ngrok?
    answer: >-
      Open ngrok's inspection UI at localhost:4040. Find the request you want to
      replay in the request list. Click the 'Replay' button to re-send the exact
      same request to your local server. This lets you test your webhook handler
      repeatedly without triggering the event in the source service.
  - question: Why do I need a stable ngrok URL for webhooks?
    answer: >-
      Webhook URLs are configured in external services (Stripe, GitHub). With
      ngrok's free plan, URLs change every restart, requiring you to update the
      configuration each time. A custom domain (paid plan) gives you a stable
      URL that persists across sessions.
relatedItems:
  - ngrok-tunnel-architect
  - ngrok-config-setup
version: 1.0.0
lastUpdated: '2026-03-11'
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
