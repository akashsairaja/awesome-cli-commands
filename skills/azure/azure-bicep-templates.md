---
id: azure-bicep-templates
stackId: azure
type: skill
name: Azure Bicep Infrastructure as Code
description: >-
  Write Azure Bicep templates for repeatable infrastructure deployments —
  modules, parameters, conditions, loops, and deployment scopes for resource
  groups and subscriptions.
difficulty: intermediate
tags:
  - bicep
  - arm-templates
  - infrastructure-as-code
  - azure-deployment
  - modules
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - bicep
prerequisites:
  - Azure CLI 2.60+
  - Bicep CLI (bundled with Azure CLI)
  - VS Code with Bicep extension
faq:
  - question: What is Azure Bicep and how does it relate to ARM templates?
    answer: >-
      Bicep is a domain-specific language that compiles to ARM JSON templates.
      It provides cleaner syntax (50-80% shorter), type safety, modules for
      reusability, and IDE support with IntelliSense. Every Bicep file compiles
      to an equivalent ARM template — they are fully interchangeable. Bicep is
      the recommended approach for new Azure IaC projects.
  - question: Should I use Bicep or Terraform for Azure infrastructure?
    answer: >-
      Use Bicep for Azure-only environments — it has day-zero support for new
      Azure features, native integration with Azure CLI, and simpler state
      management. Use Terraform for multi-cloud environments or if your team
      already has Terraform expertise. Both are production-ready; the choice
      depends on your organization's needs.
relatedItems:
  - azure-cli-patterns
  - azure-infrastructure-architect
  - terraform-module-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Azure Bicep Infrastructure as Code

## Overview
Bicep is Azure's native infrastructure-as-code language, replacing ARM JSON templates with a cleaner, more readable syntax. It compiles to ARM templates and provides modules, type safety, and IDE support.

## Why This Matters
- **Readability** — Bicep is 50-80% shorter than equivalent ARM JSON
- **Type safety** — compile-time validation catches errors before deployment
- **Modules** — reusable components for consistent infrastructure
- **IDE support** — VS Code extension with IntelliSense and validation

## Basic Template
```bicep
// main.bicep
@description('Environment name')
@allowed(['dev', 'staging', 'production'])
param environment string

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Application name')
@minLength(3)
@maxLength(20)
param appName string

var namePrefix = '${appName}-${environment}'

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: replace('${namePrefix}-sa', '-', '')
  location: location
  sku: {
    name: environment == 'production' ? 'Standard_ZRS' : 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    encryption: {
      services: {
        blob: { enabled: true }
        file: { enabled: true }
      }
      keySource: 'Microsoft.Storage'
    }
  }
  tags: {
    Environment: environment
    Project: appName
    ManagedBy: 'bicep'
  }
}

output storageAccountId string = storageAccount.id
output storageAccountName string = storageAccount.name
```

## Modules
```bicep
// modules/vnet.bicep
param name string
param location string
param addressPrefix string
param subnets array

resource vnet 'Microsoft.Network/virtualNetworks@2023-09-01' = {
  name: name
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [addressPrefix]
    }
    subnets: [for subnet in subnets: {
      name: subnet.name
      properties: {
        addressPrefix: subnet.prefix
        networkSecurityGroup: subnet.nsgId != null ? { id: subnet.nsgId } : null
      }
    }]
  }
}

output vnetId string = vnet.id
output subnetIds array = [for (subnet, i) in subnets: vnet.properties.subnets[i].id]
```

```bicep
// main.bicep — using the module
module vnet 'modules/vnet.bicep' = {
  name: 'vnet-deployment'
  params: {
    name: '${namePrefix}-vnet'
    location: location
    addressPrefix: '10.0.0.0/16'
    subnets: [
      { name: 'app', prefix: '10.0.1.0/24', nsgId: appNsg.id }
      { name: 'data', prefix: '10.0.2.0/24', nsgId: dataNsg.id }
    ]
  }
}
```

## Loops and Conditions
```bicep
// Loop: Create multiple resources
param appServices array = ['api', 'web', 'worker']

resource appServicePlans 'Microsoft.Web/serverfarms@2023-01-01' = [for app in appServices: {
  name: '${namePrefix}-${app}-plan'
  location: location
  sku: {
    name: environment == 'production' ? 'P1v3' : 'B1'
  }
}]

// Condition: Optional resources
param enableRedis bool = false

resource redis 'Microsoft.Cache/redis@2023-08-01' = if (enableRedis) {
  name: '${namePrefix}-redis'
  location: location
  properties: {
    sku: {
      name: 'Basic'
      family: 'C'
      capacity: 1
    }
  }
}
```

## Deployment
```bash
# Deploy to resource group
az deployment group create \
  -g myapp-prod-rg \
  -f main.bicep \
  -p environment=production appName=myapp

# What-if (preview changes)
az deployment group what-if \
  -g myapp-prod-rg \
  -f main.bicep \
  -p environment=production appName=myapp

# Deploy to subscription scope
az deployment sub create \
  -l eastus \
  -f subscription.bicep
```

## Best Practices
- Use parameter decorators (@description, @allowed, @minLength) for validation
- Create modules for reusable components
- Use `what-if` before every production deployment
- Store parameter values in .bicepparam files per environment
- Use existing keyword to reference pre-existing resources
- Pin API versions in resource declarations

## Common Mistakes
- Not using what-if before deploying (surprises in production)
- Hardcoding values instead of using parameters
- Missing parameter validation decorators
- Not organizing into modules (single massive file)
