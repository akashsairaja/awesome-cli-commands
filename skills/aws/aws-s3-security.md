---
id: aws-s3-security
stackId: aws
type: skill
name: AWS S3 Security Hardening
description: >-
  Secure AWS S3 buckets with encryption, access policies, public access
  blocks, versioning, logging, and lifecycle rules to prevent data breaches
  and comply with security frameworks.
difficulty: intermediate
tags:
  - aws
  - security
  - hardening
  - api
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the AWS S3 Security Hardening skill?"
    answer: >-
      Secure AWS S3 buckets with encryption, access policies, public access
      blocks, versioning, logging, and lifecycle rules to prevent data
      breaches and comply with security frameworks. This skill provides a
      structured workflow for serverless architecture, cost optimization,
      security hardening, and infrastructure automation.
  - question: "What tools and setup does AWS S3 Security Hardening require?"
    answer: >-
      Works with standard AWS tooling (AWS CLI, CloudFormation). Review the
      setup section in the skill content for specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# AWS S3 Security Hardening

## Overview
S3 is the most commonly misconfigured AWS service — public buckets cause data breaches regularly. Proper security configuration includes encryption, access policies, public access blocks, versioning, and access logging.

## Why This Matters
- **Data breaches** — misconfigured S3 buckets are a top cause of cloud data leaks
- **Compliance** — HIPAA, SOC2, PCI-DSS all require encryption at rest
- **Auditability** — access logging required for forensic investigation
- **Data protection** — versioning prevents accidental deletion

## Step 1: Block All Public Access
```hcl
resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

```bash
# CLI: Block public access on existing bucket
aws s3api put-public-access-block --bucket my-bucket --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

## Step 2: Enable Encryption
```hcl
resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
    bucket_key_enabled = true  # Reduces KMS API costs
  }
}
```

## Step 3: Enable Versioning
```hcl
resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "Enabled"
  }
}
```

## Step 4: Bucket Policy (Least Privilege)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnencryptedTransport",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ],
      "Condition": {
        "Bool": { "aws:SecureTransport": "false" }
      }
    },
    {
      "Sid": "DenyNonOrgAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ],
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalOrgID": "o-myorgid"
        }
      }
    }
  ]
}
```

## Step 5: Access Logging
```hcl
resource "aws_s3_bucket_logging" "main" {
  bucket = aws_s3_bucket.main.id

  target_bucket = aws_s3_bucket.access_logs.id
  target_prefix = "s3-access-logs/main/"
}
```

## Step 6: Lifecycle Rules
```hcl
resource "aws_s3_bucket_lifecycle_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    id     = "transition-to-ia"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}
```

## Security Checklist
1. Public access block enabled (all four settings)
2. Encryption enabled (KMS or SSE-S3)
3. Versioning enabled
4. Access logging enabled
5. Bucket policy denies unencrypted transport
6. Lifecycle rules for cost management
7. No bucket ACLs (use policies instead)

## Common Mistakes
- Leaving public access blocks disabled "temporarily"
- Using SSE-S3 when compliance requires KMS
- Not enabling versioning on critical data buckets
- Granting s3:* to applications instead of specific actions
