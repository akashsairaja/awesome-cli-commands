---
id: mkcert-hosts-file-management
stackId: mkcert
type: rule
name: Local DNS and Hosts File Standards
description: >-
  Enforce standards for managing /etc/hosts entries alongside mkcert
  certificates — consistent domain naming, cleanup procedures, and alternative
  DNS solutions for local development.
difficulty: beginner
globs:
  - '**/scripts/setup-hosts*'
  - '**/Makefile'
  - '**/README*'
tags:
  - hosts-file
  - local-dns
  - domain-management
  - development-setup
  - cleanup-scripts
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Do I need to edit /etc/hosts to use mkcert?
    answer: >-
      Only if you use custom domains (e.g., myapp.local). If you only use
      localhost/127.0.0.1, no hosts file changes are needed. For custom domains,
      add '127.0.0.1 myapp.local' to /etc/hosts so your browser can resolve the
      domain to your local machine.
  - question: Is there an alternative to editing /etc/hosts?
    answer: >-
      Yes. Use dnsmasq to resolve all *.local domains to 127.0.0.1
      automatically. On macOS, use 'brew install dnsmasq' and configure it to
      resolve .local to localhost. This eliminates per-project hosts file edits.
relatedItems:
  - mkcert-certificate-standards
  - mkcert-ca-key-security
  - mkcert-local-https-specialist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Local DNS and Hosts File Standards

## Rule
All custom local development domains MUST be registered in /etc/hosts and documented in the project README. Use .local TLD and provide setup/cleanup scripts.

## Format
```bash
# /etc/hosts entry format
127.0.0.1  myapp.local api.myapp.local
```

## Requirements
1. **TLD convention** — use `.local` for all development domains
2. **Documentation** — list required hosts entries in README
3. **Setup script** — provide script to add entries (requires sudo)
4. **Cleanup script** — provide script to remove entries when done
5. **Consistency** — hosts entries must match mkcert certificate SANs
6. **No production domains** — never override real domains in hosts file

## Examples

### Good — Setup Script
```bash
#!/bin/bash
# scripts/setup-hosts.sh
DOMAINS="myapp.local api.myapp.local"

for domain in $DOMAINS; do
  if ! grep -q "$domain" /etc/hosts; then
    echo "127.0.0.1  $domain" | sudo tee -a /etc/hosts
    echo "Added $domain to /etc/hosts"
  else
    echo "$domain already in /etc/hosts"
  fi
done
```

### Good — Cleanup Script
```bash
#!/bin/bash
# scripts/cleanup-hosts.sh
DOMAINS="myapp.local api.myapp.local"

for domain in $DOMAINS; do
  sudo sed -i '' "/$domain/d" /etc/hosts  # macOS
  # sudo sed -i "/$domain/d" /etc/hosts   # Linux
  echo "Removed $domain from /etc/hosts"
done
```

### Bad
```bash
# Overriding real domains
echo "127.0.0.1 google.com" | sudo tee -a /etc/hosts

# No documentation — teammate has no idea what domains are needed
# No cleanup — stale entries accumulate
```

## Enforcement
Include hosts setup in project Makefile. Verify domain resolution in development server startup. Document cleanup in project offboarding checklist.
