---
id: vault-kv-secrets
stackId: vault
type: skill
name: KV Secret Engine Operations
description: >-
  Manage secrets with Vault's KV v2 engine — storing, retrieving, versioning,
  deleting, and restoring secrets with metadata, custom metadata, and
  check-and-set operations from the CLI.
difficulty: intermediate
tags:
  - vault
  - secret
  - engine
  - operations
  - api
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the KV Secret Engine Operations skill?"
    answer: >-
      Manage secrets with Vault's KV v2 engine — storing, retrieving,
      versioning, deleting, and restoring secrets with metadata, custom
      metadata, and check-and-set operations from the CLI. This skill provides
      a structured workflow for development tasks.
  - question: "What tools and setup does KV Secret Engine Operations require?"
    answer: >-
      Works with standard vault tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# KV Secret Engine Operations

## Overview
The KV (Key-Value) v2 engine is Vault's most common secret storage. It stores versioned secrets with metadata, soft-delete, and check-and-set operations for safe concurrent updates.

## Why This Matters
- **Centralized secrets** — one source of truth for all credentials
- **Versioning** — roll back bad secret changes
- **Audit trail** — who changed what and when
- **Access control** — fine-grained policies per path

## How It Works

### Step 1: Enable & Configure KV Engine
```bash
# Enable KV v2 at a path
vault secrets enable -path=secret kv-v2

# Configure max versions
vault write secret/config max_versions=10

# Check engine status
vault secrets list
vault read secret/config
```

### Step 2: Store & Retrieve Secrets
```bash
# Store a secret (creates or updates)
vault kv put secret/myapp/database \
  host="db.example.com" \
  port="5432" \
  username="app_user" \
  password="s3cur3_p@ss"

# Read entire secret
vault kv get secret/myapp/database

# Read specific field
vault kv get -field=password secret/myapp/database

# Read as JSON
vault kv get -format=json secret/myapp/database

# Read specific version
vault kv get -version=2 secret/myapp/database

# Store from file
vault kv put secret/myapp/tls cert=@cert.pem key=@key.pem

# Store from stdin
echo -n '{"api_key":"abc123"}' | vault kv put secret/myapp/external -
```

### Step 3: Versioning & Metadata
```bash
# View version history
vault kv metadata get secret/myapp/database

# Add custom metadata
vault kv metadata put -custom-metadata=owner="platform-team" \
  -custom-metadata=rotation="90d" \
  secret/myapp/database

# Soft delete a version (can be undeleted)
vault kv delete -versions=3 secret/myapp/database

# Undelete
vault kv undelete -versions=3 secret/myapp/database

# Permanently destroy a version
vault kv destroy -versions=1,2 secret/myapp/database

# Delete all versions and metadata
vault kv metadata delete secret/myapp/database
```

### Step 4: Check-and-Set (CAS)
```bash
# Enable CAS (prevent accidental overwrites)
vault kv metadata put -cas-required=true secret/myapp/database

# Write with CAS (must match current version)
vault kv put -cas=5 secret/myapp/database password="new_pass"
# Fails if current version is not 5

# CAS=0 means create only (fail if exists)
vault kv put -cas=0 secret/myapp/new-service api_key="key123"
```

### Step 5: List & Search
```bash
# List secrets at a path
vault kv list secret/myapp/
vault kv list secret/

# Recursive listing (not built-in, use API)
vault kv list -format=json secret/ | jq -r '.[]'
```

## Best Practices
- Use KV v2 (not v1) for versioning and soft-delete
- Enable CAS for critical secrets (prevent race conditions)
- Add custom metadata (owner, rotation schedule)
- Set max_versions to limit storage growth
- Use -field flag to extract values for scripts

## Common Mistakes
- Using KV v1 (no versioning, hard deletes only)
- Not setting max_versions (unbounded version history)
- Not using -field in scripts (parsing full output is fragile)
- Hard-deleting instead of soft-deleting (no recovery)
- Not using CAS for concurrent secret updates
