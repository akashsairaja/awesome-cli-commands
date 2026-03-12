---
id: ngrok-usage-boundaries
stackId: ngrok
type: rule
name: Ngrok Usage Boundaries
description: >-
  Define when to use and not use ngrok — development use cases, production
  alternatives, and guidelines for transitioning from ngrok to proper
  infrastructure.
difficulty: beginner
globs:
  - '**/ngrok.yml'
  - '**/.env*'
tags:
  - ngrok
  - development
  - production
  - guidelines
  - infrastructure
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
  - question: Can I use ngrok in production?
    answer: >-
      No. Ngrok is designed for development, testing, and demos. It lacks the
      reliability, SLA guarantees, and scalability needed for production. Use
      proper cloud hosting (Vercel, AWS, GCP) for production services. Ngrok is
      perfect for webhook testing, demos, and local development sharing.
  - question: What should I use instead of ngrok for production?
    answer: >-
      For webhook endpoints: deploy to Vercel, Netlify, or AWS Lambda. For
      tunneling to internal services: use Tailscale or Cloudflare Tunnel. For
      API hosting: use proper cloud infrastructure with custom domains. Ngrok is
      great for development but not designed for production reliability.
relatedItems:
  - ngrok-tunnel-architect
  - ngrok-security-rules
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Ngrok Usage Boundaries

## Rule
Ngrok is a DEVELOPMENT tool. It MUST NOT be used as a production hosting solution. Know when to transition to proper infrastructure.

## Appropriate Use Cases
| Use Case | Appropriate |
|----------|-----------|
| Webhook testing (Stripe, GitHub) | Yes |
| Sharing local dev with team | Yes |
| Mobile app testing against local API | Yes |
| Demo to stakeholders | Yes (with auth) |
| Staging environment | Acceptable (with OAuth) |
| Production traffic | NEVER |
| Permanent webhook endpoint | NEVER |
| Customer-facing service | NEVER |

## Transition Triggers
Move from ngrok to proper infrastructure when:
1. The service needs 24/7 availability
2. Multiple users or customers will access it
3. SLA or uptime requirements exist
4. The URL needs to be permanent and branded
5. Traffic exceeds development-level volumes

## Alternatives for Production
| Need | Alternative |
|------|-----------|
| Webhook endpoints | Vercel/Netlify serverless functions |
| API hosting | AWS/GCP/Azure with proper domain |
| Tunnel to internal services | Tailscale, Cloudflare Tunnel |
| Load testing | Deploy to cloud environment |

## Rules
1. NEVER use ngrok for production customer traffic
2. NEVER rely on ngrok for uptime-critical services
3. Always have a plan to replace ngrok before launch
4. Document which ngrok tunnels exist and their purpose
5. Set expiration reminders for temporary tunnels

## Examples

### Good
- Using ngrok for Stripe webhook development, Vercel for production
- Demoing to stakeholders with OAuth-protected tunnel
- Testing mobile app against local API via ngrok

### Bad
- Customer-facing API running through ngrok
- Production webhook handler on an ngrok URL
- ngrok as a permanent VPN replacement

## Enforcement
Review infrastructure architecture for ngrok dependencies before production launch.
Include ngrok-to-production migration in project planning.
