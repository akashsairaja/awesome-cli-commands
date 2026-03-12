---
id: mkcert-certificate-standards
stackId: mkcert
type: rule
name: Local Certificate Generation Standards
description: >-
  Enforce standards for mkcert certificate generation — domain naming, file
  naming conventions, directory structure, and required SAN entries for
  consistent team development.
difficulty: beginner
globs:
  - '**/certs/**'
  - '**/scripts/setup-certs*'
  - '**/.gitignore'
tags:
  - certificate-standards
  - san-entries
  - file-naming
  - domain-conventions
  - development-setup
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: 'Why must I include 127.0.0.1 and ::1 in mkcert certificates?'
    answer: >-
      Some applications resolve localhost to the IP address 127.0.0.1 (IPv4) or
      ::1 (IPv6) rather than the hostname. If the certificate only covers
      'localhost' but the connection uses the IP, TLS verification fails.
      Including all three ensures certificates work regardless of resolution.
  - question: Why use the .local TLD for development domains?
    answer: >-
      The .local TLD is reserved for local network use and will never conflict
      with real internet domains. Using production-like domains (myapp.com) in
      development can cause DNS resolution confusion and is not supported by
      some browsers for local certificates.
relatedItems:
  - mkcert-ca-key-security
  - mkcert-framework-integration
  - mkcert-docker-https
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Local Certificate Generation Standards

## Rule
All mkcert certificates MUST follow consistent naming, include required SAN entries, and be stored in the project's certs/ directory.

## Format
```bash
mkcert -cert-file certs/local-cert.pem -key-file certs/local-key.pem \
  localhost 127.0.0.1 ::1 <project>.local [additional-domains...]
```

## Requirements
1. **Always include** — localhost, 127.0.0.1, and ::1 in every certificate
2. **Custom domains** — use `.local` TLD for custom development domains
3. **File naming** — `local-cert.pem` and `local-key.pem` in `certs/` directory
4. **gitignore** — certs/ directory must be in .gitignore
5. **Setup script** — provide scripts/setup-certs.sh for reproducible generation
6. **Documentation** — list all required domains in README

## Examples

### Good
```bash
# Standard certificate with all required SANs
mkcert -cert-file certs/local-cert.pem -key-file certs/local-key.pem \
  localhost 127.0.0.1 ::1 \
  myapp.local api.myapp.local

# Wildcard for multi-service setups
mkcert -cert-file certs/local-cert.pem -key-file certs/local-key.pem \
  localhost 127.0.0.1 ::1 \
  "*.myapp.local" myapp.local
```

### Bad
```bash
# Missing localhost and IP addresses
mkcert myapp.local

# Non-standard file names
mkcert -cert-file cert.crt -key-file key.key myapp.local

# Using production-like domains
mkcert -cert-file certs/cert.pem myapp.com staging.myapp.com
```

## Project Structure
```
project/
├── certs/                  # gitignored
│   ├── local-cert.pem
│   └── local-key.pem
├── scripts/
│   └── setup-certs.sh      # Reproducible generation
├── .gitignore              # includes certs/
└── README.md               # Documents cert setup
```

## Enforcement
Include cert generation in project Makefile. Verify cert existence in development server startup. Document required domains in README.
