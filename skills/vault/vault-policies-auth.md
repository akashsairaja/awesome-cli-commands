---
id: vault-policies-auth
stackId: vault
type: skill
name: Vault Policies & Authentication
description: >-
  Configure Vault access control — writing ACL policies, setting up auth methods
  (AppRole, OIDC, Kubernetes), token management, and designing least-privilege
  access for applications and users.
difficulty: intermediate
tags:
  - policies
  - authentication
  - approle
  - oidc
  - kubernetes
  - tokens
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Vault CLI installed
  - Vault server running
faq:
  - question: How do Vault policies work?
    answer: >-
      Policies define path-based ACLs with capabilities: create, read, update,
      delete, list, sudo, deny. Policies are deny-by-default — you must
      explicitly grant access. Attach policies to tokens via auth methods. Use
      the most specific path possible: secret/data/myapp/database is better than
      secret/data/*.
  - question: How do I authenticate a server application with Vault?
    answer: >-
      Use AppRole: 1) Create a role with policies. 2) Deploy role-id with the
      app (not sensitive). 3) Deliver secret-id securely (CI secret, wrapped
      token). 4) App calls auth/approle/login to get a Vault token. 5) App uses
      token to read secrets. Token auto-renews or app re-authenticates.
  - question: What capabilities should I use in Vault policies?
    answer: >-
      read: get secret values. list: enumerate paths. create: write new secrets.
      update: modify existing secrets. delete: remove secrets. sudo: override
      restrictions. deny: explicit deny (overrides all). Most app policies need
      only read and list. Only admins need create/update/delete.
relatedItems:
  - vault-kv-secrets
  - vault-dynamic-secrets
  - vault-secrets-expert
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Vault Policies & Authentication

## Overview
Vault's security model combines authentication (who you are) with policies (what you can do). Design least-privilege policies and set up auth methods for both humans and machines.

## Why This Matters
- **Least privilege** — applications access only the secrets they need
- **Authentication** — verify identity before granting access
- **Audit** — trace every secret access to an identity
- **Automation** — machines authenticate without human intervention

## How It Works

### Step 1: Write Policies
```bash
# Create a policy file
vault policy write app-reader - <<EOF
# Read secrets for myapp
path "secret/data/myapp/*" {
  capabilities = ["read", "list"]
}

# Generate dynamic database credentials
path "database/creds/readonly" {
  capabilities = ["read"]
}

# Renew own token
path "auth/token/renew-self" {
  capabilities = ["update"]
}

# Deny admin paths
path "sys/*" {
  capabilities = ["deny"]
}
EOF

# List policies
vault policy list

# Read a policy
vault policy read app-reader

# Delete a policy
vault policy delete app-reader

# Test policy with token
vault token create -policy=app-reader -ttl=1h
```

### Step 2: AppRole Authentication (Machines)
```bash
# Enable AppRole
vault auth enable approle

# Create role
vault write auth/approle/role/myapp \
  token_policies="app-reader" \
  token_ttl=1h \
  token_max_ttl=4h \
  secret_id_ttl=720h \
  secret_id_num_uses=0

# Get role ID (deploy-time, not sensitive)
vault read auth/approle/role/myapp/role-id

# Generate secret ID (sensitive, treat like a password)
vault write -f auth/approle/role/myapp/secret-id

# Application login
vault write auth/approle/login \
  role_id="$ROLE_ID" \
  secret_id="$SECRET_ID"
# Returns: client_token, policies, lease_duration

# Use token
export VAULT_TOKEN="s.abc123..."
vault kv get secret/myapp/database
```

### Step 3: OIDC Authentication (Humans)
```bash
# Enable OIDC
vault auth enable oidc

# Configure OIDC provider
vault write auth/oidc/config \
  oidc_discovery_url="https://accounts.google.com" \
  oidc_client_id="$CLIENT_ID" \
  oidc_client_secret="$CLIENT_SECRET" \
  default_role="default"

# Create role mapping
vault write auth/oidc/role/default \
  user_claim="email" \
  allowed_redirect_uris="http://localhost:8250/oidc/callback" \
  token_policies="user-reader" \
  token_ttl=8h

# Login (opens browser)
vault login -method=oidc
```

### Step 4: Kubernetes Authentication
```bash
# Enable Kubernetes auth
vault auth enable kubernetes

# Configure with cluster info
vault write auth/kubernetes/config \
  kubernetes_host="https://kubernetes.default.svc" \
  kubernetes_ca_cert=@ca.crt \
  token_reviewer_jwt="$SA_TOKEN"

# Create role for a service account
vault write auth/kubernetes/role/myapp \
  bound_service_account_names="myapp-sa" \
  bound_service_account_namespaces="production" \
  policies="app-reader" \
  ttl=1h
```

### Step 5: Token Management
```bash
# Create token with policy
vault token create -policy=app-reader -ttl=4h

# Lookup token info
vault token lookup
vault token lookup -accessor ACCESSOR_ID

# Renew token
vault token renew
vault token renew -increment=2h

# Revoke token
vault token revoke TOKEN_ID
vault token revoke -accessor ACCESSOR_ID

# Revoke all tokens for a path
vault token revoke -mode=path auth/approle/
```

## Best Practices
- Use AppRole for machines, OIDC for humans
- Apply least-privilege: specific paths, minimal capabilities
- Set TTLs on all tokens (no infinite-lived tokens)
- Enable audit logging for compliance
- Use templated policies for per-identity paths

## Common Mistakes
- Overly broad policies ("*" capabilities on wide paths)
- Using root token for application access
- Long-lived tokens without renewal
- Not revoking tokens when access should end
- Not setting secret_id_ttl on AppRole (never-expiring auth)
