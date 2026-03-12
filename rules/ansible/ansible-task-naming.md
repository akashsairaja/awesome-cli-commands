---
id: ansible-task-naming
stackId: ansible
type: rule
name: Name Every Ansible Task
description: >-
  Every Ansible task must have a descriptive name — unnamed tasks are impossible
  to debug, provide no documentation value, and make playbook output unreadable.
difficulty: beginner
globs:
  - '**/*.yml'
  - '**/*.yaml'
  - '**/ansible/**'
  - '**/playbooks/**'
  - '**/roles/**'
tags:
  - task-naming
  - readability
  - debugging
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
  - question: Why must every Ansible task have a name?
    answer: >-
      Task names appear in Ansible's output and logs — they are the primary way
      to understand what is happening and debug failures. Without names, output
      shows only the module name (ansible.builtin.apt) which gives no context.
      Named tasks serve as inline documentation and make playbook runs
      human-readable.
  - question: What makes a good Ansible task name?
    answer: >-
      Good task names describe WHAT the task accomplishes, not HOW. Use sentence
      case: 'Install Nginx web server' not 'apt install nginx'. Be specific:
      'Create application database user with read-only access' not 'Create
      user'. Avoid variables in names — they make output unpredictable.
relatedItems:
  - ansible-use-fqcn
  - ansible-idempotency
  - ansible-role-structure
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Name Every Ansible Task

## Rule
Every task MUST have a descriptive `name` field. Task names MUST describe WHAT the task does, not HOW. Use sentence case without trailing periods.

## Format
```yaml
- name: Install required system packages
  ansible.builtin.apt:
    name: "{{ packages }}"
    state: present
```

## Good Examples
```yaml
- name: Install Nginx web server
  ansible.builtin.apt:
    name: nginx
    state: present

- name: Deploy application configuration
  ansible.builtin.template:
    src: app.conf.j2
    dest: /etc/myapp/config.yml
  notify: Restart application

- name: Create application system user
  ansible.builtin.user:
    name: myapp
    system: true
    shell: /usr/sbin/nologin

- name: Ensure firewall allows HTTPS traffic
  community.general.ufw:
    rule: allow
    port: "443"
    proto: tcp
```

## Bad Examples
```yaml
# BAD: No name (output shows module name only — useless for debugging)
- ansible.builtin.apt:
    name: nginx
    state: present

# BAD: Name describes implementation, not intent
- name: apt install nginx
  ansible.builtin.apt:
    name: nginx

# BAD: Too vague
- name: Do stuff
  ansible.builtin.shell: ./setup.sh

# BAD: Name is just the variable
- name: "{{ package_name }}"
  ansible.builtin.apt:
    name: "{{ package_name }}"
```

## Why Names Matter
```
# With names (easy to understand and debug):
TASK [Install Nginx web server] ****************************
ok: [web-01]
TASK [Deploy application configuration] ********************
changed: [web-01]
TASK [Ensure firewall allows HTTPS traffic] ****************
ok: [web-01]

# Without names (impossible to understand):
TASK [ansible.builtin.apt] *********************************
ok: [web-01]
TASK [ansible.builtin.template] ****************************
changed: [web-01]
TASK [community.general.ufw] *******************************
ok: [web-01]
```

## Enforcement
- ansible-lint rule: name[missing] (enabled by default)
- CI pipeline with ansible-lint --strict
- Code review checklist includes task naming verification
