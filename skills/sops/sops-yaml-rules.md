---
id: sops-yaml-rules
stackId: sops
type: skill
name: Configuring .sops.yaml Rules
description: >-
  Configure .sops.yaml for automated encryption rules — path-based key
  selection, creation rules, key groups, regex patterns, and setting up
  consistent encryption across teams.
difficulty: intermediate
tags:
  - sops-yaml
  - rules
  - configuration
  - multi-environment
  - key-groups
  - automation
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - SOPS installed
  - age or cloud KMS keys
faq:
  - question: How does .sops.yaml rule matching work?
    answer: >-
      SOPS matches the file path against path_regex patterns in order, using the
      first match. Rules are evaluated top to bottom. Put most specific patterns
      first (secrets/prod/.*) and general patterns last (.*). If no rule
      matches, SOPS fails with an error.
  - question: How do I add a new team member to .sops.yaml?
    answer: >-
      Add their age public key to the appropriate creation_rules. Then update
      existing encrypted files: sops updatekeys secrets/file.enc.yaml. This
      re-encrypts the data key to include the new recipient. They can now
      decrypt with their private key.
  - question: Can I use both age and cloud KMS in the same rule?
    answer: >-
      Yes. Add both age and kms keys to the same creation_rule. SOPS encrypts
      the data key for all recipients. Any single key can decrypt the file. This
      provides redundancy: team members use age keys locally, CI/CD uses cloud
      KMS. If one key type is unavailable, the other still works.
relatedItems:
  - sops-encrypt-decrypt
  - sops-key-management
  - sops-cicd-integration
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Configuring .sops.yaml Rules

## Overview
The .sops.yaml file defines encryption rules for your project. It specifies which keys to use based on file paths, eliminating the need to pass --age flags manually and ensuring consistent encryption across the team.

## Why This Matters
- **Consistency** — everyone encrypts with the same keys
- **Automation** — no manual key flags needed
- **Multi-environment** — different keys per environment
- **Security** — enforce encryption policies per path

## How It Works

### Step 1: Basic .sops.yaml
```bash
# .sops.yaml at project root
# creation_rules:
#   - path_regex: secrets/.*\.yaml$
#     age: >-
#       age1alice...,
#       age1bob...,
#       age1cicd...

# Now encrypt without specifying keys
sops --encrypt secrets/app.yaml > secrets/app.enc.yaml
```

### Step 2: Multi-Environment Rules
```bash
# .sops.yaml with environment-specific keys
# creation_rules:
#   # Production — strict access
#   - path_regex: secrets/prod/.*
#     age: >-
#       age1lead...,
#       age1cicd-prod...
#     encrypted_regex: ^(password|token|key|secret|credential)$
#
#   # Staging — team access
#   - path_regex: secrets/staging/.*
#     age: >-
#       age1alice...,
#       age1bob...,
#       age1cicd-staging...
#
#   # Development — all developers
#   - path_regex: secrets/dev/.*
#     age: >-
#       age1alice...,
#       age1bob...,
#       age1charlie...,
#       age1cicd-dev...
#
#   # Default rule (catches everything else)
#   - path_regex: .*
#     age: age1default...

# Files auto-match rules by path
sops --encrypt secrets/prod/database.yaml    # uses prod keys
sops --encrypt secrets/dev/api.yaml          # uses dev keys
```

### Step 3: Key Groups (Threshold)
```bash
# Require keys from multiple groups to decrypt
# creation_rules:
#   - path_regex: secrets/prod/.*
#     key_groups:
#       - age:
#           - age1lead1...
#           - age1lead2...
#       - kms:
#           - arn: arn:aws:kms:us-east-1:123:key/prod-key

# This requires at least one key from each group
# (lead team member AND KMS key)
```

### Step 4: Mixed Key Types
```bash
# .sops.yaml with age + cloud KMS
# creation_rules:
#   - path_regex: secrets/.*
#     age: >-
#       age1alice...,
#       age1bob...
#     kms: >-
#       arn:aws:kms:us-east-1:123456:key/abc-def
#     gcp_kms: >-
#       projects/myproject/locations/global/keyRings/myring/cryptoKeys/mykey

# Multiple key types provide redundancy
# Any one key type can decrypt the file
```

### Step 5: File Format Rules
```bash
# Different formats per file type
# creation_rules:
#   - path_regex: .*\.yaml$
#     age: age1key...
#
#   - path_regex: .*\.json$
#     age: age1key...
#
#   - path_regex: .*\.env$
#     age: age1key...
#
#   - path_regex: .*\.ini$
#     age: age1key...

# Verify rules match correctly
sops --encrypt --verbose secrets/app.yaml 2>&1 | grep "Using"
```

## Best Practices
- Commit .sops.yaml to version control (contains only public keys)
- Order rules from most specific to least specific
- Always have a default catch-all rule at the bottom
- Use encrypted_regex to limit which fields are encrypted
- Add a comment with key owner names for each age key

## Common Mistakes
- Rules in wrong order (first match wins, most specific should be first)
- Missing default rule (unmatched files fail to encrypt)
- Not committing .sops.yaml (team can't encrypt consistently)
- Including private keys in .sops.yaml (only public keys)
- Not updating rules when team members change
