---
id: vault-policy-conventions
stackId: vault
type: rule
name: Vault Policy Writing Standards
description: >-
  Write HashiCorp Vault policies with least-privilege principles — explicit path
  capabilities, deny by default, no wildcard read on secrets, and proper policy
  naming conventions.
difficulty: intermediate
globs:
  - '**/*.hcl'
  - '**/vault/**'
  - '**/policies/**'
tags:
  - vault-policies
  - least-privilege
  - access-control
  - capabilities
  - hcl
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
  - question: What is the principle of least privilege in Vault policies?
    answer: >-
      Least privilege means granting only the minimum capabilities needed for a
      specific role. An application reading database credentials needs 'read' on
      its specific secret path — not 'read' on all secrets, not 'create' or
      'delete', and not access to other environments. Vault denies by default,
      so only explicitly granted paths are accessible.
  - question: How should Vault policies be named?
    answer: >-
      Use the pattern: environment-team-role (e.g., prod-backend-app,
      staging-frontend-readonly). This makes it immediately clear what access
      the policy grants and to whom. Store policies in version control with the
      same filename: prod-backend-app.hcl. Never use generic names like policy1
      or admin.
relatedItems:
  - vault-auth-config
  - vault-secret-management
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Vault Policy Writing Standards

## Rule
All Vault policies MUST follow least-privilege principles. Deny by default. Grant explicit capabilities per path. Never use wildcard (*) capabilities on secret paths. Name policies with environment and role prefixes.

## Policy Naming Convention
```
<environment>-<team>-<role>

Examples:
  prod-platform-admin
  staging-backend-readonly
  dev-frontend-secrets
```

## Good Examples
```hcl
# prod-backend-app.hcl — application secrets access
path "secret/data/production/backend/*" {
  capabilities = ["read"]
}

# Allow listing secret keys (not values)
path "secret/metadata/production/backend/*" {
  capabilities = ["list"]
}

# Database dynamic credentials
path "database/creds/production-backend-readonly" {
  capabilities = ["read"]
}

# Allow token self-renewal
path "auth/token/renew-self" {
  capabilities = ["update"]
}

# Deny access to other environments
path "secret/data/staging/*" {
  capabilities = ["deny"]
}
```

```hcl
# prod-platform-admin.hcl — admin policy
path "secret/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "sys/policies/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Even admins can't read root tokens
path "auth/token/create-orphan" {
  capabilities = ["deny"]
}
```

## Bad Examples
```hcl
# BAD: Wildcard everything — defeats the purpose of Vault
path "*" {
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# BAD: Too broad secret access
path "secret/*" {
  capabilities = ["read"]
}
# Grants access to ALL secrets across ALL environments

# BAD: No naming convention
path "secret/data/myapp" {
  capabilities = ["read"]
}
# Policy file named "policy1.hcl" — meaningless
```

## Enforcement
- Vault Sentinel policies for policy-as-code enforcement
- Quarterly audit of policy assignments
- CI validates policy files with `vault policy fmt`
- Never assign the root policy to service accounts
