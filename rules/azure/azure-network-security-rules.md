---
id: azure-network-security-rules
stackId: azure
type: rule
name: Network Security Group Standards
description: >-
  Enforce Azure NSG standards — deny all inbound by default, allow specific
  ports from specific sources, use Application Security Groups, and log all
  traffic with NSG flow logs.
difficulty: intermediate
globs:
  - '**/*.bicep'
  - '**/*.tf'
  - '**/*.json'
  - '**/network/**'
tags:
  - nsg
  - network-security
  - firewall-rules
  - asg
  - flow-logs
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
  - question: What are Azure Application Security Groups and why should I use them?
    answer: >-
      Application Security Groups (ASGs) let you group VMs by role (web, api,
      database) and write NSG rules that reference groups instead of IP
      addresses. This simplifies rule management — when you add a new VM to the
      web ASG, it automatically gets the correct network access without updating
      NSG rules.
  - question: Should every Azure subnet have a Network Security Group?
    answer: >-
      Yes. Every subnet should have an NSG with a default deny-all-inbound rule.
      Specific allow rules are added for legitimate traffic. Subnets without
      NSGs allow all traffic, which violates the zero-trust principle. Azure
      Policy can enforce NSG association on all subnets.
relatedItems:
  - azure-resource-group-conventions
  - azure-infrastructure-architect
  - kubernetes-network-policy
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Network Security Group Standards

## Rule
Every subnet MUST have an NSG attached. Default rule: deny all inbound, allow specific traffic. All NSGs MUST have flow logs enabled for security monitoring.

## Default Deny Configuration
```bicep
resource nsg 'Microsoft.Network/networkSecurityGroups@2023-09-01' = {
  name: '${namePrefix}-app-nsg'
  location: location
  properties: {
    securityRules: [
      {
        name: 'AllowHTTPS'
        properties: {
          priority: 100
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourceAddressPrefix: 'Internet'
          sourcePortRange: '*'
          destinationAddressPrefix: 'VirtualNetwork'
          destinationPortRange: '443'
        }
      }
      {
        name: 'DenyAllInbound'
        properties: {
          priority: 4096
          direction: 'Inbound'
          access: 'Deny'
          protocol: '*'
          sourceAddressPrefix: '*'
          sourcePortRange: '*'
          destinationAddressPrefix: '*'
          destinationPortRange: '*'
        }
      }
    ]
  }
}
```

## Application Security Groups
```bicep
// Group VMs by role, not by IP
resource appAsg 'Microsoft.Network/applicationSecurityGroups@2023-09-01' = {
  name: '${namePrefix}-app-asg'
  location: location
}

resource dbAsg 'Microsoft.Network/applicationSecurityGroups@2023-09-01' = {
  name: '${namePrefix}-db-asg'
  location: location
}

// NSG rule using ASGs
{
  name: 'AllowAppToDb'
  properties: {
    priority: 200
    direction: 'Inbound'
    access: 'Allow'
    protocol: 'Tcp'
    sourceApplicationSecurityGroups: [{ id: appAsg.id }]
    destinationApplicationSecurityGroups: [{ id: dbAsg.id }]
    sourcePortRange: '*'
    destinationPortRange: '5432'
  }
}
```

## Good Examples
```
Priority 100: Allow HTTPS from Internet to Web ASG
Priority 200: Allow 8080 from Web ASG to API ASG
Priority 300: Allow 5432 from API ASG to DB ASG
Priority 4096: Deny All Inbound
```

## Bad Examples
```
# BAD: Allow all inbound
Priority 100: Allow * from * to *

# BAD: Using IP addresses instead of ASGs
Priority 100: Allow from 10.0.1.4 to 10.0.2.5

# BAD: No NSG on subnet
Subnet with no associated NSG
```

## Enforcement
- Azure Policy: every subnet must have an NSG
- Azure Policy: NSG must have flow logs enabled
- Azure Security Center recommendations
- Regular NSG rule audit for overly permissive rules
