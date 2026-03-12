---
id: nginx-config-structure
stackId: nginx
type: rule
name: Nginx Configuration File Standards
description: >-
  Enforce consistent Nginx configuration structure — modular file organization,
  naming conventions, include patterns, and mandatory directives for all server
  blocks.
difficulty: beginner
globs:
  - '**/nginx/**/*.conf'
  - '**/nginx.conf'
  - '**/sites-available/**'
tags:
  - nginx
  - configuration
  - organization
  - standards
  - modular
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
  - question: How should I organize Nginx configuration files?
    answer: >-
      Use a modular structure: main nginx.conf for global settings, conf.d/ for
      shared snippets (SSL, gzip, headers), sites-available/ for site configs,
      and sites-enabled/ for symlinks to active sites. This makes configs
      reusable, reviewable, and easy to enable/disable sites.
  - question: Why should I set server_tokens off in Nginx?
    answer: >-
      server_tokens off hides the Nginx version number from response headers and
      error pages. This prevents attackers from identifying the exact version
      and targeting known vulnerabilities. It is a basic security hardening step
      that should be in every production configuration.
relatedItems:
  - nginx-reverse-proxy-architect
  - nginx-security-hardening
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Nginx Configuration File Standards

## Rule
All Nginx configurations MUST follow a modular file structure with clear separation of concerns. Every server block MUST include security headers, logging, and error handling.

## Directory Structure
```
/etc/nginx/
  nginx.conf              # Main config (workers, events, http block)
  conf.d/
    ssl-params.conf       # Shared SSL settings
    gzip.conf             # Compression settings
    security-headers.conf # Security headers
    proxy-params.conf     # Shared proxy settings
  sites-available/
    example.com.conf      # Site config
    api.example.com.conf  # API config
  sites-enabled/
    example.com.conf -> ../sites-available/example.com.conf  # Symlinks
  snippets/
    ssl-example.com.conf  # Certificate paths
```

## Mandatory Directives

### Every nginx.conf
```nginx
worker_processes auto;
worker_rlimit_nofile 65535;
error_log /var/log/nginx/error.log warn;
pid /run/nginx.pid;

events {
    worker_connections 4096;
    multi_accept on;
}

http {
    server_tokens off;        # Hide version
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*.conf;
}
```

### Every Server Block
```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    # SSL
    include /etc/nginx/conf.d/ssl-params.conf;

    # Security headers
    include /etc/nginx/conf.d/security-headers.conf;

    # Logging
    access_log /var/log/nginx/example.com.access.log combined;
    error_log /var/log/nginx/example.com.error.log warn;

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

## Naming Conventions
- Site configs: `domain.conf` (e.g., `example.com.conf`)
- Snippet files: descriptive name (e.g., `ssl-params.conf`)
- Log files: `domain.access.log`, `domain.error.log`

## Examples

### Good
- Modular configs with includes for shared settings
- Per-site log files for easy debugging
- server_tokens off in main config
- Security headers included in every server block

### Bad
- All configuration in a single nginx.conf
- No security headers
- server_tokens on (version exposed)
- Shared log files for all sites (hard to debug)

## Enforcement
Use `nginx -t` to validate before reloading.
Store configs in version control.
Review configuration changes in PRs.
