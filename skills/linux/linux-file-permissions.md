---
id: linux-file-permissions
stackId: linux
type: skill
name: Linux File Permissions & Ownership
description: >-
  Master Linux file permissions — chmod numeric and symbolic modes, chown
  ownership, setuid/setgid, sticky bit, ACLs, and umask configuration for secure
  file management.
difficulty: beginner
tags:
  - permissions
  - chmod
  - chown
  - ownership
  - security
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
prerequisites:
  - Linux terminal basics
faq:
  - question: What do Linux file permission numbers like 644 and 755 mean?
    answer: >-
      Each digit represents permissions for owner, group, and others. The digit
      is a sum: 4=read, 2=write, 1=execute. So 644 means owner read+write (6),
      group read (4), others read (4). 755 means owner all permissions (7),
      group read+execute (5), others read+execute (5). 600 means owner
      read+write only.
  - question: What is the sticky bit in Linux and when should I use it?
    answer: >-
      The sticky bit (chmod +t) on a directory prevents users from deleting or
      renaming files they don't own, even if they have write permission on the
      directory. /tmp uses this (permissions 1777) so all users can create files
      but can't delete each other's files. Use it on any shared writable
      directory.
relatedItems:
  - linux-system-administrator
  - linux-security-hardening
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Linux File Permissions & Ownership

## Overview
Linux file permissions control who can read, write, and execute every file and directory. The permission model has three levels: owner, group, and others. Getting permissions right is essential for security — too permissive is a vulnerability, too restrictive breaks applications.

## Why This Matters
- Wrong permissions cause "Permission denied" errors that break applications
- Over-permissive files (777) are a major security vulnerability
- Understanding permissions is required for every Linux server task

## Permission Basics

### Step 1: Read Permission Strings
```bash
ls -la
# -rw-r--r-- 1 alice developers 4096 Mar 1 12:00 config.json
# drwxr-xr-x 2 alice developers 4096 Mar 1 12:00 scripts/

# Breakdown: -rw-r--r--
# -    = file type (- file, d directory, l symlink)
# rw-  = owner permissions (read, write, no execute)
# r--  = group permissions (read only)
# r--  = others permissions (read only)
```

### Step 2: Change Permissions with chmod
```bash
# Numeric mode (most common)
chmod 644 config.json    # Owner: rw, Group: r, Others: r
chmod 755 scripts/       # Owner: rwx, Group: rx, Others: rx
chmod 600 .env           # Owner: rw, Group: none, Others: none
chmod 700 private-dir/   # Owner: rwx, Group: none, Others: none

# Permission numbers:
# 4 = read (r)
# 2 = write (w)
# 1 = execute (x)
# Sum for each level: 7=rwx, 6=rw, 5=rx, 4=r, 0=none

# Symbolic mode
chmod u+x script.sh      # Add execute for owner
chmod g-w config.json     # Remove write for group
chmod o-rwx secret.key    # Remove all for others
chmod a+r readme.txt      # Add read for all (a=all)
```

### Step 3: Change Ownership with chown
```bash
# Change owner
sudo chown alice config.json

# Change owner and group
sudo chown alice:developers config.json

# Recursive for directories
sudo chown -R alice:developers /opt/myapp/

# Change only group
sudo chgrp developers config.json
```

### Step 4: Common Permission Patterns
```bash
# Web application files
chmod 644 /var/www/html/*.html    # Readable by web server
chmod 755 /var/www/html/          # Directory traversable

# Application data
chmod 600 /opt/myapp/.env         # Only owner can read secrets
chmod 700 /opt/myapp/data/        # Only owner can access data dir

# Scripts
chmod 755 /opt/scripts/*.sh       # Everyone can execute
chmod 700 /opt/scripts/admin.sh   # Only owner can execute

# SSH keys
chmod 600 ~/.ssh/id_rsa           # Private key: owner only
chmod 644 ~/.ssh/id_rsa.pub       # Public key: readable
chmod 700 ~/.ssh/                  # SSH directory: owner only
```

### Step 5: Special Permissions
```bash
# Setuid (runs as file owner, not executing user)
chmod u+s /usr/bin/passwd    # 4755 — runs as root for password changes

# Setgid on directory (new files inherit group)
chmod g+s /opt/shared/       # 2775 — files created get group "shared"

# Sticky bit (only owner can delete files in directory)
chmod +t /tmp                # 1777 — prevents users deleting others' files
```

## Best Practices
- Never use chmod 777 — it gives full access to everyone
- Use 600 for secrets (.env, private keys, credentials)
- Use 644 for regular files, 755 for directories and executables
- Use chown to assign proper ownership to service users
- Set umask 027 in /etc/profile for secure default permissions

## Common Mistakes
- chmod 777 to "fix" permission errors (find the real cause instead)
- Not setting permissions on .env and credential files
- Forgetting to chmod +x on scripts ("Permission denied" on execution)
- Using root ownership for files that services need to write
