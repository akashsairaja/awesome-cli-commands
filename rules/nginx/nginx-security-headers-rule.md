---
id: nginx-security-headers-rule
stackId: nginx
type: rule
name: Mandatory Security Headers
description: >-
  Require security headers on all Nginx responses — HSTS, Content-Type-Options,
  Frame-Options, CSP, Referrer-Policy, and Permissions-Policy.
difficulty: beginner
globs:
  - '**/nginx/**/*.conf'
tags:
  - nginx
  - security-headers
  - hsts
  - csp
  - xss
  - clickjacking
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
  - question: Why is the 'always' keyword important in Nginx add_header?
    answer: >-
      Without 'always', Nginx only adds headers to successful responses (2xx,
      3xx). Error pages (404, 500) would not have security headers, leaving them
      vulnerable. The 'always' parameter ensures headers are included on every
      response regardless of status code.
  - question: How do I customize Content-Security-Policy for my application?
    answer: >-
      Start with a restrictive policy (default-src 'self') and add exceptions as
      needed. Use browser console CSP violation reports to identify blocked
      resources. Common additions: 'unsafe-inline' for inline styles, specific
      CDN domains for scripts, and connect-src for API endpoints.
relatedItems:
  - nginx-security-hardening
  - nginx-config-structure
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Mandatory Security Headers

## Rule
Every Nginx server block MUST include security headers. Use a shared include file for consistency across all sites.

## Required Headers
```nginx
# /etc/nginx/conf.d/security-headers.conf
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;
```

## Header Details
| Header | Value | Purpose |
|--------|-------|---------|
| Strict-Transport-Security | max-age=31536000 | Force HTTPS for 1 year |
| X-Content-Type-Options | nosniff | Prevent MIME type sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | Enable XSS filter |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer information |
| Permissions-Policy | camera=(), microphone=() | Restrict browser APIs |
| Content-Security-Policy | default-src 'self' | Control resource loading |

## Usage
```nginx
server {
    include /etc/nginx/conf.d/security-headers.conf;
    # ... rest of config
}
```

## Important: The always Keyword
Always use the `always` parameter — without it, headers are only added to successful responses (2xx/3xx), not error responses (4xx/5xx).

## Examples

### Good
- All headers with `always` parameter
- Shared include file used across all sites
- CSP customized per application needs

### Bad
- Missing HSTS (vulnerable to SSL stripping)
- Headers without `always` (missing on error pages)
- No CSP (allows arbitrary script loading)
- X-Frame-Options set to SAMEORIGIN when DENY is appropriate

## Enforcement
Test headers with: `curl -I https://example.com`
Scan with securityheaders.com for compliance.
Include header check in monitoring.
