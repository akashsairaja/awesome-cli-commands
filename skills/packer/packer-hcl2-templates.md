---
id: packer-hcl2-templates
stackId: packer
type: skill
name: Packer HCL2 Template Design
description: >-
  Write Packer templates in HCL2 — source blocks, build pipelines, variables
  with validation, data sources, and structuring multi-cloud image definitions
  for maintainable builds.
difficulty: beginner
tags:
  - packer
  - hcl2
  - template
  - design
  - docker
  - type-safety
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Packer HCL2 Template Design skill?"
    answer: >-
      Write Packer templates in HCL2 — source blocks, build pipelines,
      variables with validation, data sources, and structuring multi-cloud
      image definitions for maintainable builds. This skill provides a
      structured workflow for development tasks.
  - question: "What tools and setup does Packer HCL2 Template Design require?"
    answer: >-
      Requires Docker installed. Works with packer projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Packer HCL2 Template Design

## Overview
HCL2 is Packer's modern template language, replacing JSON. It brings variables with types and validation, data sources, functions, and better code organization for machine image definitions.

## Why This Matters
- **Readability** — HCL2 is more readable than JSON templates
- **Validation** — type-checked variables catch errors before builds
- **Reusability** — variables, locals, and functions reduce duplication
- **Multi-cloud** — define multiple builders in one template

## How It Works

### Step 1: Basic Template Structure
```bash
# required_plugins.pkr.hcl
# packer {
#   required_plugins {
#     amazon = {
#       version = ">= 1.3.0"
#       source  = "github.com/hashicorp/amazon"
#     }
#   }
# }

# variables.pkr.hcl
# variable "region" {
#   type    = string
#   default = "us-east-1"
# }
# variable "instance_type" {
#   type    = string
#   default = "t3.micro"
#   validation {
#     condition     = can(regex("^t[23]\.", var.instance_type))
#     error_message = "Only t2 and t3 instances allowed for builds."
#   }
# }
# variable "version" {
#   type = string
# }

# Initialize and validate
packer init .
packer validate -var="version=1.0.0" .
```

### Step 2: Source Blocks (Builders)
```bash
# source block defines the builder
# source "amazon-ebs" "ubuntu" {
#   ami_name      = "myapp-${var.version}-{{timestamp}}"
#   instance_type = var.instance_type
#   region        = var.region
#   source_ami_filter {
#     filters = {
#       name                = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"
#       root-device-type    = "ebs"
#       virtualization-type = "hvm"
#     }
#     most_recent = true
#     owners      = ["099720109477"]  # Canonical
#   }
#   ssh_username = "ubuntu"
#   tags = {
#     Name    = "myapp-${var.version}"
#     Version = var.version
#     Builder = "packer"
#   }
# }

# Docker source
# source "docker" "ubuntu" {
#   image  = "ubuntu:22.04"
#   commit = true
# }
```

### Step 3: Build Block
```bash
# build {
#   sources = [
#     "source.amazon-ebs.ubuntu",
#     "source.docker.ubuntu"
#   ]
#
#   provisioner "shell" {
#     inline = [
#       "sudo apt-get update -y",
#       "sudo apt-get install -y nginx"
#     ]
#   }
#
#   provisioner "file" {
#     source      = "configs/"
#     destination = "/tmp/configs"
#   }
#
#   provisioner "shell" {
#     script = "scripts/setup.sh"
#     environment_vars = [
#       "APP_VERSION=${var.version}",
#       "ENVIRONMENT=production"
#     ]
#   }
#
#   post-processor "manifest" {
#     output = "manifest.json"
#     strip_path = true
#   }
# }

# Build specific source only
packer build -only="amazon-ebs.ubuntu" -var="version=1.0.0" .
```

### Step 4: Locals & Data Sources
```bash
# locals {
#   timestamp = formatdate("YYYYMMDDhhmmss", timestamp())
#   image_name = "myapp-${var.version}-${local.timestamp}"
#   common_tags = {
#     Version    = var.version
#     BuildTime  = local.timestamp
#     ManagedBy  = "packer"
#   }
# }
#
# data "amazon-ami" "base" {
#   filters = {
#     name = "mybase-*"
#   }
#   most_recent = true
#   owners      = ["self"]
# }
```

## Best Practices
- Use separate files: variables.pkr.hcl, source.pkr.hcl, build.pkr.hcl
- Always pin plugin versions in required_plugins
- Use variable validation for all user inputs
- Use locals for computed values (timestamps, name prefixes)
- Tag images with version, build time, and git SHA

## Common Mistakes
- Single monolithic .pkr.hcl file (hard to maintain)
- No variable validation (invalid builds discovered late)
- Not using required_plugins (inconsistent plugin versions)
- Hardcoded AMI IDs instead of source_ami_filter (stale base images)
- Missing timestamp in image names (name collisions)
