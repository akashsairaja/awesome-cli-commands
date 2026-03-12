---
id: sops-key-management
stackId: sops
type: rule
name: SOPS Key Management Practices
description: >-
  Manage SOPS encryption keys securely — use cloud KMS for production, age keys
  for development, implement key rotation, and maintain proper access controls
  per environment.
difficulty: advanced
globs:
  - '**/.sops.yaml'
  - '**/*.enc.*'
tags:
  - key-management
  - kms
  - age
  - key-rotation
  - access-control
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
  - question: Should I use age or cloud KMS keys with SOPS?
    answer: >-
      Use cloud KMS (AWS KMS, GCP KMS) for production and staging — they provide
      hardware-backed security, access logging via CloudTrail, automatic key
      rotation, and IAM-based access control. Use age keys for development —
      they work offline, are simple to set up, and do not require cloud
      credentials.
  - question: How do I rotate SOPS encryption keys?
    answer: >-
      Use 'sops --rotate --in-place --add-kms NEW_KEY --rm-kms OLD_KEY
      file.enc.yaml' to re-encrypt with a new key. For team member changes, use
      --add-age or --rm-age. Rotation re-encrypts the data key with the new
      master key without changing the actual secrets. Schedule quarterly
      rotation as a security practice.
relatedItems:
  - sops-config-conventions
  - sops-encryption-workflow
version: 1.0.0
lastUpdated: '2026-03-12'
---

# SOPS Key Management Practices

## Rule
Production MUST use cloud KMS (AWS, GCP, Azure). Development MAY use age keys. Implement key rotation quarterly. Maintain separate keys per environment with distinct access policies.

## Key Provider Hierarchy
| Environment | Provider | Rotation | Access |
|-------------|----------|----------|--------|
| Production | AWS KMS / GCP KMS | Quarterly | IAM restricted |
| Staging | AWS KMS / GCP KMS | Quarterly | Team-wide |
| Development | age | Annual | Individual |
| CI/CD | AWS KMS + IAM role | Auto | Service account |

## Good Examples
```yaml
# .sops.yaml — multi-provider setup
creation_rules:
  # Production: AWS KMS with automatic rotation
  - path_regex: secrets/prod/.*
    kms: "arn:aws:kms:us-east-1:123456789:key/prod-key"
    # KMS key has automatic rotation enabled

  # Staging: separate KMS key
  - path_regex: secrets/staging/.*
    kms: "arn:aws:kms:us-east-1:123456789:key/staging-key"

  # Development: age key (no cloud dependency)
  - path_regex: secrets/dev/.*
    age: >-
      age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p,
      age1abc...second-developer-key
```

```bash
# Generate age key for development
age-keygen -o ~/.config/sops/age/keys.txt

# Rotate SOPS encryption to new key
sops --rotate --in-place \
  --add-kms "arn:aws:kms:us-east-1:123456789:key/new-key" \
  --rm-kms "arn:aws:kms:us-east-1:123456789:key/old-key" \
  secrets/production.enc.yaml

# Add a new team member's age key
sops --rotate --in-place \
  --add-age "age1newmemberkey..." \
  secrets/dev.enc.yaml
```

## Bad Examples
```bash
# BAD: PGP keys in production (complex key management)
sops --pgp "FINGERPRINT" secrets.yaml
# Use cloud KMS instead

# BAD: Sharing a single age key across the team
# If one person's laptop is compromised, all secrets are exposed

# BAD: No key rotation
# Same key used for 3 years — no rotation plan
```

## Enforcement
- Quarterly key rotation with automated SOPS rotate command
- IAM policies restricting KMS key access per environment
- Audit KMS key usage with CloudTrail
- Document key custodians and rotation schedule
