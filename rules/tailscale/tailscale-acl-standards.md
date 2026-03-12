---
id: tailscale-acl-standards
stackId: tailscale
type: rule
name: Tailscale ACL Policy Standards
description: >-
  Enforce zero-trust ACL policy standards — deny-by-default, tag requirements,
  group-based access, port specificity, and mandatory ACL testing before
  deployment.
difficulty: intermediate
globs:
  - '**/tailscale/**/*.json'
  - '**/tailscale/**/*.hujson'
tags:
  - tailscale
  - acl
  - zero-trust
  - security
  - standards
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
  - question: Why must all Tailscale devices be tagged?
    answer: >-
      Tags enable scalable ACL management. Without tags, you must reference
      individual device names in ACL rules — which breaks when devices are
      replaced or renamed. Tags group devices by function (tag:server,
      tag:database) so ACLs remain stable as infrastructure changes.
  - question: How often should I review Tailscale ACL policies?
    answer: >-
      Review ACLs quarterly or when team structure changes. Look for: stale
      rules referencing departed employees, overly broad rules that should be
      tightened, missing rules for new services, and test coverage for all
      critical access paths. Treat ACL reviews like code reviews.
relatedItems:
  - tailscale-network-architect
  - tailscale-acl-design
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Tailscale ACL Policy Standards

## Rule
All Tailscale ACL policies MUST follow zero-trust principles. Deny by default, allow specific access only. All devices MUST be tagged. All ACL changes MUST include tests.

## Format
```json
{
  "groups": { ... },
  "tagOwners": { ... },
  "acls": [ ... ],
  "ssh": [ ... ],
  "tests": [ ... ]
}
```

## Requirements

### Groups
- Define groups for every team or role
- Use email addresses, not usernames
- Keep groups aligned with SSO/IdP groups

### Tags
- ALL servers MUST be tagged (tag:server, tag:production, tag:staging)
- ALL CI/CD devices MUST be tagged (tag:ci)
- Tag names use kebab-case: tag:web-server, tag:database

### ACL Rules
```json
// GOOD: Specific ports, tagged destinations
{ "action": "accept", "src": ["group:engineering"], "dst": ["tag:staging:443,3000"] }

// BAD: Wildcard everything
{ "action": "accept", "src": ["*"], "dst": ["*:*"] }
```

### Mandatory Tests
```json
{
  "tests": [
    { "src": "dev@company.com", "accept": ["tag:staging:443"], "deny": ["tag:production:443"] },
    { "src": "tag:ci", "accept": ["tag:staging:22"], "deny": ["tag:production:*"] },
    { "src": "ops@company.com", "accept": ["tag:production:22,443"] }
  ]
}
```

## Rules
1. NEVER use `"*"` in src or `"*:*"` in dst
2. ALL devices MUST have at least one tag
3. Use port-specific rules (not wildcard ports) unless justified
4. ALL ACL changes MUST include corresponding tests
5. Review ACLs quarterly for stale rules
6. Use autoApprovers for automated infrastructure only

## Examples

### Good
- Engineering accesses staging on ports 443 and 3000 only
- Ops accesses production with specific port rules
- CI tagged and limited to deployment ports
- Tests verify both allow and deny cases

### Bad
- `"*:*"` allowing all traffic (no zero trust)
- Untagged devices (cannot manage at scale)
- No tests (changes break access silently)
- Wildcard ports when specific ports are known

## Enforcement
ACL changes must be reviewed by security team.
Tests must pass before applying changes.
Quarterly ACL audit with team leads.
