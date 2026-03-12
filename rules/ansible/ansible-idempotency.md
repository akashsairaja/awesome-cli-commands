---
id: ansible-idempotency
stackId: ansible
type: rule
name: Ensure All Tasks Are Idempotent
description: >-
  Every Ansible task must be idempotent — running a playbook multiple times must
  produce the same result as running it once. Use modules instead of
  shell/command, and add conditions to raw commands.
difficulty: intermediate
globs:
  - '**/*.yml'
  - '**/*.yaml'
  - '**/ansible/**'
  - '**/playbooks/**'
  - '**/roles/**'
tags:
  - idempotency
  - modules
  - best-practices
  - reliability
  - ansible-lint
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
  - question: What does idempotent mean in Ansible?
    answer: >-
      An idempotent task produces the same result whether run once or multiple
      times. The second run should report 0 changes if the system is already in
      the desired state. Ansible modules (apt, copy, template, service) are
      designed to be idempotent — they check current state before making
      changes.
  - question: How do I make Ansible shell commands idempotent?
    answer: >-
      Three approaches: (1) Use 'creates: /path/to/file' — skips if file exists.
      (2) Use 'when' with a register check — run a non-destructive check first,
      act only if needed. (3) Replace shell with the equivalent module (copy
      instead of echo, get_url instead of curl, lineinfile instead of echo >>).
relatedItems:
  - ansible-task-naming
  - ansible-use-fqcn
  - ansible-role-structure
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Ensure All Tasks Are Idempotent

## Rule
Every task MUST be idempotent. Running a playbook twice must produce the same end state with no unnecessary changes. Prefer modules over shell/command. When using shell/command, add `creates`, `removes`, or `when` conditions.

## Good Examples (Idempotent)
```yaml
# Module-based tasks are naturally idempotent
- name: Install Nginx
  ansible.builtin.apt:
    name: nginx
    state: present
  # Second run: already installed → no change

- name: Ensure config file is deployed
  ansible.builtin.template:
    src: app.conf.j2
    dest: /etc/myapp/app.conf
    mode: "0644"
  # Second run: file unchanged → no change

- name: Ensure service is running
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true
  # Second run: already running → no change
```

## Making Shell Commands Idempotent
```yaml
# Use 'creates' to skip if file exists
- name: Initialize application database
  ansible.builtin.command: /opt/myapp/bin/init-db.sh
  args:
    creates: /opt/myapp/data/initialized.flag

# Use 'when' condition
- name: Install custom binary
  ansible.builtin.shell: |
    curl -L https://example.com/tool -o /usr/local/bin/tool
    chmod +x /usr/local/bin/tool
  args:
    creates: /usr/local/bin/tool

# Check current state before acting
- name: Check if cluster is initialized
  ansible.builtin.command: pg_isready -h localhost
  register: pg_check
  changed_when: false
  failed_when: false

- name: Initialize PostgreSQL cluster
  ansible.builtin.command: pg_createcluster 16 main
  when: pg_check.rc != 0
```

## Bad Examples (Not Idempotent)
```yaml
# BAD: Creates file every run, always shows 'changed'
- name: Create config
  ansible.builtin.shell: echo "setting=value" > /etc/myapp.conf

# BAD: Appends every run (duplicate entries)
- name: Add config line
  ansible.builtin.shell: echo "MaxConnections=100" >> /etc/postgresql.conf

# BAD: Downloads every run
- name: Download binary
  ansible.builtin.command: curl -L https://example.com/tool -o /tmp/tool
```

## Fix the Bad Examples
```yaml
# GOOD: Use copy module (idempotent)
- name: Create config
  ansible.builtin.copy:
    content: "setting=value"
    dest: /etc/myapp.conf

# GOOD: Use lineinfile (idempotent)
- name: Set max connections
  ansible.builtin.lineinfile:
    path: /etc/postgresql.conf
    regexp: '^MaxConnections='
    line: 'MaxConnections=100'

# GOOD: Use get_url with checksum (idempotent)
- name: Download binary
  ansible.builtin.get_url:
    url: https://example.com/tool
    dest: /tmp/tool
    checksum: sha256:abc123...
```

## Testing Idempotency
```bash
# Run playbook twice — second run should have 0 changes
ansible-playbook site.yml -i inventory/staging
ansible-playbook site.yml -i inventory/staging
# Expect: changed=0

# Molecule auto-tests idempotency
molecule test  # Runs converge twice, fails if second run has changes
```

## Enforcement
- Molecule idempotency test (converge twice, check for changes)
- ansible-lint command-instead-of-module rule
- Code review: reject shell/command without creates/when
