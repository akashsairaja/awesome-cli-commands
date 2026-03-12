---
id: packer-provisioner-patterns
stackId: packer
type: rule
name: Provisioner Organization Patterns
description: >-
  Organize Packer provisioners effectively — use shell scripts over inline
  commands, order provisioners logically, handle errors properly, and use file
  provisioners for configuration.
difficulty: beginner
globs:
  - '**/*.pkr.hcl'
  - '**/scripts/*.sh'
  - '**/packer/**'
tags:
  - provisioners
  - shell-scripts
  - file-upload
  - build-ordering
  - automation
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
  - question: Why use external scripts instead of inline provisioners in Packer?
    answer: >-
      External scripts are testable independently (shellcheck, unit tests),
      version-controlled with meaningful diffs, reusable across templates, and
      easier to debug. Inline commands become unmaintainable beyond 3-4 lines
      and cannot be linted or tested outside Packer.
  - question: In what order should Packer provisioners run?
    answer: >-
      Follow this order: (1) Upload config files with file provisioner, (2)
      Install packages, (3) Configure services using uploaded files, (4) Harden
      the image, (5) Cleanup as the last step. This ensures files are available
      before configuration and cleanup removes all build artifacts.
relatedItems:
  - packer-template-conventions
  - packer-hardening-practices
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Provisioner Organization Patterns

## Rule
Use external shell scripts instead of inline commands for provisioners. Order provisioners logically: upload files first, then install, configure, harden, and cleanup last.

## Provisioner Ordering
```
1. file          — Upload configuration files
2. shell (setup) — Install packages, create users
3. shell (config) — Configure services, set permissions
4. shell (harden) — Security hardening
5. shell (cleanup) — Remove temp files, SSH keys
```

## Good Examples
```hcl
build {
  sources = ["source.amazon-ebs.base"]

  # 1. Upload configuration files
  provisioner "file" {
    source      = "files/nginx.conf"
    destination = "/tmp/nginx.conf"
  }

  provisioner "file" {
    source      = "files/app.service"
    destination = "/tmp/app.service"
  }

  # 2. Install packages
  provisioner "shell" {
    script = "scripts/install.sh"
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "APP_VERSION=${var.app_version}",
    ]
  }

  # 3. Configure services
  provisioner "shell" {
    script = "scripts/configure.sh"
  }

  # 4. Security hardening
  provisioner "shell" {
    script = "scripts/harden.sh"
  }

  # 5. Cleanup (always last)
  provisioner "shell" {
    script = "scripts/cleanup.sh"
  }
}
```

## Bad Examples
```hcl
# BAD: Long inline commands — hard to maintain and debug
provisioner "shell" {
  inline = [
    "sudo apt-get update",
    "sudo apt-get install -y nginx postgresql redis",
    "sudo systemctl enable nginx",
    "sudo cp /tmp/nginx.conf /etc/nginx/nginx.conf",
    "sudo rm -rf /tmp/*",
    # 50 more lines...
  ]
}

# BAD: No error handling in scripts
provisioner "shell" {
  inline = ["cd /nonexistent && rm -rf *"]
  # No set -e, cd fails silently, rm runs in wrong directory
}
```

## Enforcement
- External scripts MUST start with `set -euo pipefail`
- Limit inline provisioners to 3 commands maximum
- CI validates provisioner ordering in templates
- Test builds in a disposable environment before publishing
