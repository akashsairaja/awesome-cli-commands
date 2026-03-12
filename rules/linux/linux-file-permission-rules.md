---
id: linux-file-permission-rules
stackId: linux
type: rule
name: Linux File Permission Standards
description: >-
  Enforce secure file permissions on Linux — minimum necessary permissions for
  files, directories, secrets, and scripts with specific numeric mode
  requirements.
difficulty: beginner
globs:
  - '**/*.sh'
  - '**/.env*'
  - '**/*.pem'
  - '**/*.key'
tags:
  - permissions
  - security
  - chmod
  - secrets
  - file-system
  - linux
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
  - question: Why is chmod 777 dangerous on Linux?
    answer: >-
      chmod 777 gives read, write, and execute permissions to every user on the
      system. Any compromised process, malicious user, or script can read
      secrets, modify files, or execute code. It is the most common security
      misconfiguration on Linux servers. Use the minimum permissions needed: 644
      for files, 755 for directories.
  - question: What permissions should .env files have on Linux?
    answer: >-
      Always 600 (owner read/write only). The .env file contains secrets (API
      keys, database passwords) that should only be readable by the application
      owner. Verify with: find . -name '.env*' -perm /077 to find overly
      permissive .env files.
relatedItems:
  - linux-security-hardening
  - linux-file-permissions
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Linux File Permission Standards

## Rule
All files and directories MUST have the minimum permissions necessary. Never use 777. Secrets must be 600 or stricter.

## Format
```bash
# File type         Recommended    Maximum
Regular files       644            644
Executable scripts  755            755
Secret/credentials  600            600
SSH private keys    600            600
Directories         755            755
Private directories 700            700
Shared directories  2775           2775 (setgid)
```

## Requirements

### 1. Secret Files
```bash
# MANDATORY: 600 for all secrets
chmod 600 .env
chmod 600 *.pem
chmod 600 *.key
chmod 600 credentials.*
chmod 600 ~/.ssh/id_*

# Check for overly permissive secrets
find /opt/myapp -name ".env*" -perm /077 -ls
find /opt/myapp -name "*.key" -perm /077 -ls
```

### 2. Application Files
```bash
# Configuration: readable, not writable by others
chmod 644 /opt/myapp/config.json
chmod 644 /etc/nginx/nginx.conf

# Application code: read-only
chmod 644 /opt/myapp/src/**/*.js
chmod 755 /opt/myapp/src/    # Directories need execute for traversal
```

### 3. Never Use 777
```bash
# BAD: World-writable (anyone can modify)
chmod 777 /var/www/uploads/    # Security vulnerability

# GOOD: Owner + group write, others read
chmod 775 /var/www/uploads/
chown www-data:www-data /var/www/uploads/
```

## Anti-Patterns
- chmod 777 on anything (world-writable = compromised)
- World-readable .env files (secrets exposed)
- Root-owned files that services need to write
- Not setting restrictive permissions on /tmp contents
- Default umask 022 for sensitive systems (should be 027 or 077)

## Enforcement
```bash
# Find world-writable files (security audit)
find / -xdev -type f -perm -0002 -ls 2>/dev/null

# Find files with setuid bit (potential privilege escalation)
find / -xdev -type f -perm -4000 -ls 2>/dev/null

# Set secure umask
echo "umask 027" >> /etc/profile
```
