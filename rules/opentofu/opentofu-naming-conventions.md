---
id: opentofu-naming-conventions
stackId: opentofu
type: rule
name: OpenTofu HCL Naming Conventions
description: >-
  Enforce consistent naming across OpenTofu configurations — snake_case for HCL
  identifiers, kebab-case for cloud resources, standard file organization, and
  module naming patterns.
difficulty: beginner
globs:
  - '**/*.tf'
  - '**/*.tofu'
  - '**/*.tfvars'
tags:
  - naming-conventions
  - file-organization
  - hcl
  - snake-case
  - opentofu-standards
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
  - question: How does OpenTofu naming differ from Terraform?
    answer: >-
      OpenTofu follows the same HCL naming conventions as Terraform — snake_case
      for identifiers, kebab-case for cloud resource names. The configuration
      syntax is fully compatible. OpenTofu uses the same file extensions (.tf,
      .tfvars) and the same file organization patterns.
  - question: What file organization should OpenTofu modules follow?
    answer: >-
      Every module should have: main.tf (primary resources), variables.tf (all
      inputs with descriptions), outputs.tf (all outputs), and versions.tf
      (provider/OpenTofu version constraints). Add locals.tf and data.tf as
      needed. Never mix variables and resources in the same file.
relatedItems:
  - opentofu-module-design
  - opentofu-state-encryption
  - opentofu-variable-validation
version: 1.0.0
lastUpdated: '2026-03-12'
---

# OpenTofu HCL Naming Conventions

## Rule
All OpenTofu resources, variables, outputs, and files MUST follow consistent naming: snake_case for HCL identifiers, kebab-case for cloud resource names, and standard file layout.

## Format
```hcl
# Resources: type + descriptive name (snake_case)
resource "aws_instance" "web_server" {}

# Variables: descriptive snake_case
variable "vpc_cidr_block" {}

# Outputs: descriptive snake_case
output "database_endpoint" {}
```

## File Organization
```
module/
├── main.tf           # Primary resources
├── variables.tf      # All input variables
├── outputs.tf        # All outputs
├── versions.tf       # Provider and OpenTofu version constraints
├── locals.tf         # Local values
├── data.tf           # Data sources
└── README.md         # Module documentation
```

## Good Examples
```hcl
# versions.tf — pin OpenTofu and provider versions
terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
}

# variables.tf — with descriptions and validation
variable "environment" {
  type        = string
  description = "Deployment environment name"
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

# Cloud resource naming pattern
locals {
  name_prefix = "${var.project}-${var.environment}"
}

resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr_block
  tags       = { Name = "${local.name_prefix}-vpc" }
}
```

## Bad Examples
```hcl
# BAD: PascalCase resource names
resource "aws_instance" "WebServer" {}

# BAD: No file organization
# Everything in one giant main.tf

# BAD: No variable descriptions
variable "x" { type = string }
```

## Enforcement
- `tofu fmt -check` in CI to verify formatting
- tflint for naming convention rules
- Code review checklist for naming and organization
