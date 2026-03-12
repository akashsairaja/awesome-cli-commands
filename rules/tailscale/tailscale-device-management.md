---
id: tailscale-device-management
stackId: tailscale
type: rule
name: Device Registration & Key Management
description: >-
  Standards for Tailscale device management — auth key types, ephemeral vs
  reusable keys, device naming, key rotation, and automated registration for
  infrastructure.
difficulty: beginner
globs:
  - '**/.env*'
  - '**/tailscale/**'
tags:
  - tailscale
  - device-management
  - auth-keys
  - security
  - standards
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
  - question: What type of Tailscale auth key should I use for CI/CD?
    answer: >-
      Use ephemeral keys for CI/CD. They automatically remove the device from
      your tailnet when it disconnects, preventing stale entries from
      accumulating. Tag the key with tag:ci so ACL rules can control what CI
      runners can access. Set a 30-day expiration and rotate before expiry.
  - question: How do I store Tailscale auth keys securely?
    answer: >-
      Store auth keys in your secret manager (HashiCorp Vault, AWS Secrets
      Manager) or CI/CD secrets (GitHub Secrets). Never commit keys to version
      control, environment files, or Docker images. Pass keys as environment
      variables at runtime and ensure they are not logged.
relatedItems:
  - tailscale-devops-agent
  - tailscale-acl-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Device Registration & Key Management

## Rule
All Tailscale devices MUST be registered with appropriate key types. Ephemeral keys for temporary devices, reusable keys for infrastructure automation. Keys MUST be rotated regularly.

## Key Types
| Key Type | Use Case | Auto-Cleanup |
|----------|----------|-------------|
| Single-use | Manual one-time registration | No |
| Reusable | Infrastructure automation, scripts | No |
| Ephemeral | CI/CD, temporary environments | Yes (on disconnect) |
| Pre-approved | Automated with tag assignment | Depends on type |

## Rules
1. CI/CD runners MUST use ephemeral keys (auto-cleanup on disconnect)
2. Production servers SHOULD use single-use keys (explicit registration)
3. Autoscaling groups SHOULD use reusable + ephemeral keys
4. Keys MUST have expiration set (max 90 days)
5. NEVER share keys between different environments
6. Store keys in secret managers, not in code or config files

## Device Naming
```
{environment}-{service}-{region}-{number}
```
Examples:
- `prod-api-us-east-1`
- `staging-worker-eu-west-1`
- `ci-runner-ephemeral`

## Auth Key Configuration
```bash
# Ephemeral key for CI/CD
tailscale up --authkey=tskey-auth-xxx --hostname=ci-runner-$BUILD_ID

# Reusable key for autoscaling
tailscale up --authkey=tskey-auth-yyy --hostname=worker-$(hostname)

# With tags (requires pre-approved key)
tailscale up --authkey=tskey-auth-zzz --advertise-tags=tag:server
```

## Key Rotation Schedule
| Key Type | Rotation Frequency |
|----------|-------------------|
| CI/CD ephemeral | Every 30 days |
| Infrastructure reusable | Every 60 days |
| Single-use | Not applicable (one-time) |
| API keys | Every 90 days |

## Examples

### Good
- CI/CD uses ephemeral keys (auto-cleanup)
- Production servers registered with single-use keys and tags
- Keys stored in GitHub Secrets or Vault
- 90-day expiration on all reusable keys

### Bad
- Long-lived keys with no expiration
- Same key used for CI and production
- Keys committed to version control
- Manual device registration for autoscaling infrastructure

## Enforcement
Audit registered devices monthly.
Verify key expiration dates quarterly.
Monitor for untagged devices in admin console.
