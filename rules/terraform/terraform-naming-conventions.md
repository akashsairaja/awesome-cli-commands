---
id: terraform-naming-conventions
stackId: terraform
type: rule
name: Terraform Naming Conventions
description: >-
  Enforce consistent naming across Terraform configurations — resource names,
  variable names, output names, file organization, and cloud resource naming
  patterns.
difficulty: beginner
globs:
  - '**/*.tf'
  - '**/*.tfvars'
  - '**/terraform/**'
  - '**/infrastructure/**'
tags:
  - naming-conventions
  - snake-case
  - file-organization
  - terraform-standards
  - hcl
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
  - question: What naming convention should I use for Terraform resources?
    answer: >-
      Use snake_case for all HCL identifiers (resource names, variables,
      outputs, locals). Use kebab-case for cloud resource names/tags (e.g.,
      'myapp-production-vpc'). Follow the pattern
      {project}-{environment}-{resource}-{qualifier} for cloud resource naming
      to ensure uniqueness and readability.
  - question: How should Terraform files be organized?
    answer: >-
      Every module should have: main.tf (primary resources), variables.tf (all
      inputs), outputs.tf (all outputs), versions.tf (version constraints), and
      README.md. For larger modules, add locals.tf and data.tf. Never put
      variables in main.tf or resources in variables.tf.
relatedItems:
  - terraform-module-architect
  - terraform-variable-validation
  - terraform-required-tags
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Terraform Naming Conventions

## Rule
All Terraform resources, variables, outputs, and files MUST follow consistent naming conventions using snake_case for HCL identifiers and kebab-case for cloud resource names.

## HCL Naming (snake_case)
```hcl
# Resources: type + descriptive name
resource "aws_instance" "web_server" {}      # Good
resource "aws_instance" "WebServer" {}       # Bad — PascalCase
resource "aws_instance" "web-server" {}      # Bad — kebab-case

# Variables: descriptive snake_case
variable "vpc_cidr_block" {}                 # Good
variable "vpcCidrBlock" {}                   # Bad — camelCase

# Outputs: descriptive snake_case
output "database_endpoint" {}                # Good
output "db-endpoint" {}                      # Bad — kebab-case

# Locals: snake_case
locals {
  common_tags = {}                           # Good
}
```

## Cloud Resource Naming
```hcl
# Pattern: {project}-{environment}-{resource}-{qualifier}
locals {
  name_prefix = "${var.project}-${var.environment}"
}

resource "aws_vpc" "main" {
  tags = { Name = "${local.name_prefix}-vpc" }
}

resource "aws_subnet" "private" {
  for_each = var.private_subnets
  tags = { Name = "${local.name_prefix}-private-${each.key}" }
}

# Results: myapp-production-vpc, myapp-production-private-us-east-1a
```

## File Organization
```
module/
├── main.tf           # Primary resources
├── variables.tf      # All input variables
├── outputs.tf        # All outputs
├── versions.tf       # Provider and Terraform version constraints
├── locals.tf         # Local values (optional)
├── data.tf           # Data sources (optional)
└── README.md         # Module documentation
```

## Good Examples
```hcl
# Resource naming
resource "aws_security_group" "web_alb" {}
resource "aws_iam_role" "lambda_execution" {}
resource "aws_s3_bucket" "application_logs" {}

# Variable naming
variable "database_instance_class" {
  type        = string
  description = "RDS instance class for the application database"
}

# Output naming
output "load_balancer_dns_name" {
  description = "DNS name of the application load balancer"
}
```

## Bad Examples
```hcl
# Bad: meaningless names
resource "aws_instance" "this" {}
resource "aws_instance" "main" {}  # OK for singleton, bad if multiple

# Bad: abbreviations without context
variable "db_ic" {}  # What is "ic"?

# Bad: inconsistent casing
variable "VPC_CIDR" {}
output "DatabaseEndpoint" {}
```

## Enforcement
- Use tflint with naming convention rules
- CI pipeline validation with `terraform fmt -check`
- Team code review checklist includes naming verification
