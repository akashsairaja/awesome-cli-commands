---
id: mkcert-certificate-management
stackId: mkcert
type: skill
name: mkcert Certificate Lifecycle Management
description: >-
  Manage mkcert certificates across teams — generation scripts, rotation, CA
  installation verification, and troubleshooting trust issues in development
  environments.
difficulty: intermediate
tags:
  - mkcert
  - certificate
  - lifecycle
  - management
  - security
  - api
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the mkcert Certificate Lifecycle Management skill?"
    answer: >-
      Manage mkcert certificates across teams — generation scripts, rotation,
      CA installation verification, and troubleshooting trust issues in
      development environments. This skill provides a structured workflow for
      development tasks.
  - question: "What tools and setup does mkcert Certificate Lifecycle Management require?"
    answer: >-
      Requires pip/poetry installed. Works with mkcert projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# mkcert Certificate Lifecycle Management

## Overview
Managing mkcert certificates across a development team requires consistent generation scripts, CA verification, and troubleshooting procedures. This skill covers the complete lifecycle from initial setup to rotation and team onboarding.

## Why This Matters
- **Team consistency** — everyone needs the same certificate setup
- **Onboarding speed** — new developers get HTTPS working in minutes
- **Troubleshooting** — common trust issues have known solutions
- **Security hygiene** — certificates and CA keys need proper handling

## How It Works

### Step 1: Create a Setup Script
```bash
#!/bin/bash
# scripts/setup-certs.sh

set -euo pipefail

CERT_DIR="./certs"
DOMAINS="localhost 127.0.0.1 ::1 myapp.local api.myapp.local"

echo "Checking mkcert installation..."
if ! command -v mkcert &> /dev/null; then
    echo "mkcert not found. Install it first:"
    echo "  macOS: brew install mkcert"
    echo "  Linux: see https://github.com/FiloSottile/mkcert#installation"
    exit 1
fi

echo "Verifying CA is installed..."
if ! mkcert -install 2>/dev/null; then
    echo "Failed to install CA. Run with admin privileges."
    exit 1
fi

echo "Generating certificates..."
mkdir -p "$CERT_DIR"
mkcert -cert-file "$CERT_DIR/local-cert.pem" \
       -key-file "$CERT_DIR/local-key.pem" \
       $DOMAINS

echo "Certificates generated in $CERT_DIR/"
echo "Domains: $DOMAINS"

# Verify .gitignore includes certs/
if ! grep -q "certs/" .gitignore 2>/dev/null; then
    echo "certs/" >> .gitignore
    echo "Added certs/ to .gitignore"
fi

echo "Done! HTTPS is ready for local development."
```

### Step 2: Verify Certificate Details
```bash
# View certificate details
openssl x509 -in certs/local-cert.pem -text -noout | grep -A1 "Subject Alternative Name"

# Check certificate expiration
openssl x509 -in certs/local-cert.pem -enddate -noout

# Verify the certificate chain
openssl verify -CAfile "$(mkcert -CAROOT)/rootCA.pem" certs/local-cert.pem
```

### Step 3: Troubleshoot Common Issues
```bash
# Issue: Browser shows "Not Secure" despite mkcert
# Fix: Reinstall the CA
mkcert -install

# Issue: Firefox does not trust mkcert (NSS issue)
# Fix: Install NSS tools and reinstall
sudo apt install libnss3-tools  # Linux
brew install nss                 # macOS
mkcert -install

# Issue: Certificate expired
# Fix: Regenerate (mkcert certs last ~2 years)
mkcert -cert-file certs/local-cert.pem -key-file certs/local-key.pem localhost

# Issue: New domain needed
# Fix: Regenerate with all domains (cannot add to existing cert)
mkcert -cert-file certs/local-cert.pem -key-file certs/local-key.pem \
  localhost 127.0.0.1 myapp.local new-service.myapp.local

# Check CA root location
mkcert -CAROOT
```

### Step 4: Add to Makefile for Team Use
```makefile
.PHONY: certs setup

certs:
	@bash scripts/setup-certs.sh

setup: certs
	@echo "Installing dependencies..."
	npm install
	@echo "Setup complete. Run 'make dev' to start."
```

## Best Practices
- Include a setup-certs.sh script in every project that needs HTTPS
- Add the script to the project Makefile for one-command setup
- Document mkcert installation in the project README
- Verify CA installation as part of the setup script
- Use consistent cert file names across projects (local-cert.pem, local-key.pem)

## Common Mistakes
- Assuming certificates last forever (they expire after ~2 years)
- Trying to add domains to existing certificates (must regenerate)
- Not installing NSS tools for Firefox support on Linux
- Sharing the rootCA-key.pem file between team members
