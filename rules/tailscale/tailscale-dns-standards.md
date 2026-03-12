---
id: tailscale-dns-standards
stackId: tailscale
type: rule
name: MagicDNS & DNS Configuration Standards
description: >-
  Standards for Tailscale DNS configuration — MagicDNS naming, split DNS
  routing, custom search domains, and consistent service discovery across the
  tailnet.
difficulty: beginner
globs:
  - '**/.env*'
  - '**/docker-compose*.yml'
  - '**/*.conf'
tags:
  - tailscale
  - dns
  - magicdns
  - service-discovery
  - naming
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
  - question: Why should I use MagicDNS instead of Tailscale IP addresses?
    answer: >-
      Tailscale IP addresses (100.x.y.z) can change when devices are
      re-registered or replaced. MagicDNS names (hostname.tailnet.ts.net)
      resolve to the current IP automatically. Using MagicDNS means your
      configurations survive device replacements without manual IP updates.
  - question: What is split DNS in Tailscale?
    answer: >-
      Split DNS routes DNS queries for specific domains through specific
      nameservers. For example, queries for internal.company.com go through your
      internal DNS server (accessible via subnet router), while all other
      queries use public DNS. This lets you access internal services by domain
      name.
relatedItems:
  - tailscale-network-architect
  - tailscale-acl-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# MagicDNS & DNS Configuration Standards

## Rule
All Tailscale networks MUST use MagicDNS for service discovery. Never use raw Tailscale IP addresses in configuration files or code.

## Format
```
{hostname}.{tailnet-name}.ts.net
```

## Rules
1. ALWAYS use MagicDNS names, never 100.x.y.z IP addresses
2. Use descriptive hostnames matching device function
3. Configure split DNS for internal domain routing
4. Set global nameservers for reliable DNS resolution
5. Use search domains for shortened names

## Device Naming for MagicDNS
```bash
# Set descriptive hostname
tailscale up --hostname=api-server-prod

# Accessible as:
# api-server-prod.your-tailnet.ts.net
# api-server-prod (with search domain configured)
```

## Split DNS Configuration
```json
{
  "dns": {
    "nameservers": ["1.1.1.1", "8.8.8.8"],
    "routes": {
      "internal.company.com": ["10.0.0.53"],
      "staging.company.com": ["10.0.1.53"]
    },
    "domains": ["your-tailnet.ts.net"]
  }
}
```

## Configuration Examples

### Good
```bash
# Using MagicDNS in configs
DATABASE_URL=postgresql://user:pass@db-primary.ts.net:5432/myapp
REDIS_URL=redis://cache-01.ts.net:6379
API_URL=https://api-server.ts.net:443
```

### Bad
```bash
# Hardcoded Tailscale IPs (breaks when devices change)
DATABASE_URL=postgresql://user:pass@100.64.0.5:5432/myapp
REDIS_URL=redis://100.64.0.12:6379
```

## Enforcement
Grep for 100.x.y.z patterns in configuration files.
Use MagicDNS names in all documentation.
Verify DNS resolution works before deploying configurations.
