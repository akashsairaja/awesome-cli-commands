---
id: tailscale-acl-design
stackId: tailscale
type: skill
name: Design Tailscale ACL Policies
description: >-
  Master Tailscale ACL design — groups, tags, autogroups, port-based access,
  subnet policies, and testing ACL changes before deployment.
difficulty: intermediate
tags:
  - tailscale
  - acl
  - access-control
  - zero-trust
  - security
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Tailscale account with admin access
  - Understanding of network ports and protocols
faq:
  - question: How do Tailscale ACL tests work?
    answer: >-
      ACL tests verify that your rules work as expected before applying them.
      Define test cases with src (user or tag), accept (should be allowed), and
      deny (should be blocked). Tailscale evaluates the tests against your ACL
      rules and reports any failures. Always write tests before modifying
      production ACLs.
  - question: What is the difference between groups and tags in Tailscale ACLs?
    answer: >-
      Groups represent people (users with email addresses). Tags represent
      devices and services (tag:server, tag:ci). Groups are used in 'src' for
      who is making the connection. Tags are used in both 'src' and 'dst' for
      device-to-device communication rules.
  - question: What are autoApprovers in Tailscale?
    answer: >-
      AutoApprovers automatically approve subnet routes and exit nodes
      advertised by tagged devices. Without autoApprovers, an admin must
      manually approve each route advertisement. Use them for CI/CD runners,
      autoscaling servers, and any automated infrastructure that needs to
      advertise routes.
relatedItems:
  - tailscale-network-architect
  - tailscale-ssh-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Design Tailscale ACL Policies

## Overview
Tailscale ACL (Access Control List) policies define who can access what on your tailnet. They follow zero-trust principles: deny everything by default, then explicitly allow specific access paths between groups, tags, and ports.

## Why This Matters
- **Zero trust** — no implicit trust between devices
- **Least privilege** — each role only accesses what it needs
- **Auditable** — access rules are explicit and reviewable
- **Scalable** — tags and groups manage thousands of devices

## How It Works

### Step 1: Define Groups
```json
{
  "groups": {
    "group:engineering": ["user1@company.com", "user2@company.com"],
    "group:ops": ["ops1@company.com", "ops2@company.com"],
    "group:executives": ["ceo@company.com", "cto@company.com"]
  }
}
```

### Step 2: Define Tag Owners
```json
{
  "tagOwners": {
    "tag:server": ["group:ops"],
    "tag:staging": ["group:engineering", "group:ops"],
    "tag:production": ["group:ops"],
    "tag:ci": ["group:ops"],
    "tag:monitoring": ["group:ops"]
  }
}
```

### Step 3: Define ACL Rules
```json
{
  "acls": [
    // Engineering can access staging on web ports
    {
      "action": "accept",
      "src": ["group:engineering"],
      "dst": ["tag:staging:80,443,3000,5432"]
    },
    // Ops can access everything
    {
      "action": "accept",
      "src": ["group:ops"],
      "dst": ["tag:server:*", "tag:staging:*", "tag:production:*"]
    },
    // CI can access staging for deployments
    {
      "action": "accept",
      "src": ["tag:ci"],
      "dst": ["tag:staging:22,443"]
    },
    // Monitoring can reach all servers on metrics port
    {
      "action": "accept",
      "src": ["tag:monitoring"],
      "dst": ["tag:server:9090,9100,3000"]
    },
    // Everyone can access monitoring dashboards
    {
      "action": "accept",
      "src": ["autogroup:member"],
      "dst": ["tag:monitoring:3000"]
    }
  ]
}
```

### Step 4: Configure Auto-Approvers
```json
{
  "autoApprovers": {
    "routes": {
      "10.0.0.0/8": ["tag:server"],
      "172.16.0.0/12": ["tag:server"]
    },
    "exitNode": ["tag:server"]
  }
}
```

### Step 5: Test ACL Changes
```bash
# Use Tailscale ACL test feature before applying
# In Tailscale admin console: Access Controls > Tests

# Test syntax:
{
  "tests": [
    {
      "src": "user1@company.com",
      "accept": ["tag:staging:443"],
      "deny": ["tag:production:443"]
    },
    {
      "src": "tag:ci",
      "accept": ["tag:staging:22"],
      "deny": ["tag:production:22"]
    }
  ]
}
```

## Best Practices
- Start with deny-all, add specific allows incrementally
- Use groups for people, tags for devices and services
- Test ACL changes before applying (Tailscale has built-in testing)
- Use port-specific rules (not wildcard ports unless needed)
- Document the purpose of each ACL rule with comments
- Review ACLs quarterly as team and infrastructure evolve
- Use autoApprovers for automated infrastructure (CI, autoscaling)

## Common Mistakes
- Starting with `*:*` (allow all) and planning to restrict later
- Not using tags (ACLs based on individual device names)
- Forgetting to update ACLs when team members change roles
- No ACL tests (changes break access unexpectedly)
- Using wildcarded ports when specific ports would suffice
