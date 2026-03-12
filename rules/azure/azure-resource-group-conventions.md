---
id: azure-resource-group-conventions
stackId: azure
type: rule
name: Azure Resource Group Naming & Organization
description: >-
  Standardize Azure resource group naming, location selection, and resource
  organization — group by lifecycle, tag consistently, and enforce naming
  patterns across subscriptions.
difficulty: beginner
globs:
  - '**/*.bicep'
  - '**/*.tf'
  - '**/*.json'
  - '**/azure/**'
tags:
  - resource-groups
  - naming-conventions
  - tagging
  - organization
  - governance
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
  - question: How should Azure resource groups be organized?
    answer: >-
      Group resources by lifecycle — resources that are deployed, updated, and
      deleted together should be in the same resource group. Separate
      networking, compute, data, and shared services into different groups.
      Follow the naming pattern: {project}-{environment}-{component}-rg.
  - question: Why are tags important on Azure resource groups?
    answer: >-
      Tags enable cost allocation (which team/project is spending), environment
      identification, ownership tracking, and compliance auditing. Azure Policy
      can inherit tags from resource groups to child resources, ensuring
      consistent tagging. Configure tag-based cost reports in Azure Cost
      Management.
relatedItems:
  - azure-rbac-governance
  - azure-mandatory-tags
  - terraform-required-tags
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Azure Resource Group Naming & Organization

## Rule
All Azure resource groups MUST follow the naming convention `{project}-{environment}-{component}-rg` and include mandatory tags for governance and cost allocation.

## Naming Format
```
{project}-{environment}-{component}-rg

Examples:
myapp-production-api-rg
myapp-staging-data-rg
platform-shared-networking-rg
```

## Resource Organization
```
# Group by lifecycle — resources that deploy and delete together
myapp-production-api-rg       # API servers, app service, scaling
myapp-production-data-rg      # Database, cache, storage
myapp-production-network-rg   # VNet, NSGs, load balancers
platform-shared-identity-rg   # Key Vault, managed identities
platform-shared-monitor-rg    # Log Analytics, Application Insights
```

## Good Examples
```bash
# Create with proper naming and tags
az group create \
  --name myapp-production-api-rg \
  --location eastus \
  --tags Project=myapp Environment=production Component=api Team=platform CostCenter=eng-123 ManagedBy=terraform

# Resource naming within group
# {project}-{environment}-{resource}-{qualifier}
myapp-production-app-plan     # App Service Plan
myapp-production-app-web      # App Service
myapp-production-sql-server   # SQL Server
myapp-production-kv           # Key Vault
```

## Bad Examples
```bash
# BAD: No naming convention
az group create --name "rg1" --location eastus

# BAD: No tags
az group create --name "production-stuff" --location eastus

# BAD: Mixed concerns in one group
# Don't put database AND API AND networking in one RG
```

## Required Tags
| Tag | Example | Purpose |
|-----|---------|---------|
| Project | myapp | Cost allocation |
| Environment | production | Environment ID |
| Component | api | Functional group |
| Team | platform | Ownership |
| CostCenter | eng-123 | Finance tracking |
| ManagedBy | terraform | IaC tracking |

## Enforcement
- Azure Policy: require tags on resource group creation
- Azure Policy: inherit tags from resource group to child resources
- Naming convention policy with deny effect for non-compliant names
