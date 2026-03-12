---
id: terraform-state-backend-config
stackId: terraform
type: rule
name: Remote State Backend Configuration
description: >-
  Every Terraform project must use a remote backend with state locking and
  encryption — never local state files, never state in version control, always
  encrypted at rest.
difficulty: intermediate
globs:
  - '**/*.tf'
  - '**/backend.tf'
  - '**/terraform/**'
  - '**/infrastructure/**'
tags:
  - state-backend
  - remote-state
  - encryption
  - state-locking
  - security
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
  - question: Why must Terraform state be stored remotely?
    answer: >-
      Remote state provides state locking (prevents concurrent modifications),
      encryption at rest (state contains secrets), team collaboration (shared
      access), versioning (rollback capability), and disaster recovery. Local
      state files have none of these protections and are the #1 cause of
      Terraform incidents.
  - question: What is Terraform state locking and why is it needed?
    answer: >-
      State locking prevents two people or CI jobs from running 'terraform
      apply' simultaneously on the same state. Without locking, concurrent
      operations can corrupt state, create duplicate resources, or lose track of
      infrastructure. DynamoDB (AWS), Cloud Storage (GCP), and Blob leases
      (Azure) provide locking.
relatedItems:
  - terraform-state-guardian
  - terraform-naming-conventions
  - terraform-required-tags
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Remote State Backend Configuration

## Rule
All Terraform projects MUST use a remote backend with state locking and encryption at rest. Local state files and state committed to Git are NEVER acceptable.

## Format
```hcl
# AWS S3 Backend (recommended for AWS projects)
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "production/networking/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

## Backend Configuration by Provider

### AWS (S3 + DynamoDB)
```hcl
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "${var.environment}/${var.component}/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
    kms_key_id     = "alias/terraform-state"
  }
}
```

### GCP (Google Cloud Storage)
```hcl
terraform {
  backend "gcs" {
    bucket = "mycompany-terraform-state"
    prefix = "production/networking"
  }
}
```

### Azure (Blob Storage)
```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate"
    container_name       = "state"
    key                  = "production.terraform.tfstate"
  }
}
```

## State File Key Structure
```
{environment}/{component}/terraform.tfstate

Examples:
production/networking/terraform.tfstate
production/compute/terraform.tfstate
staging/networking/terraform.tfstate
```

## Good Configuration
```hcl
# Backend bucket with all security controls
resource "aws_s3_bucket" "terraform_state" {
  bucket = "mycompany-terraform-state"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.terraform.arn
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

## Bad Configuration
```hcl
# BAD: Local state (no locking, no encryption, no backup)
# (no backend block = local state)

# BAD: S3 without locking
terraform {
  backend "s3" {
    bucket = "my-state"
    key    = "state.tfstate"
    # Missing: dynamodb_table, encrypt
  }
}
```

## Enforcement
- CI pipeline must verify backend configuration exists
- S3 bucket policy to enforce encryption
- Block unencrypted state file uploads
- Regular audits of state file access logs
