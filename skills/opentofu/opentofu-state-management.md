---
id: opentofu-state-management
stackId: opentofu
type: skill
name: OpenTofu State Management
description: >-
  Manage OpenTofu state effectively — remote backends, state locking, import
  existing resources, move and remove state entries, and disaster recovery for
  infrastructure state files.
difficulty: intermediate
tags:
  - opentofu
  - state
  - management
  - security
  - best-practices
  - refactoring
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the OpenTofu State Management skill?"
    answer: >-
      Manage OpenTofu state effectively — remote backends, state locking,
      import existing resources, move and remove state entries, and disaster
      recovery for infrastructure state files. This skill provides a
      structured workflow for development tasks.
  - question: "What tools and setup does OpenTofu State Management require?"
    answer: >-
      Requires Terraform CLI installed. Works with opentofu projects. Review
      the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# OpenTofu State Management

## Overview
State is OpenTofu's source of truth — it maps real infrastructure to your configuration. Master state operations to import existing resources, refactor safely, and recover from state issues.

## Why This Matters
- **Infrastructure tracking** — state records what OpenTofu manages
- **Team collaboration** — remote state with locking prevents conflicts
- **Refactoring** — move resources between modules without recreation
- **Recovery** — restore from state backup after incidents

## How It Works

### Step 1: Remote Backend Configuration
```bash
# S3 backend with locking (add to main.tf)
# terraform {
#   backend "s3" {
#     bucket         = "myorg-tofu-state"
#     key            = "prod/network/terraform.tfstate"
#     region         = "us-east-1"
#     dynamodb_table = "tofu-locks"
#     encrypt        = true
#   }
# }

# Initialize with backend
tofu init

# Migrate from local to remote
tofu init -migrate-state

# Reconfigure backend
tofu init -reconfigure
```

### Step 2: State Inspection
```bash
# List all resources in state
tofu state list

# Show details of a resource
tofu state show aws_vpc.main
tofu state show 'module.networking.aws_subnet.private["us-east-1a"]'

# Pull remote state locally (for inspection)
tofu state pull > state.json
cat state.json | jq '.resources[] | {type, name, instances: (.instances | length)}'
```

### Step 3: Import Existing Resources
```bash
# Import a resource into state
tofu import aws_instance.web i-1234567890abcdef0
tofu import aws_vpc.main vpc-abc123
tofu import 'aws_security_group_rule.allow_http["ingress"]' sgr-123

# Import into module
tofu import module.vpc.aws_vpc.main vpc-abc123

# Verify import matches configuration
tofu plan    # should show no changes for imported resource
```

### Step 4: Move & Remove
```bash
# Rename a resource (state only, no infra change)
tofu state mv aws_instance.old aws_instance.new

# Move into a module
tofu state mv aws_vpc.main module.networking.aws_vpc.main

# Remove from state (resource continues to exist in cloud)
tofu state rm aws_instance.temp

# Using moved blocks (declarative, in HCL)
# moved {
#   from = aws_instance.old
#   to   = module.compute.aws_instance.main
# }
```

### Step 5: Backup & Recovery
```bash
# Backup current state
tofu state pull > backup-$(date +%Y%m%d).json

# Push state (emergency restore)
tofu state push backup-20240101.json

# Force unlock (when lock is stuck)
tofu force-unlock LOCK_ID
```

## Best Practices
- Always use remote backend with locking for team projects
- Use moved blocks over state mv (declarative, version-controlled)
- Backup state before major refactoring operations
- Run tofu plan after imports to verify alignment
- Never edit state JSON manually (use state commands)

## Common Mistakes
- Local state for team projects (conflicts, no locking)
- Manual state JSON editing (corruption risk)
- Forgetting to plan after import (config may not match)
- Using state rm when you mean to destroy (resource orphaned)
- Not backing up state before state mv operations
