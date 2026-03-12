---
id: opentofu-state-encryption
stackId: opentofu
type: rule
name: State Encryption Configuration
description: >-
  Enable OpenTofu's native state encryption — configure encryption keys, key
  providers, and encryption methods to protect sensitive data in state files at
  rest.
difficulty: intermediate
globs:
  - '**/*.tf'
  - '**/*.tofu'
  - '**/backend.tf'
tags:
  - state-encryption
  - security
  - kms
  - aes-gcm
  - secrets-protection
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
  - question: What is OpenTofu state encryption and why is it important?
    answer: >-
      OpenTofu state files contain the actual values of all managed resources,
      including passwords, API keys, and connection strings in plaintext. State
      encryption encrypts the state file at rest using AES-GCM with keys from
      providers like AWS KMS. This is a key differentiator from Terraform, which
      does not offer native state encryption.
  - question: Which key provider should I use for OpenTofu state encryption?
    answer: >-
      Use cloud KMS providers (aws_kms, gcp_kms) for production — they provide
      hardware-backed key management, access controls, and audit logging. Use
      pbkdf2 (passphrase-based) for development and testing only. Never hardcode
      passphrases in configuration files.
relatedItems:
  - opentofu-naming-conventions
  - opentofu-module-design
version: 1.0.0
lastUpdated: '2026-03-12'
---

# State Encryption Configuration

## Rule
All OpenTofu projects handling sensitive data MUST enable state encryption. Use OpenTofu's native encryption feature with appropriate key providers. Never store unencrypted state containing secrets.

## Format
```hcl
terraform {
  encryption {
    key_provider "pbkdf2" "main" {
      passphrase = var.state_encryption_passphrase
    }

    method "aes_gcm" "main" {
      keys = key_provider.pbkdf2.main
    }

    state {
      method = method.aes_gcm.main
    }

    plan {
      method = method.aes_gcm.main
    }
  }
}
```

## Key Provider Options
| Provider | Use Case | Security Level |
|----------|----------|---------------|
| `pbkdf2` | Passphrase-based | Basic (dev/test) |
| `aws_kms` | AWS KMS managed keys | Production |
| `gcp_kms` | GCP KMS managed keys | Production |

## Good Examples
```hcl
# Production: AWS KMS encryption
terraform {
  encryption {
    key_provider "aws_kms" "production" {
      kms_key_id = "arn:aws:kms:us-east-1:123456789:key/abcd-1234"
      region     = "us-east-1"
    }

    method "aes_gcm" "production" {
      keys = key_provider.aws_kms.production
    }

    state {
      method = method.aes_gcm.production
    }

    plan {
      method = method.aes_gcm.production
    }
  }

  backend "s3" {
    bucket         = "mycompany-tofu-state"
    key            = "production/main.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "tofu-locks"
  }
}
```

## Bad Examples
```hcl
# BAD: No encryption — secrets visible in state
terraform {
  backend "s3" {
    bucket = "my-state"
    key    = "state.tfstate"
  }
}
# Database passwords, API keys visible in plaintext state

# BAD: Hardcoded passphrase
key_provider "pbkdf2" "main" {
  passphrase = "my-secret-passphrase"  # In code!
}
```

## Enforcement
- Require encryption block in all OpenTofu configurations
- Use KMS key providers for production environments
- Audit state access logs for unauthorized reads
- Rotate encryption keys annually
