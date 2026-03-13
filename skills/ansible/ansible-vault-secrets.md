---
id: ansible-vault-secrets
stackId: ansible
type: skill
name: Ansible Vault Secret Management
description: >-
  Securely manage secrets in Ansible with Vault encryption — encrypt files and
  strings, use vault IDs for multi-environment passwords, and integrate with
  external secret managers.
difficulty: advanced
tags:
  - ansible
  - vault
  - secret
  - management
  - security
  - automation
  - api
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Ansible Vault Secret Management skill?"
    answer: >-
      Securely manage secrets in Ansible with Vault encryption — encrypt files
      and strings, use vault IDs for multi-environment passwords, and
      integrate with external secret managers. It includes practical examples
      for ansible development.
  - question: "What tools and setup does Ansible Vault Secret Management require?"
    answer: >-
      Works with standard ansible tooling (relevant CLI tools and frameworks).
      No special setup required beyond a working ansible environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Ansible Vault Secret Management

## Overview
Ansible Vault encrypts sensitive data (passwords, API keys, certificates) so they can be safely stored in version control. Vault supports file-level and string-level encryption with multiple passwords per project.

## Why This Matters
- **Security** — secrets encrypted at rest in Git repositories
- **Compliance** — audit trail for who changed what secrets
- **Collaboration** — team members share encrypted vaults, not plaintext
- **Automation** — vault passwords can be retrieved from credential managers

## File-Level Encryption
```bash
# Encrypt a file
ansible-vault encrypt group_vars/production/vault.yml

# Decrypt for editing
ansible-vault edit group_vars/production/vault.yml

# View encrypted file
ansible-vault view group_vars/production/vault.yml

# Rekey (change password)
ansible-vault rekey group_vars/production/vault.yml
```

## String-Level Encryption
```bash
# Encrypt a single value
ansible-vault encrypt_string 'my_secret_password' --name 'db_password'

# Output (paste into vars file):
# db_password: !vault |
#   $ANSIBLE_VAULT;1.1;AES256
#   6339...
```

## Multi-Environment Vault IDs
```bash
# Encrypt with vault ID
ansible-vault encrypt --vault-id prod@prompt group_vars/production/vault.yml
ansible-vault encrypt --vault-id dev@prompt group_vars/development/vault.yml

# Run playbook with multiple vault IDs
ansible-playbook site.yml \
  --vault-id prod@~/.vault_pass_prod \
  --vault-id dev@~/.vault_pass_dev
```

## Vault File Pattern
```yaml
# group_vars/production/vars.yml (unencrypted, references vault vars)
db_host: "db.production.internal"
db_port: 5432
db_name: "myapp"
db_user: "{{ vault_db_user }}"
db_password: "{{ vault_db_password }}"

# group_vars/production/vault.yml (encrypted)
vault_db_user: "production_admin"
vault_db_password: "super_secret_password"
vault_api_key: "sk-live-abc123def456"
```

## External Secret Manager Integration
```yaml
# HashiCorp Vault lookup
- name: Fetch database password from HashiCorp Vault
  ansible.builtin.set_fact:
    db_password: "{{ lookup('hashi_vault', 'secret/data/myapp/db:password') }}"
  no_log: true

# AWS Secrets Manager lookup
- name: Fetch secret from AWS
  ansible.builtin.set_fact:
    api_key: "{{ lookup('amazon.aws.aws_secret', 'myapp/api-key') }}"
  no_log: true
```

## Best Practices
- Use separate vault files from regular vars (vault.yml + vars.yml pattern)
- Prefix vault variables with `vault_` for clarity
- Use vault IDs when managing multiple environments
- Store vault passwords in a credential manager, not on disk
- Always add `no_log: true` to tasks using vault variables
- Use `ansible-vault encrypt_string` for individual values in mixed files

## Common Mistakes
- Committing unencrypted secrets to Git (encrypt before first commit)
- Using the same vault password for all environments
- Forgetting `no_log: true` (secrets appear in Ansible output)
- Editing vault files with regular editor (breaks encryption)
- Not using the vault_/vars split pattern (mixing encrypted and plain)
