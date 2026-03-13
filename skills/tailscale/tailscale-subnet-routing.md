---
id: tailscale-subnet-routing
stackId: tailscale
type: skill
name: Set Up Tailscale Subnet Routing and Exit Nodes
description: >-
  Configure Tailscale subnet routers to access private networks and exit nodes
  for secure internet access — AWS VPC access, office network routing, and
  remote work security.
difficulty: intermediate
tags:
  - tailscale
  - set
  - subnet
  - routing
  - exit
  - nodes
  - security
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Set Up Tailscale Subnet Routing and Exit Nodes skill?"
    answer: >-
      Configure Tailscale subnet routers to access private networks and exit
      nodes for secure internet access — AWS VPC access, office network
      routing, and remote work security. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Set Up Tailscale Subnet Routing and Exit Nodes require?"
    answer: >-
      Requires psql installed. Works with tailscale projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Set Up Tailscale Subnet Routing and Exit Nodes

## Overview
Subnet routing lets you access entire private networks (AWS VPCs, office LANs) through a single Tailscale device. Exit nodes route all internet traffic through a specific location for security or geo-access. Both avoid installing Tailscale on every device.

## Why This Matters
- **VPC access** — reach AWS/GCP resources without traditional VPN
- **Office access** — connect to office network devices remotely
- **Minimal installation** — one Tailscale device serves entire subnet
- **Secure browsing** — exit nodes encrypt all internet traffic

## How It Works

### Step 1: Advertise Subnet Routes
```bash
# On a server in the private network (e.g., AWS EC2 instance)
# Enable IP forwarding
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
sudo sysctl -p /etc/sysctl.d/99-tailscale.conf

# Advertise the VPC subnet
sudo tailscale up --advertise-routes=10.0.0.0/16,172.16.0.0/12

# Verify
tailscale status
```

### Step 2: Approve Routes (Admin Console or ACL)
```json
// In ACL policy — auto-approve routes from tagged servers
{
  "autoApprovers": {
    "routes": {
      "10.0.0.0/16": ["tag:aws-router"],
      "172.16.0.0/12": ["tag:office-router"]
    }
  }
}
```

### Step 3: Access Subnet Resources
```bash
# From any Tailscale client, access subnet resources directly
ssh admin@10.0.1.50       # AWS RDS instance
curl http://10.0.2.100    # Internal service
psql -h 10.0.3.200        # Database in private subnet
```

### Step 4: Configure Exit Node
```bash
# On the exit node server
sudo tailscale up --advertise-exit-node

# Auto-approve in ACL
{
  "autoApprovers": {
    "exitNode": ["tag:exit-node"]
  }
}
```

### Step 5: Use Exit Node from Client
```bash
# Route all traffic through exit node
sudo tailscale up --exit-node=exit-server-name

# Or use the Tailscale GUI on macOS/Windows
# Click the exit node in the menu

# Verify
curl ifconfig.me  # Should show exit node's IP
```

### Step 6: Split DNS for Hybrid Routing
```json
// Route only specific domains through Tailscale
{
  "dns": {
    "nameservers": ["100.100.100.100"],
    "routes": {
      "internal.company.com": ["10.0.0.2"],
      "staging.company.com": ["10.0.0.3"]
    }
  }
}
```

## Best Practices
- Enable IP forwarding on subnet router before advertising routes
- Use autoApprovers in ACLs for automated infrastructure
- Advertise only the specific subnets needed (not 0.0.0.0/0)
- Set up redundant subnet routers for high availability
- Use ACLs to control who can access advertised subnets
- Monitor subnet router health and connectivity

## Common Mistakes
- Forgetting to enable IP forwarding (routes advertised but do not work)
- Advertising overly broad subnets (0.0.0.0/0 routes all traffic)
- No redundant subnet routers (single point of failure)
- Not restricting subnet access with ACLs (everyone can reach everything)
- Using exit nodes when split tunneling would suffice
