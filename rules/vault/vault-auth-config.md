---
id: vault-auth-config
stackId: vault
type: rule
name: Authentication Method Configuration
description: >-
  Configure Vault authentication methods properly — prefer machine identity
  (AppRole, Kubernetes, AWS IAM) over static tokens, set appropriate TTLs, and
  enforce MFA for human operators.
difficulty: intermediate
globs:
  - '**/*.hcl'
  - '**/vault/**'
  - '**/*.sh'
tags:
  - authentication
  - approle
  - kubernetes-auth
  - oidc
  - token-management
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
  - question: Why should I use AppRole or Kubernetes auth instead of static tokens?
    answer: >-
      Static tokens are dangerous: they don't rotate automatically, can be
      leaked in logs or environment dumps, and provide no identity context in
      audit logs. Machine identity methods (AppRole, Kubernetes, AWS IAM) use
      short-lived tokens with automatic renewal, provide clear audit trails, and
      integrate with existing identity systems.
  - question: What token TTL should I set for Vault applications?
    answer: >-
      Set token TTL to 1 hour with max TTL of 4 hours for production
      applications. The application should renew the token before it expires.
      Short TTLs limit the blast radius of a leaked token. CI/CD pipelines
      should use even shorter TTLs (10-30 minutes) since their operations are
      time-bounded.
relatedItems:
  - vault-policy-conventions
  - vault-secret-management
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Authentication Method Configuration

## Rule
Production applications MUST use machine identity auth methods (AppRole, Kubernetes, AWS IAM). Human operators MUST use OIDC/LDAP with MFA. Never distribute static Vault tokens.

## Auth Method Selection
| Client | Auth Method | Why |
|--------|-------------|-----|
| Kubernetes pods | Kubernetes auth | Native service account identity |
| AWS EC2/Lambda | AWS IAM auth | Instance identity document |
| CI/CD pipelines | AppRole | Secret ID rotation |
| Human operators | OIDC / LDAP | SSO integration + MFA |
| Terraform | AppRole or AWS IAM | Automated infrastructure |

## Good Examples
```bash
# Enable Kubernetes auth
vault auth enable kubernetes
vault write auth/kubernetes/config \
  kubernetes_host="https://kubernetes.default.svc" \
  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

# Create Kubernetes auth role
vault write auth/kubernetes/role/backend-app \
  bound_service_account_names=backend-app \
  bound_service_account_namespaces=production \
  policies=prod-backend-app \
  ttl=1h \
  max_ttl=4h

# Enable AppRole auth for CI/CD
vault auth enable approle
vault write auth/approle/role/ci-deploy \
  secret_id_ttl=10m \
  token_ttl=20m \
  token_max_ttl=30m \
  policies=staging-deploy

# OIDC for human operators
vault auth enable oidc
vault write auth/oidc/config \
  oidc_discovery_url="https://accounts.google.com" \
  oidc_client_id="vault-client-id" \
  oidc_client_secret="vault-client-secret" \
  default_role="operator"
```

## Bad Examples
```bash
# BAD: Static tokens in environment variables
export VAULT_TOKEN="hvs.CAESIG..."
# Tokens don't rotate, can be leaked in logs, no audit trail

# BAD: Userpass auth for applications
vault auth enable userpass
vault write auth/userpass/users/myapp password="hardcoded"
# Password in config files, no rotation

# BAD: Long-lived tokens
vault write auth/approle/role/app \
  token_ttl=720h \
  token_max_ttl=8760h  # 1 year token!
```

## Enforcement
- Disable userpass and token auth for non-operator use
- Maximum token TTL of 4 hours for applications
- Audit log all authentication events
- Rotate AppRole secret IDs automatically in CI
