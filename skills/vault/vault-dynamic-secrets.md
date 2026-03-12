---
id: vault-dynamic-secrets
stackId: vault
type: skill
name: Dynamic Secrets with Vault
description: >-
  Generate dynamic, short-lived credentials with Vault — database credentials,
  AWS IAM, PKI certificates, and SSH keys that are automatically created and
  revoked based on TTL.
difficulty: advanced
tags:
  - dynamic-secrets
  - database
  - aws
  - leases
  - ttl
  - credential-management
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Vault CLI installed
  - Vault server with secret engines configured
faq:
  - question: How do dynamic database secrets work?
    answer: >-
      When you read database/creds/rolename, Vault connects to the database,
      creates a temporary user with the role's SQL statements, and returns the
      credentials with a lease. When the lease expires (or is revoked), Vault
      connects again and drops the user. The application never sees the database
      admin password.
  - question: What happens when a dynamic secret's lease expires?
    answer: >-
      Vault revokes the credentials — for database secrets, it drops the user;
      for AWS, it deletes the IAM user. Active connections using the credentials
      may continue until the database enforces the expiration. Set VALID UNTIL
      in SQL to force disconnection at lease expiry.
  - question: How do I renew dynamic secrets before they expire?
    answer: >-
      Use vault lease renew LEASE_ID to extend the TTL. Renew before expiry
      (Vault Agent does this automatically). Set -increment for custom duration.
      Renewal cannot exceed max_ttl. If you need longer access, create a new
      credential before the current one expires.
relatedItems:
  - vault-kv-secrets
  - vault-policies-auth
  - vault-transit-pki
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Dynamic Secrets with Vault

## Overview
Dynamic secrets are generated on-demand with a time-to-live (TTL). Vault creates temporary credentials for databases, cloud providers, and SSH, then automatically revokes them when they expire.

## Why This Matters
- **Security** — no long-lived credentials to steal or leak
- **Automation** — applications request credentials programmatically
- **Blast radius** — compromised credentials expire quickly
- **Auditing** — every credential issuance is logged

## How It Works

### Step 1: Database Dynamic Secrets
```bash
# Enable database secret engine
vault secrets enable database

# Configure PostgreSQL connection
vault write database/config/mydb \
  plugin_name=postgresql-database-plugin \
  connection_url="postgresql://{{username}}:{{password}}@db.example.com:5432/myapp" \
  allowed_roles="readonly,readwrite" \
  username="vault_admin" \
  password="admin_password"

# Create readonly role
vault write database/roles/readonly \
  db_name=mydb \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
  revocation_statements="REVOKE ALL ON ALL TABLES IN SCHEMA public FROM \"{{name}}\"; DROP ROLE IF EXISTS \"{{name}}\";" \
  default_ttl="1h" \
  max_ttl="24h"

# Generate credentials
vault read database/creds/readonly
# Returns: username=v-token-readonl-abc123 password=A1b2C3d4

# Use in application
DB_CREDS=$(vault read -format=json database/creds/readonly)
DB_USER=$(echo $DB_CREDS | jq -r '.data.username')
DB_PASS=$(echo $DB_CREDS | jq -r '.data.password')
psql -h db.example.com -U "$DB_USER" -d myapp
```

### Step 2: AWS Dynamic Secrets
```bash
# Enable AWS secret engine
vault secrets enable aws

# Configure root credentials
vault write aws/config/root \
  access_key=$AWS_ACCESS_KEY \
  secret_key=$AWS_SECRET_KEY \
  region=us-east-1

# Create IAM role for S3 access
vault write aws/roles/s3-reader \
  credential_type=iam_user \
  policy_document=-<<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": ["arn:aws:s3:::my-bucket/*", "arn:aws:s3:::my-bucket"]
  }]
}
EOF

# Generate temporary AWS credentials
vault read aws/creds/s3-reader
# Returns: access_key, secret_key, security_token (STS)

# Use credentials
export AWS_ACCESS_KEY_ID=$(vault read -field=access_key aws/creds/s3-reader)
export AWS_SECRET_ACCESS_KEY=$(vault read -field=secret_key aws/creds/s3-reader)
aws s3 ls s3://my-bucket/
```

### Step 3: Lease Management
```bash
# List active leases
vault list sys/leases/lookup/database/creds/readonly/

# View lease details
vault lease lookup LEASE_ID

# Renew a lease (extend TTL)
vault lease renew LEASE_ID
vault lease renew -increment=2h LEASE_ID

# Revoke a specific lease (immediately)
vault lease revoke LEASE_ID

# Revoke all leases for a path
vault lease revoke -prefix database/creds/readonly

# Force revoke (when backend is unavailable)
vault lease revoke -force LEASE_ID
```

### Step 4: Dynamic Secrets in Scripts
```bash
#!/bin/bash
set -euo pipefail

# Get dynamic database credentials
LEASE=$(vault read -format=json database/creds/readwrite)
LEASE_ID=$(echo $LEASE | jq -r '.lease_id')
DB_USER=$(echo $LEASE | jq -r '.data.username')
DB_PASS=$(echo $LEASE | jq -r '.data.password')

# Cleanup on exit
cleanup() {
  echo "Revoking lease..."
  vault lease revoke "$LEASE_ID" 2>/dev/null || true
}
trap cleanup EXIT

# Use credentials
PGPASSWORD="$DB_PASS" psql -h db.example.com -U "$DB_USER" -d myapp -c "
  SELECT * FROM reports WHERE date = current_date;
"
```

## Best Practices
- Set short TTLs (1-4 hours) for most use cases
- Revoke leases on script exit (trap handler)
- Use -format=json for reliable parsing in scripts
- Create separate roles for read-only vs read-write
- Monitor active leases (high count may indicate a leak)

## Common Mistakes
- Not revoking leases when done (orphaned credentials accumulate)
- TTL too long (defeats the purpose of dynamic secrets)
- Not using trap for cleanup (leaked credentials on script failure)
- Using root credentials for application access
- Not monitoring lease count (credential leak detection)
