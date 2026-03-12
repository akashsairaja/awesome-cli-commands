---
id: sops-key-management
stackId: sops
type: skill
name: SOPS Key Management & Rotation
description: >-
  Manage encryption keys for SOPS — generating and distributing age keys,
  integrating with AWS KMS and GCP KMS, key rotation procedures, and handling
  team member onboarding and offboarding.
difficulty: advanced
tags:
  - key-management
  - rotation
  - onboarding
  - offboarding
  - kms
  - recovery
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - SOPS installed
  - age or cloud KMS configured
faq:
  - question: What is the difference between key rotation and data key rotation?
    answer: >-
      Data key rotation (sops --rotate): generates a new random data key and
      re-encrypts the file content. The master keys (age/KMS) remain the same.
      Master key rotation: generate new age key or KMS key, update .sops.yaml,
      then run sops updatekeys to re-encrypt data keys with new master keys.
  - question: What do I do when a team member leaves?
    answer: >-
      1) Remove their age public key from .sops.yaml. 2) Run sops updatekeys on
      all encrypted files. 3) Run sops --rotate on all files. 4) Rotate any
      actual secrets they had access to (passwords, tokens). Steps 2-3 ensure
      they can't decrypt even if they kept their private key.
  - question: How do I recover if all age keys are lost?
    answer: >-
      If you also use cloud KMS, you can still decrypt (KMS handles key
      management). Generate new age keys and update .sops.yaml. If ALL keys (age
      AND KMS) are lost, the secrets are unrecoverable. Always maintain at least
      two independent key types for redundancy.
relatedItems:
  - sops-encrypt-decrypt
  - sops-yaml-rules
  - sops-secret-manager
version: 1.0.0
lastUpdated: '2026-03-12'
---

# SOPS Key Management & Rotation

## Overview
Key management is the foundation of SOPS security. Handle key generation, distribution, rotation, and access revocation properly to maintain secret security as your team evolves.

## Why This Matters
- **Access control** — only authorized people can decrypt secrets
- **Rotation** — regular key rotation limits exposure from compromised keys
- **Onboarding** — new team members need decryption access
- **Offboarding** — departing members must lose access

## How It Works

### Step 1: Key Generation & Distribution
```bash
# Generate age key for new team member
age-keygen -o alice-key.txt
# Public key: age1alice...
# Secret key: AGE-SECRET-KEY-...

# Team member stores secret key securely
mkdir -p ~/.config/sops/age
cp alice-key.txt ~/.config/sops/age/keys.txt
chmod 600 ~/.config/sops/age/keys.txt

# Set env for SOPS
export SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt

# Share ONLY the public key with the team
echo "age1alice..." >> team-public-keys.txt
```

### Step 2: Cloud KMS Integration
```bash
# AWS KMS
# .sops.yaml
# creation_rules:
#   - path_regex: secrets/.*
#     kms: "arn:aws:kms:us-east-1:123456:key/abc-def-123"
#     age: "age1alice...,age1bob..."

# GCP KMS
# creation_rules:
#   - path_regex: secrets/.*
#     gcp_kms: "projects/myproject/locations/global/keyRings/sops/cryptoKeys/sops-key"

# Azure Key Vault
# creation_rules:
#   - path_regex: secrets/.*
#     azure_keyvault: "https://myvault.vault.azure.net/keys/sops-key/abc123"

# CI/CD uses KMS (no age key file needed)
# IAM role grants kms:Decrypt permission
```

### Step 3: Key Rotation
```bash
# Rotate data keys (re-encrypts with current .sops.yaml recipients)
sops --rotate --in-place secrets/app.enc.yaml

# Rotate all encrypted files
find . -name "*.enc.yaml" -exec sops --rotate --in-place {} \;
find . -name "*.enc.json" -exec sops --rotate --in-place {} \;

# Verify rotation worked
sops --decrypt secrets/app.enc.yaml > /dev/null && echo "OK" || echo "FAIL"

# Update keys (when .sops.yaml recipients changed)
sops updatekeys secrets/app.enc.yaml
find . -name "*.enc.yaml" -exec sops updatekeys {} \;
```

### Step 4: Team Member Offboarding
```bash
# 1. Remove their public key from .sops.yaml
# (edit creation_rules, remove age1departed...)

# 2. Update all encrypted files with new recipient list
find . -name "*.enc.yaml" -exec sops updatekeys --yes {} \;

# 3. Rotate data keys (departed member had access to old data key)
find . -name "*.enc.yaml" -exec sops --rotate --in-place {} \;

# 4. Rotate any secrets the departed member knew
# (database passwords, API keys, etc.)

# 5. Verify
sops --decrypt secrets/app.enc.yaml > /dev/null && echo "OK"

# 6. Commit changes
git add .sops.yaml secrets/
git commit -m "chore: rotate keys after team member offboarding"
```

### Step 5: Emergency Key Recovery
```bash
# If age key is lost but KMS still works
sops --decrypt secrets/app.enc.yaml   # KMS key decrypts

# Generate new age key
age-keygen -o new-key.txt

# Update .sops.yaml with new public key
# Re-encrypt all files
find . -name "*.enc.yaml" -exec sops updatekeys {} \;

# If all keys are lost — secrets are unrecoverable
# Always maintain at least 2 key types (age + KMS)
```

## Best Practices
- Use both age AND cloud KMS (redundancy)
- Rotate data keys after every team membership change
- Store age secret keys in password managers, not plain files
- Use separate KMS keys per environment
- Document key ownership (who has access to what)
- Rotate actual secrets (not just SOPS keys) after offboarding

## Common Mistakes
- Not rotating after offboarding (departed member can still decrypt)
- Only using age keys (lost key = lost secrets)
- Sharing secret keys via Slack or email (use password managers)
- Not documenting which humans have which keys
- Forgetting to rotate the actual secrets after key rotation
