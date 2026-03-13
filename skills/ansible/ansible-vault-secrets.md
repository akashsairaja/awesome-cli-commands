---
id: ansible-vault-secrets
stackId: ansible
type: skill
name: Ansible Vault Secret Management
description: >-
  Securely manage secrets in Ansible with Vault encryption — encrypt files and
  strings, use vault IDs for multi-environment passwords, integrate with
  external secret managers, and set up CI/CD pipelines with proper vault
  password handling.
difficulty: advanced
tags:
  - ansible
  - vault
  - secret
  - management
  - security
  - automation
  - encryption
  - ci-cd
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "Should I encrypt entire files or individual strings with Ansible Vault?"
    answer: >-
      For most teams, encrypt individual strings with encrypt_string. This
      keeps variable names visible in plaintext so you can grep, diff, and
      review code normally — only the sensitive values are encrypted. Use
      full-file encryption only for files that are entirely sensitive, like
      TLS certificates or license keys.
  - question: "How do I use Ansible Vault in a CI/CD pipeline?"
    answer: >-
      Store the vault password as a pipeline secret (GitHub Actions secret,
      GitLab CI variable, Jenkins credential). Write it to a temporary file
      at runtime or use a vault password script that retrieves it from a
      secret manager. Never commit vault password files to version control.
      Use --vault-password-file or ANSIBLE_VAULT_PASSWORD_FILE to pass it.
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# Ansible Vault Secret Management

## Overview
Ansible Vault encrypts sensitive data — passwords, API keys, TLS certificates, database credentials — so they can live safely in version control alongside your playbooks. Vault uses AES-256 symmetric encryption and supports both file-level and string-level encryption, multiple passwords per project via vault IDs, and integration with external secret managers for password retrieval.

## The Vault/Vars Split Pattern

The most important organizational decision is separating encrypted values from plaintext variable references. This is the standard pattern used by most production Ansible codebases:

```yaml
# group_vars/production/vars.yml (unencrypted — visible in diffs and grep)
db_host: "db.production.internal"
db_port: 5432
db_name: "myapp"
db_user: "{{ vault_db_user }}"
db_password: "{{ vault_db_password }}"
api_key: "{{ vault_api_key }}"
tls_cert_path: /etc/ssl/certs/app.pem

# group_vars/production/vault.yml (encrypted)
vault_db_user: "production_admin"
vault_db_password: "s3cure-pr0d-pa55w0rd"
vault_api_key: "sk-live-abc123def456"
```

The `vault_` prefix convention makes it immediately clear which values are secrets. When you `grep` for `db_password` in your codebase, you find the reference in `vars.yml` and know the actual value lives in the encrypted vault file. Reviewers can see exactly what variables a playbook uses without needing the vault password.

## File-Level Encryption

Use file-level encryption when the entire file contains sensitive data:

```bash
# Encrypt a new or existing file
ansible-vault encrypt group_vars/production/vault.yml

# Edit encrypted file (decrypts to $EDITOR, re-encrypts on save)
ansible-vault edit group_vars/production/vault.yml

# View contents without editing
ansible-vault view group_vars/production/vault.yml

# Decrypt permanently (e.g., migrating to external secret manager)
ansible-vault decrypt group_vars/production/vault.yml

# Change the encryption password
ansible-vault rekey group_vars/production/vault.yml
```

When you run `ansible-vault edit`, Vault decrypts the file to a temporary location, opens your editor, and re-encrypts when you save and close. The plaintext never touches disk in your project directory — it goes to a tmpfs-backed temporary file on Linux.

## String-Level Encryption

String-level encryption (via `encrypt_string`) lets you embed encrypted values directly in otherwise-plaintext YAML files. This is the preferred approach for most projects because it keeps everything in one file while protecting only the sensitive values:

```bash
# Encrypt a string and output the YAML block
ansible-vault encrypt_string 'super_secret_password' --name 'vault_db_password'

# Output:
# vault_db_password: !vault |
#   $ANSIBLE_VAULT;1.1;AES256
#   61346234653031366333...

# Encrypt from stdin (avoids shell history exposure)
echo -n 'my-api-key' | ansible-vault encrypt_string --stdin-name 'vault_api_key'
```

The `echo -n` with stdin approach is important for security: passing the secret directly as a command argument puts it in your shell history file. Using stdin or the `--prompt` flag avoids this. On shared systems, also be aware that `/proc/<pid>/cmdline` exposes command arguments to other users.

Paste the output directly into your vars file. Ansible automatically decrypts `!vault` tagged values at runtime.

## Multi-Environment Vault IDs

Vault IDs solve the problem of managing different secrets for different environments. Without them, you'd either use one password for everything (dangerous — a leaked dev password exposes production) or manually specify which password file to use each time.

```bash
# Encrypt production secrets with the "prod" vault ID
ansible-vault encrypt --vault-id prod@prompt group_vars/production/vault.yml

# Encrypt development secrets with the "dev" vault ID
ansible-vault encrypt --vault-id dev@prompt group_vars/development/vault.yml

# Encrypt a string with a vault ID
ansible-vault encrypt_string --vault-id prod@prompt 'secret_value' --name 'vault_api_key'
```

The format is `<vault-id>@<source>`, where source can be:
- `prompt` — ask interactively
- `/path/to/file` — read from a file
- `/path/to/script.sh` — execute a script that prints the password

