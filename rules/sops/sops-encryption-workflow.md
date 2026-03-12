---
id: sops-encryption-workflow
stackId: sops
type: rule
name: SOPS Encryption Workflow Rules
description: >-
  Follow proper SOPS workflows — encrypt before committing, verify encryption
  status in CI, use sops exec-env for runtime decryption, and never store
  decrypted files on disk in production.
difficulty: intermediate
globs:
  - '**/.sops.yaml'
  - '**/*.enc.*'
  - '**/*.sh'
tags:
  - encryption-workflow
  - runtime-decryption
  - exec-env
  - git-secrets
  - ci-validation
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
  - question: How do I use SOPS secrets at runtime without writing to disk?
    answer: >-
      Use 'sops exec-env secrets.enc.yaml command' to inject decrypted values as
      environment variables for the duration of the command. Use 'sops exec-file
      secrets.enc.yaml command {}' to create a temporary decrypted file that is
      automatically deleted when the command exits. Both avoid persisting
      plaintext secrets on disk.
  - question: How do I verify SOPS files are encrypted before committing?
    answer: >-
      Run 'sops --decrypt file.enc.yaml > /dev/null 2>&1' — it exits 0 if the
      file is validly encrypted. Add this as a pre-commit hook for all *.enc.*
      files and in CI as a validation step. Also add non-encrypted secret
      patterns to .gitignore as a safety net.
relatedItems:
  - sops-config-conventions
  - sops-key-management
version: 1.0.0
lastUpdated: '2026-03-12'
---

# SOPS Encryption Workflow Rules

## Rule
Secret files MUST be encrypted before committing. CI MUST verify all secret files are encrypted. Never store decrypted secrets on disk in production. Use sops exec-env or exec-file for runtime access.

## Workflow
```bash
# 1. Create/edit secrets (opens in $EDITOR, saves encrypted)
sops secrets/production.enc.yaml

# 2. Verify file is encrypted before committing
sops --decrypt secrets/production.enc.yaml > /dev/null 2>&1
# Exit 0 = valid encrypted file

# 3. Commit encrypted file
git add secrets/production.enc.yaml
git commit -m "chore: update production database credentials"

# 4. Runtime decryption (never to disk)
sops exec-env secrets/production.enc.yaml 'node server.js'
# Secrets available as environment variables during execution
```

## Good Examples
```bash
# Edit in-place (encrypts on save)
sops secrets/staging.enc.yaml

# Decrypt to stdout (pipe, never to file)
sops --decrypt secrets/production.enc.yaml | kubectl apply -f -

# Runtime: inject as env vars
sops exec-env secrets/production.enc.yaml './start-server.sh'

# Runtime: inject as temporary file
sops exec-file secrets/production.enc.yaml 'cat {}'

# Rotate encryption keys
sops --rotate --in-place secrets/production.enc.yaml

# Verify encryption in CI
for f in secrets/*.enc.yaml; do
  if ! sops --decrypt "$f" > /dev/null 2>&1; then
    echo "ERROR: $f is not properly encrypted"
    exit 1
  fi
done
```

## Bad Examples
```bash
# BAD: Decrypting to a file on disk
sops --decrypt secrets/production.enc.yaml > secrets/production.yaml
# Plaintext secrets now on disk — can be accidentally committed

# BAD: Committing decrypted secrets
git add secrets/production.yaml  # PLAINTEXT!

# BAD: No CI verification — encrypted status not checked
# A developer could accidentally commit an unencrypted file
```

## Enforcement
- Pre-commit hook: verify all *.enc.* files are encrypted
- CI: validate encryption status of all secret files
- .gitignore: ignore all non-.enc secret file patterns
- Use sops exec-env instead of decrypting to disk
