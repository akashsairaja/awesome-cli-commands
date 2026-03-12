---
id: mkcert-ca-key-security
stackId: mkcert
type: rule
name: mkcert CA Key Security Policy
description: >-
  Enforce security policies for mkcert CA keys — never commit, never share,
  never mount in containers, and proper file permissions for the root CA private
  key.
difficulty: beginner
globs:
  - '**/.gitignore'
  - '**/docker-compose*.yml'
  - '**/certs/**'
tags:
  - ca-key-security
  - certificate-safety
  - gitignore
  - secret-protection
  - mkcert-security
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Why is the mkcert CA key dangerous to share?
    answer: >-
      The rootCA-key.pem can sign certificates for ANY domain that your machine
      will trust. If an attacker obtains this key, they can create trusted
      certificates for google.com, your bank, or any other site — enabling
      man-in-the-middle attacks on your machine.
  - question: Can I share mkcert-generated certificates with my team?
    answer: >-
      You can share the generated certificates (local-cert.pem, local-key.pem)
      but each team member must install their own CA with 'mkcert -install' for
      the certificates to be trusted on their machine. The CA installation is
      per-machine.
relatedItems:
  - mkcert-certificate-standards
  - mkcert-local-https-specialist
  - mkcert-certificate-management
version: 1.0.0
lastUpdated: '2026-03-11'
---

# mkcert CA Key Security Policy

## Rule
The mkcert root CA private key (rootCA-key.pem) MUST never be shared, committed to Git, or mounted into containers. Only the CA certificate (rootCA.pem) may be distributed.

## Format
```bash
# Safe: share the CA certificate for trust
cp "$(mkcert -CAROOT)/rootCA.pem" ./certs/ca.pem

# NEVER: share or expose the CA key
# cp "$(mkcert -CAROOT)/rootCA-key.pem" anywhere  # FORBIDDEN
```

## Requirements
1. **Never commit** — rootCA-key.pem must never appear in any Git repository
2. **Never share** — each developer generates their own CA with `mkcert -install`
3. **Never mount in containers** — only mount rootCA.pem (certificate), not the key
4. **File permissions** — CA key should be readable only by the owner (600)
5. **gitignore** — add patterns for CA files and generated certificates
6. **Awareness** — team must understand that the CA key can sign ANY certificate

## Examples

### Good — .gitignore
```gitignore
# mkcert certificates
certs/
*.pem
*.key
*.cert
# Never commit CA files
rootCA*.pem
```

### Good — Docker volume mount
```yaml
# Only mount the CA certificate, never the key
volumes:
  - "$(mkcert -CAROOT)/rootCA.pem:/usr/local/share/ca-certificates/rootCA.pem:ro"
```

### Bad
```yaml
# NEVER mount the entire CAROOT directory (includes the private key)
volumes:
  - "$(mkcert -CAROOT):/certs:ro"  # DANGEROUS: exposes rootCA-key.pem

# NEVER commit certificates
git add certs/local-cert.pem  # Should be gitignored
```

## Enforcement
Add rootCA-key.pem patterns to .gitignore and global gitignore. Use git-secrets or gitleaks to detect accidental CA key commits.
