---
id: opentofu-variables-outputs
stackId: opentofu
type: skill
name: >-
  Variables, Outputs & Expressions
description: >-
  Master OpenTofu variables and expressions — input validation, local values,
  output contracts, for_each loops, conditional resources, and dynamic blocks
  for flexible infrastructure definitions.
difficulty: intermediate
tags:
  - opentofu
  - variables
  - outputs
  - expressions
  - security
  - deployment
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Variables, Outputs & Expressions skill?"
    answer: >-
      Master OpenTofu variables and expressions — input validation, local
      values, output contracts, for_each loops, conditional resources, and
      dynamic blocks for flexible infrastructure definitions. This skill
      provides a structured workflow for development tasks.
  - question: "What tools and setup does Variables, Outputs & Expressions require?"
    answer: >-
      Works with standard opentofu tooling (relevant CLI tools and
      frameworks). Review the setup section in the skill content for specific
      configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Variables, Outputs & Expressions

## Overview
Variables, outputs, and expressions make OpenTofu configurations flexible and reusable. Input validation prevents misconfigurations, outputs enable module composition, and expressions handle complex logic.

## Why This Matters
- **Reusability** — parameterize configs for multiple environments
- **Safety** — validate inputs before provisioning
- **Composition** — outputs connect modules together
- **Flexibility** — expressions handle dynamic infrastructure patterns

## How It Works

### Step 1: Input Variables with Validation
```bash
# variables.tf
# variable "environment" {
#   type        = string
#   description = "Deployment environment"
#   validation {
#     condition     = contains(["dev", "staging", "prod"], var.environment)
#     error_message = "Environment must be dev, staging, or prod."
#   }
# }
#
# variable "instance_count" {
#   type    = number
#   default = 1
#   validation {
#     condition     = var.instance_count >= 1 && var.instance_count <= 20
#     error_message = "Instance count must be between 1 and 20."
#   }
# }
#
# variable "tags" {
#   type = map(string)
#   default = {}
# }

# Pass variables
tofu plan -var="environment=staging" -var="instance_count=3"
tofu plan -var-file="staging.tfvars"

# staging.tfvars
# environment    = "staging"
# instance_count = 3
# tags = {
#   team = "platform"
#   cost_center = "eng-123"
# }
```

### Step 2: Local Values
```bash
# locals.tf
# locals {
#   name_prefix = "${var.project}-${var.environment}"
#   common_tags = merge(var.tags, {
#     environment = var.environment
#     managed_by  = "opentofu"
#     project     = var.project
#   })
#   is_production = var.environment == "prod"
# }
```

### Step 3: Outputs
```bash
# outputs.tf
# output "vpc_id" {
#   description = "ID of the created VPC"
#   value       = aws_vpc.main.id
# }
#
# output "private_subnet_ids" {
#   description = "List of private subnet IDs"
#   value       = [for s in aws_subnet.private : s.id]
# }
#
# output "database_endpoint" {
#   description = "Database connection endpoint"
#   value       = aws_db_instance.main.endpoint
#   sensitive   = true
# }

# View outputs
tofu output
tofu output vpc_id
tofu output -json | jq '.vpc_id.value'
```

### Step 4: Expressions & Loops
```bash
# for_each with map
# resource "aws_subnet" "private" {
#   for_each          = var.private_subnets
#   vpc_id            = aws_vpc.main.id
#   cidr_block        = each.value.cidr
#   availability_zone = each.value.az
#   tags = merge(local.common_tags, {
#     Name = "${local.name_prefix}-private-${each.key}"
#   })
# }

# Conditional resource
# resource "aws_cloudwatch_alarm" "cpu" {
#   count = local.is_production ? 1 : 0
#   ...
# }

# Dynamic blocks
# resource "aws_security_group" "web" {
#   dynamic "ingress" {
#     for_each = var.ingress_rules
#     content {
#       from_port   = ingress.value.from_port
#       to_port     = ingress.value.to_port
#       protocol    = ingress.value.protocol
#       cidr_blocks = ingress.value.cidr_blocks
#     }
#   }
# }
```

## Best Practices
- Validate all variables that could cause expensive misconfigurations
- Use locals for computed values and common tags
- Mark sensitive outputs (database passwords, keys)
- Use for_each over count for named collections
- Use dynamic blocks sparingly (keep configs readable)

## Common Mistakes
- No validation on critical variables (wrong region = wrong deployment)
- Using count for collections (index shift causes recreation)
- Missing descriptions on variables and outputs
- Not marking sensitive outputs (secrets in plaintext logs)
- Overly complex expressions (refactor into locals or modules)
