---
id: terraform-workspace-strategy
stackId: terraform
type: skill
name: >-
  Terraform Workspace & Environment Strategy
description: >-
  Design multi-environment Terraform deployments using workspaces,
  directory-based separation, or Terragrunt — manage dev, staging, and
  production with consistent infrastructure and minimal duplication.
difficulty: advanced
tags:
  - terraform
  - workspace
  - environment
  - strategy
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
  - question: "When should I use the Terraform Workspace & Environment Strategy skill?"
    answer: >-
      Design multi-environment Terraform deployments using workspaces,
      directory-based separation, or Terragrunt — manage dev, staging, and
      production with consistent infrastructure and minimal duplication. It
      includes practical examples for infrastructure as code development.
  - question: "What tools and setup does Terraform Workspace & Environment Strategy require?"
    answer: >-
      Requires Terraform CLI installed. Works with Terraform projects. Review
      the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Terraform Workspace & Environment Strategy

## Overview
Managing multiple environments (dev, staging, production) in Terraform requires a strategy that balances code reuse with isolation. The three main approaches are workspaces, directory-based separation, and Terragrunt wrappers.

## Why This Matters
- **Consistency** — same infrastructure code across all environments
- **Isolation** — mistakes in dev do not affect production
- **Auditability** — clear separation of state per environment
- **Cost control** — smaller instances in dev, larger in prod

## Approach 1: Directory-Based (Recommended)
```
infrastructure/
├── modules/
│   ├── vpc/
│   ├── ecs/
│   └── rds/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   │   ├── main.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── production/
│       ├── main.tf
│       ├── terraform.tfvars
│       └── backend.tf
```

```hcl
# environments/production/main.tf
module "vpc" {
  source = "../../modules/vpc"

  environment    = "production"
  cidr_block     = "10.0.0.0/16"
  az_count       = 3
  enable_nat     = true
  enable_vpn     = true
}

module "ecs" {
  source = "../../modules/ecs"

  environment    = "production"
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  instance_type  = "m6i.xlarge"
  min_capacity   = 3
  max_capacity   = 10
}
```

## Approach 2: Workspaces with .tfvars
```hcl
# main.tf — shared configuration
module "vpc" {
  source = "./modules/vpc"

  environment = terraform.workspace
  cidr_block  = var.cidr_block
  az_count    = var.az_count
}
```

```bash
# Switch environments
terraform workspace select production
terraform plan -var-file="envs/production.tfvars"

terraform workspace select dev
terraform plan -var-file="envs/dev.tfvars"
```

## Approach 3: Terragrunt (DRY at Scale)
```
infrastructure/
├── terragrunt.hcl          # Root config
├── modules/                # Terraform modules
├── dev/
│   ├── terragrunt.hcl      # Inherits root, sets dev vars
│   ├── vpc/terragrunt.hcl
│   └── ecs/terragrunt.hcl
├── staging/
│   └── ...
└── production/
    └── ...
```

## Comparison
| Feature | Directories | Workspaces | Terragrunt |
|---------|------------|------------|------------|
| State isolation | Separate backends | Same backend, different keys | Separate backends |
| Code duplication | Some (main.tf per env) | Minimal | Minimal |
| Complexity | Low | Low | Medium |
| CI/CD clarity | Clear (path = env) | Needs workspace switching | Clear |
| Best for | Small-medium teams | Simple projects | Large organizations |

## Best Practices
- Use directory-based for most teams (clearest mental model)
- Keep modules DRY — environment-specific config only in tfvars
- Separate state per environment (different S3 keys or backends)
- Use consistent naming: `{project}-{env}-{resource}`
- Production should require approval gates in CI/CD

## Common Mistakes
- Using workspaces as a substitute for proper environment isolation
- Sharing the same state backend without separate keys
- Hardcoding environment-specific values instead of using tfvars
- Not testing in dev/staging before applying to production
