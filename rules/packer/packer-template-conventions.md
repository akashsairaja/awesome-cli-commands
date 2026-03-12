---
id: packer-template-conventions
stackId: packer
type: rule
name: Packer Template Naming and Structure
description: >-
  Organize Packer templates with consistent naming — HCL format over JSON,
  standard file layout, meaningful source and build block names, and proper
  variable organization.
difficulty: beginner
globs:
  - '**/*.pkr.hcl'
  - '**/*.pkrvars.hcl'
  - '**/packer/**'
tags:
  - packer-templates
  - hcl
  - file-organization
  - naming-conventions
  - ami
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
  - question: Why should Packer templates use HCL instead of JSON?
    answer: >-
      HCL format (.pkr.hcl) supports comments, multi-line strings, expressions,
      variable validation, and is consistent with Terraform/OpenTofu. JSON
      templates are legacy — they lack comments, are harder to read, and do not
      support HCL2 features like locals, functions, and dynamic blocks.
  - question: Why include a timestamp in AMI names?
    answer: >-
      AMI names must be unique within an AWS account. Including a timestamp
      (e.g., myapp-base-20240315-143022) prevents name conflicts on rebuilds,
      makes it easy to identify the latest image, and provides audit trail of
      when images were built. Use formatdate() in locals for consistent
      formatting.
relatedItems:
  - packer-hardening-practices
  - packer-provisioner-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Packer Template Naming and Structure

## Rule
All Packer templates MUST use HCL format (.pkr.hcl). Use consistent file naming, organize by concern, and follow snake_case for all identifiers.

## File Organization
```
packer/
├── base-image.pkr.hcl       # Main template
├── variables.pkr.hcl        # Variable definitions
├── locals.pkr.hcl           # Local values
├── plugins.pkr.hcl          # Required plugins
├── scripts/
│   ├── setup.sh              # Provisioning scripts
│   ├── harden.sh             # Security hardening
│   └── cleanup.sh            # Image cleanup
├── files/
│   └── config/               # Config files to upload
└── auto.pkrvars.hcl          # Variable values
```

## Good Examples
```hcl
# plugins.pkr.hcl
packer {
  required_version = ">= 1.10.0"

  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = "~> 1.3"
    }
  }
}

# variables.pkr.hcl
variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region to build the AMI in"
}

variable "base_ami_filter" {
  type        = string
  default     = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-*"
  description = "AMI name filter for the base image"
}

variable "instance_type" {
  type        = string
  default     = "t3.micro"
  description = "EC2 instance type for the build"
}

# base-image.pkr.hcl
locals {
  timestamp = formatdate("YYYYMMDD-HHmmss", timestamp())
  ami_name  = "myapp-base-${local.timestamp}"
}

source "amazon-ebs" "base" {
  region        = var.aws_region
  instance_type = var.instance_type
  ami_name      = local.ami_name

  source_ami_filter {
    filters = {
      name                = var.base_ami_filter
      virtualization-type = "hvm"
    }
    owners      = ["099720109477"]
    most_recent = true
  }

  ssh_username = "ubuntu"

  tags = {
    Name        = local.ami_name
    Environment = var.environment
    ManagedBy   = "packer"
    BuildTime   = local.timestamp
  }
}

build {
  sources = ["source.amazon-ebs.base"]

  provisioner "shell" {
    scripts = [
      "scripts/setup.sh",
      "scripts/harden.sh",
      "scripts/cleanup.sh",
    ]
  }
}
```

## Bad Examples
```hcl
# BAD: JSON format (legacy)
{
  "builders": [{ "type": "amazon-ebs" }]
}

# BAD: Everything in one file with no organization
# 500-line single file with variables, sources, builds mixed

# BAD: No timestamp in AMI name
source "amazon-ebs" "base" {
  ami_name = "my-ami"  # Name conflicts on rebuilds
}
```

## Enforcement
- `packer fmt -check` in CI
- `packer validate` before every build
- Naming convention review for AMI names and tags
