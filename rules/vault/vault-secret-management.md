---
id: vault-secret-management
stackId: vault
type: rule
name: Secret Organization and Lifecycle
description: >-
  Organize Vault secrets with consistent path hierarchies —
  environment-separated paths, versioned KV secrets, automatic rotation for
  credentials, and proper secret lifecycle management.
difficulty: intermediate
globs:
  - '**/*.hcl'
  - '**/vault/**'
  - '**/*.sh'
tags:
  - secret-management
  - kv-v2
  - dynamic-secrets
  - rotation
  - path-hierarchy
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
  - question: How should Vault secrets be organized?
    answer: >-
      Use a consistent path hierarchy:
      secret/{environment}/{team}/{service}/{secret-name}. This enables
      policy-based access control at each level — a backend team policy grants
      access to secret/*/backend/* across all environments, while an environment
      policy restricts access to secret/production/*. Always use KV v2 for
      secret versioning.
  - question: What are dynamic secrets in Vault and why should I use them?
    answer: >-
      Dynamic secrets are generated on demand with automatic expiration (e.g.,
      database credentials created when requested, valid for 1 hour). They
      eliminate static credentials entirely — no password rotation needed, no
      shared credentials, and automatic revocation. Vault supports dynamic
      secrets for databases, AWS, Azure, GCP, and more.
relatedItems:
  - vault-policy-conventions
  - vault-auth-config
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Secret Organization and Lifecycle

## Rule
Organize secrets with a consistent path hierarchy: `secret/{environment}/{team}/{service}/{key}`. Use KV v2 for versioning. Implement rotation for all credentials. Set metadata with TTL and custom fields.

## Path Hierarchy
```
secret/
├── production/
│   ├── backend/
│   │   ├── api/
│   │   │   ├── database        # DB credentials
│   │   │   ├── redis           # Redis credentials
│   │   │   └── stripe          # Payment API key
│   │   └── worker/
│   │       └── database
│   └── frontend/
│       └── cdn-key
├── staging/
│   └── backend/
│       └── api/
│           └── database
└── shared/
    └── certificates/
        └── wildcard-cert
```

## Good Examples
```bash
# Enable KV v2 for secret versioning
vault secrets enable -path=secret kv-v2

# Store secret with metadata
vault kv put secret/production/backend/api/database \
  host="db.internal" \
  port=5432 \
  username="app_user" \
  password="$(openssl rand -base64 32)"

# Set metadata (rotation reminder, owner)
vault kv metadata put secret/production/backend/api/database \
  custom_metadata=owner="backend-team" \
  custom_metadata=rotation="quarterly" \
  max_versions=5 \
  delete_version_after=90d

# Read specific version
vault kv get -version=2 secret/production/backend/api/database

# Enable dynamic database credentials (auto-rotation)
vault write database/config/production-postgres \
  plugin_name=postgresql-database-plugin \
  connection_url="postgresql://{{username}}:{{password}}@db:5432/app" \
  allowed_roles="readonly,readwrite" \
  username="vault_admin" \
  password="admin_password"

vault write database/roles/readonly \
  db_name=production-postgres \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
  default_ttl=1h \
  max_ttl=24h
```

## Bad Examples
```bash
# BAD: Flat structure with no hierarchy
vault kv put secret/db-password password="abc"
vault kv put secret/api-key key="xyz"
# No environment separation, no team ownership

# BAD: Multiple secrets in unrelated paths
vault kv put secret/myapp-prod-db password="..."
vault kv put secret/production/myapp/database password="..."
# Inconsistent paths — impossible to set policies

# BAD: Static credentials with no rotation plan
vault kv put secret/production/database password="same-for-3-years"
```

## Enforcement
- Vault policies enforce path-based access control
- Dynamic secrets (database, AWS) eliminate static credentials
- Metadata tracks rotation schedule and ownership
- Quarterly audit of secret age and access patterns
