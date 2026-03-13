---
id: ansible-inventory-management
stackId: ansible
type: skill
name: >-
  Ansible Inventory & Variable Management
description: >-
  Design Ansible inventories for multi-environment infrastructure — static and
  dynamic inventories, group variables, host variables, and variable
  precedence for complex deployments.
difficulty: advanced
tags:
  - ansible
  - inventory
  - variable
  - management
  - automation
  - monitoring
  - machine-learning
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Ansible Inventory & Variable Management skill?"
    answer: >-
      Design Ansible inventories for multi-environment infrastructure — static
      and dynamic inventories, group variables, host variables, and variable
      precedence for complex deployments. It includes practical examples for
      ansible development.
  - question: "What tools and setup does Ansible Inventory & Variable Management require?"
    answer: >-
      Works with standard ansible tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Ansible Inventory & Variable Management

## Overview
Ansible inventory defines your infrastructure — which hosts exist, how they are grouped, and what variables apply to each group and host. Proper inventory design is the foundation of scalable Ansible automation.

## Why This Matters
- **Environment separation** — different configs for dev/staging/production
- **Group-based automation** — target webservers, databases, or regions
- **Variable inheritance** — group vars override defaults, host vars override groups
- **Dynamic scaling** — auto-discover cloud instances

## Directory-Based Inventory
```
inventory/
├── production/
│   ├── hosts.yml           # Host definitions
│   ├── group_vars/
│   │   ├── all/
│   │   │   ├── vars.yml    # Shared variables
│   │   │   └── vault.yml   # Encrypted secrets
│   │   ├── webservers.yml  # Web server config
│   │   └── databases.yml   # Database config
│   └── host_vars/
│       └── db-primary.yml  # Host-specific overrides
├── staging/
│   ├── hosts.yml
│   └── group_vars/
│       └── all/
│           └── vars.yml
└── development/
    └── hosts.yml
```

## Static Inventory (YAML)
```yaml
# inventory/production/hosts.yml
all:
  children:
    webservers:
      hosts:
        web-01.prod:
          ansible_host: 10.0.1.10
        web-02.prod:
          ansible_host: 10.0.1.11
    databases:
      hosts:
        db-primary.prod:
          ansible_host: 10.0.2.10
          db_role: primary
        db-replica.prod:
          ansible_host: 10.0.2.11
          db_role: replica
    loadbalancers:
      hosts:
        lb-01.prod:
          ansible_host: 10.0.0.10
```

## Group Variables
```yaml
# inventory/production/group_vars/all/vars.yml
---
environment: production
domain: myapp.com
ntp_servers:
  - 0.pool.ntp.org
  - 1.pool.ntp.org
monitoring_enabled: true
log_level: warn

# inventory/production/group_vars/webservers.yml
---
nginx_worker_processes: 4
nginx_worker_connections: 4096
app_port: 8080
app_replicas: 3

# inventory/production/group_vars/databases.yml
---
postgresql_version: 16
postgresql_max_connections: 200
postgresql_shared_buffers: "4GB"
backup_enabled: true
backup_schedule: "0 2 * * *"
```

## Dynamic Inventory (AWS)
```yaml
# aws_ec2.yml
plugin: amazon.aws.aws_ec2
regions:
  - us-east-1
keyed_groups:
  - key: tags.Environment
    prefix: env
  - key: tags.Role
    prefix: role
filters:
  instance-state-name: running
compose:
  ansible_host: private_ip_address
```

```bash
# Use dynamic inventory
ansible-playbook -i aws_ec2.yml site.yml
```

## Variable Precedence (Low to High)
```
1. Role defaults (defaults/main.yml)
2. Inventory group_vars/all
3. Inventory group_vars/<group>
4. Inventory host_vars/<host>
5. Play vars
6. Role vars (vars/main.yml)
7. Task vars
8. Extra vars (-e / --extra-vars)  ← HIGHEST
```

## Best Practices
- One inventory directory per environment (production/, staging/, development/)
- Use group_vars/all/ for shared settings, group-specific files for overrides
- Keep host_vars minimal — most config should be at group level
- Use dynamic inventory for cloud environments (auto-discover instances)
- Separate vars.yml (plain) from vault.yml (encrypted) in each group

## Common Mistakes
- Single flat inventory file for all environments
- Host-specific variables that should be group variables
- Not understanding variable precedence (unexpected overrides)
- Hardcoding IPs instead of using DNS or dynamic inventory
