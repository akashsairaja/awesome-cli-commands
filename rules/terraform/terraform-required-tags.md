---
id: terraform-required-tags
stackId: terraform
type: rule
name: Mandatory Resource Tagging
description: >-
  Enforce mandatory tags on all Terraform-managed cloud resources for cost
  allocation, ownership tracking, environment identification, and compliance
  requirements.
difficulty: beginner
globs:
  - '**/*.tf'
  - '**/*.tfvars'
  - '**/terraform/**'
  - '**/infrastructure/**'
tags:
  - tagging
  - cost-allocation
  - governance
  - compliance
  - resource-management
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
  - question: Why are resource tags mandatory in Terraform?
    answer: >-
      Tags enable cost allocation (which team/project is spending), environment
      identification (is this dev or production), ownership tracking (who is
      responsible), and compliance auditing (is this resource managed by IaC).
      Without tags, cloud costs are unattributable and resources become
      orphaned.
  - question: How do Terraform default_tags work?
    answer: >-
      The default_tags block in the provider configuration automatically applies
      specified tags to every resource created by that provider. Resource-level
      tags merge with default_tags, so you only need to add resource-specific
      tags like Name and Component at the resource level.
relatedItems:
  - terraform-naming-conventions
  - terraform-module-architect
  - aws-cost-optimization
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Mandatory Resource Tagging

## Rule
All taggable cloud resources MUST include the required tag set. Use `default_tags` in the provider block and merge with resource-specific tags.

## Required Tags
| Tag | Example | Purpose |
|-----|---------|---------|
| `Project` | myapp | Cost allocation |
| `Environment` | production | Environment identification |
| `Team` | platform | Ownership |
| `ManagedBy` | terraform | IaC tracking |
| `CostCenter` | eng-123 | Financial tracking |

## Implementation
```hcl
# Provider-level default tags (applied to ALL resources)
provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      Team        = var.team
      ManagedBy   = "terraform"
      CostCenter  = var.cost_center
    }
  }
}

# Resource-specific tags merge with defaults
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type

  tags = {
    Name      = "${var.project}-${var.environment}-web"
    Component = "frontend"
  }
}
```

## Tag Variables with Validation
```hcl
variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "team" {
  type = string
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]+$", var.team))
    error_message = "Team name must be lowercase alphanumeric with hyphens."
  }
}
```

## Good Examples
```hcl
# All required tags present via default_tags + resource tags
resource "aws_s3_bucket" "logs" {
  bucket = "${var.project}-${var.environment}-logs"
  tags = {
    Name      = "${var.project}-${var.environment}-logs"
    DataClass = "internal"
  }
}
```

## Bad Examples
```hcl
# BAD: No tags at all
resource "aws_s3_bucket" "data" {
  bucket = "my-bucket"
}

# BAD: Missing required tags
resource "aws_instance" "web" {
  tags = {
    Name = "web"
    # Missing: Project, Environment, Team, ManagedBy
  }
}
```

## Enforcement
- Use AWS Organizations Tag Policies to enforce at the account level
- Use tflint-ruleset-aws to check for missing tags
- OPA policies in CI to validate tag presence
- AWS Config rules to detect untagged resources
