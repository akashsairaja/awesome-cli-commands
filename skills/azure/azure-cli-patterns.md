---
id: azure-cli-patterns
stackId: azure
type: skill
name: Azure CLI Automation Patterns
description: >-
  Master Azure CLI patterns for scripting and automation — resource
  management, output formatting, JMESPath queries, batch operations, and CI/CD
  integration with service principals.
difficulty: advanced
tags:
  - azure
  - cli
  - automation
  - patterns
  - deployment
  - ci-cd
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Azure CLI Automation Patterns skill?"
    answer: >-
      Master Azure CLI patterns for scripting and automation — resource
      management, output formatting, JMESPath queries, batch operations, and
      CI/CD integration with service principals. It includes practical
      examples for Azure cloud development.
  - question: "What tools and setup does Azure CLI Automation Patterns require?"
    answer: >-
      Requires Azure CLI, pip/poetry installed. Works with Azure projects.
      Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Azure CLI Automation Patterns

## Overview
The Azure CLI (az) is the primary tool for Azure automation. Mastering output formats, JMESPath queries, and scripting patterns enables efficient resource management and CI/CD integration.

## Why This Matters
- **Automation** — script repetitive tasks across subscriptions
- **CI/CD** — Azure CLI is the standard for pipeline-based deployments
- **Querying** — JMESPath extracts exactly the data you need
- **Idempotency** — many az commands are naturally idempotent

## Authentication Patterns
```bash
# Interactive login (development)
az login

# Service principal (CI/CD)
az login --service-principal \
  -u $AZURE_CLIENT_ID \
  -p $AZURE_CLIENT_SECRET \
  --tenant $AZURE_TENANT_ID

# Managed identity (Azure VMs, AKS, App Service)
az login --identity

# Set default subscription
az account set --subscription "Production"
```

## Output Formatting
```bash
# Table format (human-readable)
az vm list --output table

# TSV format (scriptable, pipe-friendly)
az vm list --query "[].{name:name, rg:resourceGroup}" --output tsv

# JSON with JMESPath query
az vm list --query "[?powerState=='VM running'].name" --output json

# Single value extraction
az storage account show -n myaccount -g myrg --query "primaryEndpoints.blob" -o tsv
```

## JMESPath Query Patterns
```bash
# Filter by property
az vm list --query "[?location=='eastus']"

# Select specific fields
az vm list --query "[].{Name:name, Size:hardwareProfile.vmSize, State:powerState}"

# Filter and select
az resource list --query "[?type=='Microsoft.Compute/virtualMachines' && tags.Environment=='production'].name"

# Count resources
az resource list --query "length([?type=='Microsoft.Storage/storageAccounts'])"

# First match
az vm list --query "[?name=='myvm'] | [0]"
```

## Batch Operations
```bash
# Stop all VMs in a resource group
az vm list -g dev-rg --query "[].id" -o tsv | while read id; do
  az vm deallocate --ids "$id" --no-wait
done

# Tag all resources in a group
az resource list -g production-rg --query "[].id" -o tsv | while read id; do
  az resource tag --tags Environment=production --ids "$id"
done

# Delete all resources with a specific tag
az resource list --tag Status=deprecated --query "[].id" -o tsv | xargs -I {} az resource delete --ids {}
```

## Resource Group Patterns
```bash
# Create with tags
az group create -n myapp-prod-rg -l eastus \
  --tags Project=myapp Environment=production Team=platform

# List resources in group
az resource list -g myapp-prod-rg --output table

# Export ARM template
az group export -n myapp-prod-rg > template.json

# Delete entire group (dangerous!)
az group delete -n myapp-dev-rg --yes --no-wait
```

## Best Practices
- Always use `--output tsv` when piping to other commands
- Use JMESPath queries to filter server-side (faster than grep)
- Use `--no-wait` for long-running operations in scripts
- Set default resource group: `az configure --defaults group=myapp-rg`
- Use `--only-show-errors` in CI to reduce noise
- Store service principal credentials in CI secrets, never in scripts

## Common Mistakes
- Using `--output json` and parsing with grep (use JMESPath instead)
- Forgetting `--yes` in automated scripts (hangs waiting for confirmation)
- Not setting the subscription context (operates on wrong subscription)
- Hardcoding resource IDs instead of querying dynamically
