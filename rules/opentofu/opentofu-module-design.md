---
id: opentofu-module-design
stackId: opentofu
type: rule
name: Module Design and Composition
description: >-
  Design reusable OpenTofu modules with clear interfaces — explicit input
  variables with validation, meaningful outputs, proper versioning, and
  composition over monolithic configurations.
difficulty: intermediate
globs:
  - '**/*.tf'
  - '**/*.tofu'
  - '**/modules/**'
tags:
  - modules
  - composition
  - reusability
  - variable-validation
  - infrastructure-design
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
  - question: How should OpenTofu modules be designed for reusability?
    answer: >-
      Focus each module on a single infrastructure concern (VPC, database,
      compute). Expose all configurable values as typed, validated variables
      with descriptions. Output everything consumers might need. Follow the
      standard directory structure. Version modules with git tags when shared
      across teams or repositories.
  - question: When should I create a module vs inline resources?
    answer: >-
      Create a module when: (1) the same resource pattern is used in multiple
      environments, (2) a group of resources logically belongs together (VPC +
      subnets + route tables), or (3) you want to enforce conventions via the
      module interface. Do not create modules for single resources or one-off
      configurations.
relatedItems:
  - opentofu-naming-conventions
  - opentofu-state-encryption
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Module Design and Composition

## Rule
OpenTofu modules MUST have explicit typed variables with descriptions and validation, meaningful outputs, and follow the standard directory structure. Modules should be focused on a single concern.

## Module Structure
```
modules/
├── vpc/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── versions.tf
│   └── README.md
├── rds/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── versions.tf
└── ecs-service/
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    └── versions.tf
```

## Good Examples
```hcl
# modules/vpc/variables.tf — typed, validated, documented
variable "cidr_block" {
  type        = string
  description = "CIDR block for the VPC"
  validation {
    condition     = can(cidrhost(var.cidr_block, 0))
    error_message = "Must be a valid CIDR block."
  }
}

variable "availability_zones" {
  type        = list(string)
  description = "List of AZs for subnet placement"
  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "At least 2 availability zones required."
  }
}

# modules/vpc/outputs.tf — expose what consumers need
output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = aws_subnet.private[*].id
}

# Root module — compose focused modules
module "vpc" {
  source             = "./modules/vpc"
  cidr_block         = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b"]
}

module "database" {
  source     = "./modules/rds"
  subnet_ids = module.vpc.private_subnet_ids
  vpc_id     = module.vpc.vpc_id
}
```

## Bad Examples
```hcl
# BAD: Monolithic module that does everything
module "infrastructure" {
  source = "./modules/everything"
  # Creates VPC, RDS, ECS, ALB, CloudFront, Route53...
  # 50+ variables, impossible to reuse
}

# BAD: No variable descriptions or validation
variable "x" { type = string }
variable "y" { default = "" }

# BAD: No outputs — consumers can't reference anything
```

## Enforcement
- tflint validates variable descriptions and types
- terraform-docs generates documentation from module structure
- CI runs `tofu validate` on all modules
- Semantic versioning for shared modules
