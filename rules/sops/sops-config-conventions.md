---
id: sops-config-conventions
stackId: sops
type: rule
name: .sops.yaml Configuration Standards
description: >-
  Configure SOPS with a .sops.yaml file for automatic encryption rules — define
  creation rules per file pattern, specify KMS keys per environment, and enforce
  encrypted_regex for partial encryption.
difficulty: beginner
globs:
  - '**/.sops.yaml'
  - '**/*.enc.*'
  - '**/*.enc.yaml'
  - '**/*.enc.json'
tags:
  - sops-config
  - encryption-rules
  - kms
  - age
  - creation-rules
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
  - question: What is .sops.yaml and why is it important?
    answer: >-
      The .sops.yaml file defines automatic encryption rules for SOPS — which
      KMS keys to use for which files, what fields to encrypt (encrypted_regex),
      and per-environment key configuration. Without it, every developer must
      specify keys manually on every encryption operation, leading to
      inconsistency and errors.
  - question: What is encrypted_regex and when should I use it?
    answer: >-
      encrypted_regex specifies which YAML/JSON keys to encrypt using a regular
      expression. Only matching keys get encrypted while structure remains
      readable. Use it to encrypt only sensitive values (password, secret,
      token) while keeping non-sensitive config (host, port) in plaintext for
      easier code review and diffing.
relatedItems:
  - sops-encryption-workflow
  - sops-key-management
version: 1.0.0
lastUpdated: '2026-03-12'
---

# .sops.yaml Configuration Standards

## Rule
Every project using SOPS MUST have a .sops.yaml configuration file in the repository root. Define creation rules for each environment and file pattern. Always use KMS keys for production.

## Format
```yaml
# .sops.yaml
creation_rules:
  - path_regex: environments/production/.*
    kms: "arn:aws:kms:us-east-1:123456789:key/prod-key-id"
    encrypted_regex: "^(password|secret|token|key|api_key)$"

  - path_regex: environments/staging/.*
    kms: "arn:aws:kms:us-east-1:123456789:key/staging-key-id"
    encrypted_regex: "^(password|secret|token|key|api_key)$"

  - path_regex: environments/dev/.*
    age: "age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p"
```

## Good Examples
```yaml
# .sops.yaml — production-ready
creation_rules:
  # Production: AWS KMS with key rotation
  - path_regex: secrets/production\..*
    kms: "arn:aws:kms:us-east-1:123456789:key/abcd-1234"
    encrypted_regex: "^(data|stringData)$"

  # Staging: Separate KMS key
  - path_regex: secrets/staging\..*
    kms: "arn:aws:kms:us-east-1:123456789:key/efgh-5678"
    encrypted_regex: "^(data|stringData)$"

  # Development: age key for local development
  - path_regex: secrets/dev\..*
    age: "age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p"

  # Catch-all: prevent unencrypted secrets
  - path_regex: secrets/.*
    kms: "arn:aws:kms:us-east-1:123456789:key/default-key"
```

```yaml
# secrets/production.enc.yaml — encrypted file
database:
    host: ENC[AES256_GCM,data:abc123...]
    port: 5432  # Not encrypted — not matching encrypted_regex
    password: ENC[AES256_GCM,data:def456...]
```

## Bad Examples
```yaml
# BAD: No .sops.yaml — manual key specification every time
sops --encrypt --kms "arn:..." secrets.yaml
# Inconsistent, error-prone, different keys per developer

# BAD: Same key for all environments
creation_rules:
  - path_regex: .*
    kms: "arn:aws:kms:us-east-1:123456789:key/single-key"
    # Production and dev share a key — security violation

# BAD: No encrypted_regex — encrypts everything including non-secrets
creation_rules:
  - path_regex: .*
    kms: "arn:..."
    # Entire file encrypted — can't diff or review structure
```

## Enforcement
- Commit .sops.yaml to version control
- CI validates .sops.yaml exists and covers all secret file patterns
- Use encrypted_regex to encrypt only sensitive values
- Separate KMS keys per environment with distinct IAM policies
