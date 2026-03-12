---
id: azure-mandatory-tags
stackId: azure
type: rule
name: Mandatory Tags on All Azure Resources
description: >-
  Enforce mandatory tags on every Azure resource using Azure Policy — Project,
  Environment, Team, and ManagedBy tags required at creation, with inheritance
  from resource groups.
difficulty: beginner
globs:
  - '**/*.bicep'
  - '**/*.tf'
  - '**/*.json'
  - '**/azure/**'
tags:
  - tagging
  - azure-policy
  - governance
  - cost-allocation
  - compliance
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
  - question: How do I enforce mandatory tags in Azure?
    answer: >-
      Use Azure Policy with a 'deny' effect that checks for required tag fields
      (Project, Environment, Team). Assign the policy at the management group
      level so it applies to all subscriptions. Resources without the required
      tags will be blocked at creation time. Use 'modify' effect for tag
      inheritance from resource groups.
  - question: Can Azure automatically inherit tags from resource groups?
    answer: >-
      Yes, using Azure Policy with the 'modify' effect. Create a policy that
      checks if a resource is missing a tag that exists on its resource group,
      then automatically adds it. This requires the policy to have a managed
      identity with the Contributor role for tag modifications.
relatedItems:
  - azure-resource-group-conventions
  - azure-rbac-governance
  - terraform-required-tags
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Mandatory Tags on All Azure Resources

## Rule
Every Azure resource MUST have the mandatory tag set applied at creation. Use Azure Policy with 'deny' effect to prevent untagged resource creation.

## Required Tags
```json
{
  "Project": "myapp",
  "Environment": "production",
  "Team": "platform",
  "ManagedBy": "terraform"
}
```

## Azure Policy (Deny Untagged)
```json
{
  "mode": "All",
  "policyRule": {
    "if": {
      "anyOf": [
        { "field": "tags['Project']", "exists": "false" },
        { "field": "tags['Environment']", "exists": "false" },
        { "field": "tags['Team']", "exists": "false" }
      ]
    },
    "then": {
      "effect": "deny"
    }
  }
}
```

## Tag Inheritance Policy
```json
{
  "mode": "All",
  "policyRule": {
    "if": {
      "allOf": [
        { "field": "tags['Environment']", "exists": "false" },
        { "value": "[resourceGroup().tags['Environment']]", "notEquals": "" }
      ]
    },
    "then": {
      "effect": "modify",
      "details": {
        "operations": [
          {
            "operation": "addOrReplace",
            "field": "tags['Environment']",
            "value": "[resourceGroup().tags['Environment']]"
          }
        ],
        "roleDefinitionIds": [
          "/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c"
        ]
      }
    }
  }
}
```

## Good Examples
```bash
# CLI with tags
az storage account create -n myappsa -g myapp-prod-rg \
  --tags Project=myapp Environment=production Team=platform ManagedBy=terraform

# Bicep with tags
resource sa 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  tags: {
    Project: appName
    Environment: environment
    Team: team
    ManagedBy: 'bicep'
  }
}
```

## Bad Examples
```bash
# BAD: No tags (will be denied by policy)
az storage account create -n myappsa -g myapp-prod-rg

# BAD: Incomplete tags
az vm create -n myvm -g myapp-rg --tags Name=myvm
```

## Enforcement
- Assign deny policy at management group level
- Tag inheritance policy for automatic propagation from resource groups
- Azure Cost Management reports filtered by tags
- Regular compliance audit via Azure Policy dashboard
