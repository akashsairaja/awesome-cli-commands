---
id: ansible-role-structure
stackId: ansible
type: skill
name: Ansible Role Design & Structure
description: >-
  Design production-quality Ansible roles with proper directory structure,
  defaults, handlers, templates, molecule tests, and Galaxy metadata for
  reusable automation.
difficulty: intermediate
tags:
  - ansible-roles
  - role-structure
  - molecule
  - galaxy
  - reusability
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Ansible 2.16+
  - molecule (for testing)
  - Basic YAML knowledge
faq:
  - question: What is the standard Ansible role directory structure?
    answer: >-
      An Ansible role has: defaults/ (default variables), vars/ (internal
      variables), tasks/ (automation steps), handlers/ (event-triggered
      actions), templates/ (Jinja2 configs), files/ (static files), meta/
      (metadata and dependencies), and molecule/ (tests). tasks/main.yml and
      defaults/main.yml are the most important files.
  - question: What is the difference between defaults and vars in Ansible roles?
    answer: >-
      defaults/main.yml has the LOWEST variable precedence — users can easily
      override these values in playbooks, inventory, or extra vars.
      vars/main.yml has HIGHER precedence and is intended for internal role
      constants that should not be overridden. Put user-configurable values in
      defaults/, internal values in vars/.
relatedItems:
  - ansible-playbook-architect
  - ansible-vault-secrets
  - ansible-inventory-management
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Ansible Role Design & Structure

## Overview
Ansible roles are the standard unit of reusable automation. A well-structured role has clear defaults, handlers, templates, and tests — making it shareable across teams and projects via Ansible Galaxy or internal registries.

## Why This Matters
- **Reusability** — write once, use across projects and environments
- **Testing** — molecule enables CI testing of infrastructure code
- **Consistency** — standard structure is understood by all Ansible users
- **Maintainability** — clear separation of concerns

## Standard Role Structure
```
roles/nginx/
├── defaults/
│   └── main.yml           # Default variables (lowest precedence)
├── vars/
│   └── main.yml           # Role variables (higher precedence)
├── tasks/
│   ├── main.yml           # Task entry point
│   ├── install.yml        # Installation tasks
│   ├── configure.yml      # Configuration tasks
│   └── service.yml        # Service management
├── handlers/
│   └── main.yml           # Event-triggered actions
├── templates/
│   └── nginx.conf.j2      # Jinja2 templates
├── files/
│   └── ssl-params.conf    # Static files
├── meta/
│   └── main.yml           # Role metadata and dependencies
├── molecule/
│   └── default/
│       ├── molecule.yml    # Test configuration
│       ├── converge.yml    # Test playbook
│       └── verify.yml      # Verification tests
├── README.md
└── .ansible-lint
```

## Implementation Example

### defaults/main.yml
```yaml
---
# Nginx defaults (users can override these)
nginx_worker_processes: auto
nginx_worker_connections: 1024
nginx_keepalive_timeout: 65
nginx_server_names_hash_bucket_size: 64
nginx_client_max_body_size: "10m"
nginx_enable_ssl: false
nginx_ssl_certificate: ""
nginx_ssl_certificate_key: ""
nginx_sites: []
```

### tasks/main.yml
```yaml
---
- name: Include OS-specific variables
  ansible.builtin.include_vars: "{{ ansible_os_family | lower }}.yml"

- name: Install Nginx
  ansible.builtin.include_tasks: install.yml
  tags: [nginx, install]

- name: Configure Nginx
  ansible.builtin.include_tasks: configure.yml
  tags: [nginx, configure]

- name: Manage Nginx service
  ansible.builtin.include_tasks: service.yml
  tags: [nginx, service]
```

### tasks/configure.yml
```yaml
---
- name: Deploy Nginx configuration
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    group: root
    mode: "0644"
    validate: nginx -t -c %s
  notify: Restart Nginx

- name: Deploy site configurations
  ansible.builtin.template:
    src: site.conf.j2
    dest: "/etc/nginx/sites-available/{{ item.name }}.conf"
    owner: root
    group: root
    mode: "0644"
  loop: "{{ nginx_sites }}"
  notify: Reload Nginx
```

### handlers/main.yml
```yaml
---
- name: Restart Nginx
  ansible.builtin.service:
    name: nginx
    state: restarted

- name: Reload Nginx
  ansible.builtin.service:
    name: nginx
    state: reloaded
```

### meta/main.yml
```yaml
---
galaxy_info:
  author: myteam
  description: Install and configure Nginx
  license: MIT
  min_ansible_version: "2.16"
  platforms:
    - name: Ubuntu
      versions: [jammy, noble]
    - name: Debian
      versions: [bookworm]

dependencies: []
```

## Molecule Testing
```yaml
# molecule/default/molecule.yml
---
driver:
  name: docker
platforms:
  - name: ubuntu-noble
    image: ubuntu:24.04
    pre_build_image: true
provisioner:
  name: ansible
verifier:
  name: ansible
```

```bash
# Run tests
molecule test           # Full test lifecycle
molecule converge       # Apply role
molecule verify         # Run verification
molecule destroy        # Clean up
```

## Best Practices
- Use `defaults/` for user-overridable values, `vars/` for internal constants
- Name every task — task names are your documentation
- Use FQCNs (ansible.builtin.copy, not just copy)
- Include `validate:` on template/copy tasks for config files
- Test with molecule before publishing
- Document all defaults in README.md

## Common Mistakes
- Putting overridable defaults in vars/ (too high precedence, hard to override)
- Unnamed tasks (impossible to debug from output)
- Not using handlers (restarting service on every run instead of on change)
- Missing molecule tests (untested roles break in production)
