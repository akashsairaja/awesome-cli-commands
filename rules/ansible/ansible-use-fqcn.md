---
id: ansible-use-fqcn
stackId: ansible
type: rule
name: Use Fully Qualified Collection Names
description: >-
  Always use fully qualified collection names (FQCNs) for Ansible modules —
  ansible.builtin.copy instead of copy — to prevent ambiguity, ensure correct
  module resolution, and future-proof playbooks.
difficulty: beginner
globs:
  - '**/*.yml'
  - '**/*.yaml'
  - '**/ansible/**'
  - '**/playbooks/**'
  - '**/roles/**'
tags:
  - fqcn
  - collections
  - modules
  - ansible-lint
  - best-practices
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
  - question: What is a Fully Qualified Collection Name in Ansible?
    answer: >-
      A FQCN is the complete module reference in the format
      namespace.collection.module — for example, ansible.builtin.copy instead of
      just copy. FQCNs prevent ambiguity when multiple collections define
      modules with the same short name and ensure the correct module is always
      used.
  - question: Why are short module names problematic in Ansible?
    answer: >-
      Short names like 'copy' or 'shell' are ambiguous — if you install a
      collection that defines its own 'copy' module, Ansible may use the wrong
      one. FQCNs explicitly specify which collection's module to use. Ansible
      2.10+ introduced collections and FQCNs are the recommended standard.
relatedItems:
  - ansible-task-naming
  - ansible-idempotency
  - ansible-playbook-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Use Fully Qualified Collection Names

## Rule
All module references MUST use fully qualified collection names (FQCNs). Short names like `copy` or `apt` are ambiguous and may resolve to wrong modules when collections are installed.

## Format
```yaml
# FQCN format: <namespace>.<collection>.<module>
ansible.builtin.copy
ansible.builtin.template
ansible.builtin.apt
community.general.ufw
amazon.aws.ec2_instance
```

## Good Examples
```yaml
- name: Copy configuration file
  ansible.builtin.copy:
    src: app.conf
    dest: /etc/myapp/app.conf

- name: Install packages
  ansible.builtin.apt:
    name: "{{ packages }}"
    state: present

- name: Create EC2 instance
  amazon.aws.ec2_instance:
    name: web-server
    instance_type: t3.medium

- name: Manage firewall rule
  community.general.ufw:
    rule: allow
    port: "443"
```

## Bad Examples
```yaml
# BAD: Short names (ambiguous)
- name: Copy file
  copy:
    src: app.conf
    dest: /etc/myapp/app.conf

- name: Install packages
  apt:
    name: nginx

- name: Run shell command
  shell: echo "hello"
```

## Common FQCNs
| Short Name | FQCN |
|-----------|------|
| copy | ansible.builtin.copy |
| template | ansible.builtin.template |
| file | ansible.builtin.file |
| apt | ansible.builtin.apt |
| yum | ansible.builtin.yum |
| service | ansible.builtin.service |
| shell | ansible.builtin.shell |
| command | ansible.builtin.command |
| debug | ansible.builtin.debug |
| user | ansible.builtin.user |
| group | ansible.builtin.group |
| git | ansible.builtin.git |
| uri | ansible.builtin.uri |
| pip | ansible.builtin.pip |
| set_fact | ansible.builtin.set_fact |
| include_tasks | ansible.builtin.include_tasks |
| import_role | ansible.builtin.import_role |

## Enforcement
- ansible-lint rule: fqcn[action-core], fqcn[action]
- CI pipeline with ansible-lint
- VS Code Ansible extension highlights short names