```bash
# Run a playbook that needs both prod and dev secrets
ansible-playbook site.yml \
  --vault-id prod@~/.vault_pass_prod \
  --vault-id dev@~/.vault_pass_dev

# Or configure in ansible.cfg
# [defaults]
# vault_identity_list = dev@~/.vault_pass_dev, prod@~/.vault_pass_prod
```

When multiple vault IDs are provided, Ansible tries each one until it finds a match. The vault ID is embedded in the encrypted data header, so Ansible can efficiently select the right password.

## Vault Password Scripts

For automation and team workflows, a password script retrieves the vault password from an external source at runtime:

```bash
#!/bin/bash
# vault-password-prod.sh — retrieves vault password from AWS Secrets Manager

# For different vault IDs, check the --vault-id argument
aws secretsmanager get-secret-value \
  --secret-id "ansible/vault-password-prod" \
  --query 'SecretString' \
  --output text
```

```bash
chmod +x vault-password-prod.sh

# Use the script as the password source
ansible-playbook site.yml --vault-id prod@./vault-password-prod.sh
```

This pattern keeps vault passwords out of files on disk entirely. The script can pull from AWS Secrets Manager, Azure Key Vault, HashiCorp Vault, 1Password CLI, or any other secret backend your team uses.

## External Secret Manager Integration

For organizations that already have a centralized secret manager, you can bypass Ansible Vault entirely and fetch secrets at runtime using lookup plugins:

```yaml
# HashiCorp Vault
- name: Fetch database password from HashiCorp Vault
  ansible.builtin.set_fact:
    db_password: "{{ lookup('community.hashi_vault.hashi_vault', 'secret/data/myapp/db:password') }}"
  no_log: true

# AWS Secrets Manager
- name: Fetch secret from AWS Secrets Manager
  ansible.builtin.set_fact:
    api_key: "{{ lookup('amazon.aws.aws_secret', 'myapp/api-key') }}"
  no_log: true

# Azure Key Vault
- name: Fetch from Azure Key Vault
  ansible.builtin.set_fact:
    db_password: "{{ lookup('azure.azcollection.azure_keyvault_secret', 'db-password', vault_url='https://myvault.vault.azure.net') }}"
  no_log: true
```

The external lookup approach has advantages for large organizations: secrets are centrally managed, rotated, and audited in one place. The tradeoff is a runtime dependency — your playbook fails if the secret manager is unreachable. Ansible Vault works fully offline.

## CI/CD Pipeline Integration

```yaml
# GitHub Actions example
- name: Run Ansible playbook
  env:
    ANSIBLE_VAULT_PASSWORD: ${{ secrets.ANSIBLE_VAULT_PASSWORD }}
  run: |
    echo "$ANSIBLE_VAULT_PASSWORD" > /tmp/.vault-pass
    ansible-playbook -i inventory/production site.yml \
      --vault-password-file /tmp/.vault-pass
    rm -f /tmp/.vault-pass

# Or use the environment variable directly
- name: Run with vault password from env
  env:
    ANSIBLE_VAULT_PASSWORD_FILE: /dev/stdin
  run: |
    echo "${{ secrets.ANSIBLE_VAULT_PASSWORD }}" | \
      ansible-playbook -i inventory/production site.yml
```

For GitLab CI, Jenkins, and other platforms, the pattern is the same: store the vault password as a pipeline secret, write it to a temporary file or pipe it via stdin, and clean up after the run.

## Rekeying and Rotation

Rotate vault passwords when team members leave, when passwords may have been exposed, or on a regular schedule for compliance:

```bash
# Rekey a single file
ansible-vault rekey --vault-id prod@prompt group_vars/production/vault.yml

# Rekey all vault files in a directory
find . -name "vault.yml" -exec ansible-vault rekey --vault-id prod@prompt {} \;

# Rekey with new vault ID
ansible-vault rekey --vault-id prod@old_pass --new-vault-id prod@new_pass group_vars/production/vault.yml
```

After rekeying, commit the re-encrypted files. The actual secret values don't change — only the encryption password wrapping them. Distribute the new vault password through your team's secure channel.

## Best Practices
- **Use the vault/vars split pattern** — separate encrypted vault files from plaintext variable references
- **Prefix vault variables with `vault_`** — makes encrypted values instantly identifiable
- **Use vault IDs for environment separation** — different passwords for dev, staging, production
- **Store vault passwords in a secret manager** — never in flat files on disk or in version control
- **Always set `no_log: true`** on tasks that use vault variables — prevents secrets from appearing in Ansible output and logs
- **Use stdin for `encrypt_string`** — avoids exposing secrets in shell history
- **Configure vault identity list in `ansible.cfg`** — reduces command-line boilerplate for the team

## Common Mistakes
- **Committing unencrypted secrets**: Always encrypt before the first `git add`. Use a pre-commit hook to scan for unencrypted secrets
- **Same vault password for all environments**: A compromised dev password should never expose production secrets
- **Forgetting `no_log: true`**: Secrets appear in plaintext in Ansible output, CI logs, and tower job output
- **Editing vault files with a regular editor**: Opening an encrypted file in vim without `ansible-vault edit` corrupts the encryption envelope
- **Vault password files in the repo**: Even if gitignored, they risk accidental inclusion. Use scripts or environment variables instead
- **Not rekeying after team changes**: Former team members retain access to all secrets encrypted with the old password
