---
id: aws-s3-encryption-required
stackId: aws
type: rule
name: S3 Encryption and Public Access Block Required
description: >-
  Every S3 bucket must have server-side encryption enabled, public access
  blocked, and versioning enabled for critical data to prevent data breaches and
  meet compliance requirements.
difficulty: beginner
globs:
  - '**/*.tf'
  - '**/*.json'
  - '**/s3/**'
  - '**/storage/**'
tags:
  - s3
  - encryption
  - public-access
  - data-protection
  - compliance
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
  - question: Why must every S3 bucket have public access blocked?
    answer: >-
      Public S3 buckets are the number one cause of cloud data breaches. Even if
      the bucket policy is currently restrictive, someone could accidentally add
      a public policy later. The public access block acts as a guardrail that
      prevents any policy from making the bucket public, regardless of what
      policies are attached.
  - question: Is S3 default encryption sufficient for compliance?
    answer: >-
      S3 default encryption (SSE-S3) provides encryption at rest which satisfies
      basic requirements. For HIPAA, PCI-DSS, or SOC2 compliance, use SSE-KMS
      with a customer-managed key — this adds audit trails via CloudTrail, key
      rotation control, and fine-grained access control through key policies.
relatedItems:
  - aws-iam-least-privilege
  - aws-s3-security
  - terraform-required-tags
version: 1.0.0
lastUpdated: '2026-03-11'
---

# S3 Encryption and Public Access Block Required

## Rule
Every S3 bucket MUST have: (1) server-side encryption enabled, (2) public access block on all four settings, (3) versioning enabled for any bucket storing important data.

## Required Configuration
```hcl
resource "aws_s3_bucket" "example" {
  bucket = "${var.project}-${var.environment}-data"
}

# 1. Block ALL public access
resource "aws_s3_bucket_public_access_block" "example" {
  bucket                  = aws_s3_bucket.example.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 2. Enable encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "example" {
  bucket = aws_s3_bucket.example.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

# 3. Enable versioning
resource "aws_s3_bucket_versioning" "example" {
  bucket = aws_s3_bucket.example.id
  versioning_configuration {
    status = "Enabled"
  }
}
```

## Good Configuration
```bash
# Verify bucket configuration
aws s3api get-public-access-block --bucket my-bucket
aws s3api get-bucket-encryption --bucket my-bucket
aws s3api get-bucket-versioning --bucket my-bucket
```

## Bad Configuration
```hcl
# BAD: No encryption, no public access block, no versioning
resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"
}
# This bucket is a data breach waiting to happen
```

## Enforcement
- AWS Config rules: s3-bucket-server-side-encryption-enabled, s3-bucket-public-read-prohibited
- Account-level S3 Block Public Access (Settings > Block Public Access)
- SCP to deny s3:PutBucketPolicy without encryption condition
- Terraform CI with tfsec or checkov scanning
