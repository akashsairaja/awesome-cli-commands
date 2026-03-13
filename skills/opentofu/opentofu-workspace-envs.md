---
id: opentofu-workspace-envs
stackId: opentofu
type: skill
name: >-
  Workspaces & Multi-Environment Deployments
description: >-
  Deploy to multiple environments with OpenTofu — workspaces, directory-based
  environments, variable files per environment, and designing scalable
  multi-environment infrastructure strategies.
difficulty: intermediate
tags:
  - opentofu
  - workspaces
  - multi-environment
  - deployments
  - deployment
  - monitoring
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Workspaces & Multi-Environment Deployments skill?"
    answer: >-
      Deploy to multiple environments with OpenTofu — workspaces,
      directory-based environments, variable files per environment, and
      designing scalable multi-environment infrastructure strategies. This
      skill provides a structured workflow for development tasks.
  - question: "What tools and setup does Workspaces & Multi-Environment Deployments require?"
    answer: >-
      Requires Terraform CLI installed. Works with opentofu projects. Review
      the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Workspaces & Multi-Environment Deployments

## Overview
Deploy the same infrastructure to dev, staging, and production with proper isolation. Use workspaces, directory structures, or variable files to manage environment differences.

## Why This Matters
- **Isolation** — prevent changes in dev from affecting production
- **Consistency** — same code deploys to all environments
- **Scalability** — add new environments without duplicating code
- **Safety** — environment-specific settings prevent misconfiguration

## How It Works

### Step 1: Workspaces
```bash
# Create workspaces
tofu workspace new dev
tofu workspace new staging
tofu workspace new prod

# List and switch
tofu workspace list
tofu workspace select staging

# Use workspace name in config
# locals {
#   environment = terraform.workspace
#   instance_type = {
#     dev     = "t3.micro"
#     staging = "t3.small"
#     prod    = "t3.large"
#   }[terraform.workspace]
# }

# Plan per workspace
tofu workspace select staging
tofu plan -var-file="envs/staging.tfvars"
```

### Step 2: Variable Files per Environment
```bash
# Directory structure
# envs/
#   dev.tfvars
#   staging.tfvars
#   prod.tfvars

# dev.tfvars
# environment    = "dev"
# instance_count = 1
# instance_type  = "t3.micro"
# enable_monitoring = false

# prod.tfvars
# environment    = "prod"
# instance_count = 3
# instance_type  = "t3.large"
# enable_monitoring = true

# Deploy to specific environment
tofu plan -var-file="envs/dev.tfvars"
tofu apply -var-file="envs/prod.tfvars"
```

### Step 3: Directory-Based Environments
```bash
# Directory structure
# infrastructure/
#   modules/
#     vpc/
#     compute/
#     database/
#   environments/
#     dev/
#       main.tf          # module calls with dev settings
#       backend.tf       # dev state backend
#       terraform.tfvars
#     staging/
#       main.tf
#       backend.tf
#       terraform.tfvars
#     prod/
#       main.tf
#       backend.tf
#       terraform.tfvars

# Deploy dev
cd infrastructure/environments/dev
tofu init
tofu apply

# Deploy prod
cd infrastructure/environments/prod
tofu init
tofu apply
```

### Step 4: Environment Safety Guards
```bash
# Prevent accidental production changes
# variable "environment" {
#   validation {
#     condition     = !(var.environment == "prod" && var.destroy_protection == false)
#     error_message = "Production must have destroy protection enabled."
#   }
# }

# Require approval for production
# lifecycle {
#   prevent_destroy = var.environment == "prod" ? true : false
# }

# Different state backends per environment
# terraform {
#   backend "s3" {
#     bucket = "state-${var.environment}"
#     key    = "infra/terraform.tfstate"
#   }
# }
```

## Best Practices
- Use directory-based environments for production (strongest isolation)
- Use workspaces for similar environments (dev feature branches)
- Use var-files for environment-specific values
- Implement destroy protection for production resources
- Use separate state backends per environment

## Common Mistakes
- Using workspaces for prod vs dev (shared state backend = risk)
- No destroy protection on production (accidental tofu destroy)
- Hardcoded environment values in shared modules
- Same state bucket for all environments (blast radius)
- Not testing in staging before applying to production
