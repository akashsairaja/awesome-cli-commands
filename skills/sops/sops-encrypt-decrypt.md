---
id: sops-encrypt-decrypt
stackId: sops
type: skill
name: >-
  Encrypting & Decrypting Files with SOPS
description: >-
  Encrypt and decrypt secret files with SOPS — YAML, JSON, ENV, and binary
  formats using age keys, in-place editing, selective field encryption, and
  extracting individual secrets.
difficulty: intermediate
tags:
  - sops
  - encrypting
  - decrypting
  - files
  - security
  - testing
  - machine-learning
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Encrypting & Decrypting Files with SOPS skill?"
    answer: >-
      Encrypt and decrypt secret files with SOPS — YAML, JSON, ENV, and binary
      formats using age keys, in-place editing, selective field encryption,
      and extracting individual secrets. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Encrypting & Decrypting Files with SOPS require?"
    answer: >-
      Works with standard sops tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Encrypting & Decrypting Files with SOPS

## Overview
SOPS encrypts secret values in structured files while keeping keys in plaintext for readable diffs. Master the core encrypt/decrypt workflow to store secrets safely in Git.

## Why This Matters
- **Security** — secrets encrypted at rest in version control
- **Collaboration** — encrypted files can be committed and shared
- **Readability** — keys stay plaintext, only values are encrypted
- **Auditability** — git blame shows who changed which secrets

## How It Works

### Step 1: Generate Keys
```bash
# Generate age key pair
age-keygen -o age-key.txt
# Created file: age-key.txt
# Public key: age1abc123...

# Set environment variable for decryption
export SOPS_AGE_KEY_FILE=./age-key.txt
# Or set the key directly
export SOPS_AGE_KEY=$(cat age-key.txt | grep "AGE-SECRET-KEY")
```

### Step 2: Encrypt Files
```bash
# Encrypt YAML
sops --encrypt --age age1abc123... secrets.yaml > secrets.enc.yaml

# Encrypt in place
sops --encrypt --in-place --age age1abc123... secrets.yaml

# Encrypt JSON
sops --encrypt --age age1abc123... config.json > config.enc.json

# Encrypt .env file
sops --encrypt --age age1abc123... .env > .env.enc

# Encrypt with multiple recipients
sops --encrypt \
  --age age1alice...,age1bob...,age1cicd... \
  secrets.yaml > secrets.enc.yaml
```

### Step 3: Decrypt Files
```bash
# Decrypt to stdout
sops --decrypt secrets.enc.yaml

# Decrypt to file
sops --decrypt secrets.enc.yaml > secrets.yaml

# Decrypt in place
sops --decrypt --in-place secrets.enc.yaml

# Extract single value
sops --decrypt --extract '["database"]["password"]' secrets.enc.yaml

# Extract and use in script
DB_PASS=$(sops --decrypt --extract '["database"]["password"]' secrets.enc.yaml)
```

### Step 4: Edit Encrypted Files
```bash
# Open in editor (decrypts -> edit -> re-encrypts)
sops secrets.enc.yaml

# Use specific editor
EDITOR=nano sops secrets.enc.yaml
EDITOR="code --wait" sops secrets.enc.yaml

# Set values programmatically
sops --set '["database"]["password"] "new-password"' secrets.enc.yaml
```

### Step 5: Selective Encryption
```bash
# Encrypt only matching keys
sops --encrypt \
  --encrypted-regex '^(password|secret|key|token)$' \
  --age age1abc123... \
  config.yaml > config.enc.yaml

# Encrypt everything except matching keys
sops --encrypt \
  --unencrypted-regex '^(name|description|version)$' \
  --age age1abc123... \
  config.yaml > config.enc.yaml
```

## Best Practices
- Use --encrypted-regex to encrypt only sensitive fields
- Store age secret keys outside the repository
- Use environment variables for the secret key path
- Test decryption after encrypting (verify roundtrip)
- Use --extract for scripts that need single values

## Common Mistakes
- Committing unencrypted secret files (check before git add)
- Committing age secret keys to the repo
- Not testing decryption after first encryption
- Encrypting entire files when only some fields are sensitive
- Using --decrypt --in-place on the only copy (no backup)
