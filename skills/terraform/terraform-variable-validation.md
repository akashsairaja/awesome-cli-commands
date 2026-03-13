---
id: terraform-variable-validation
stackId: terraform
type: skill
name: >-
  Terraform Variable Validation & Type Constraints
description: >-
  Implement robust input validation in Terraform with custom validation rules,
  complex type constraints, nullable variables, and default value patterns for
  fail-fast infrastructure code.
difficulty: beginner
tags:
  - terraform
  - variable
  - validation
  - type
  - constraints
  - deployment
  - monitoring
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Terraform Variable Validation & Type Constraints skill?"
    answer: >-
      Implement robust input validation in Terraform with custom validation
      rules, complex type constraints, nullable variables, and default value
      patterns for fail-fast infrastructure code. It includes practical
      examples for infrastructure as code development.
  - question: "What tools and setup does Terraform Variable Validation & Type Constraints require?"
    answer: >-
      Requires Terraform CLI, Azure CLI installed. Works with Terraform
      projects. Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Terraform Variable Validation & Type Constraints

## Overview
Terraform variable validation catches misconfigurations before `plan` or `apply` runs. Properly typed and validated variables prevent runtime failures, enforce naming conventions, and provide clear error messages.

## Why This Matters
- **Fail fast** — catch errors at plan time, not after partial apply
- **Self-documenting** — types and validations describe the expected interface
- **Safe defaults** — prevent dangerous configurations
- **Team guardrails** — enforce organizational conventions

## Type Constraints
```hcl
# Basic types
variable "name" {
  type = string
}

variable "instance_count" {
  type = number
}

variable "enable_monitoring" {
  type    = bool
  default = true
}

# Complex types
variable "tags" {
  type = map(string)
  default = {}
}

variable "subnet_cidrs" {
  type = list(string)
}

variable "database_config" {
  type = object({
    engine         = string
    engine_version = string
    instance_class = string
    storage_gb     = number
    multi_az       = bool
    backup_days    = optional(number, 7)
  })
}
```

## Custom Validation Rules
```hcl
variable "environment" {
  type        = string
  description = "Deployment environment"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "cidr_block" {
  type        = string
  description = "VPC CIDR block"

  validation {
    condition     = can(cidrhost(var.cidr_block, 0))
    error_message = "Must be a valid CIDR block (e.g., 10.0.0.0/16)."
  }
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type"

  validation {
    condition     = can(regex("^(t3|m6i|c6i|r6i)\\.", var.instance_type))
    error_message = "Only current-gen instance families allowed: t3, m6i, c6i, r6i."
  }
}

variable "name_prefix" {
  type        = string
  description = "Resource name prefix"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,20}$", var.name_prefix))
    error_message = "Name prefix must be 3-21 chars, lowercase alphanumeric and hyphens, start with a letter."
  }
}
```

## Multiple Validations
```hcl
variable "port" {
  type        = number
  description = "Application port"

  validation {
    condition     = var.port >= 1024 && var.port <= 65535
    error_message = "Port must be between 1024 and 65535 (non-privileged)."
  }

  validation {
    condition     = var.port != 8080
    error_message = "Port 8080 is reserved for health checks."
  }
}
```

## Optional Variables with Defaults
```hcl
variable "scaling_config" {
  type = object({
    min_capacity     = optional(number, 1)
    max_capacity     = optional(number, 10)
    target_cpu       = optional(number, 70)
    scale_in_cooldown = optional(number, 300)
  })
  default = {}
}

# Usage: can pass empty object or partial overrides
# scaling_config = {}                    → all defaults
# scaling_config = { max_capacity = 20 } → override just max
```

## Best Practices
- Every variable MUST have a description and explicit type
- Use validation blocks for business rules and constraints
- Use `optional()` with defaults for configuration objects
- Validate early — CIDR ranges, naming patterns, allowed values
- Provide clear error messages that explain what is expected
- Use `sensitive = true` for passwords and tokens

## Common Mistakes
- Variables without types (anything goes, errors at apply time)
- Missing descriptions (teammates cannot understand the interface)
- Overly permissive defaults (e.g., open security groups)
- Not validating CIDR blocks, port ranges, or naming conventions
