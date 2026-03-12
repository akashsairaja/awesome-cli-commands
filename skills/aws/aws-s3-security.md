---
id: aws-s3-security
stackId: aws
type: skill
name: AWS S3 Security Hardening
description: >-
  Secure AWS S3 buckets with encryption, access policies, public access blocks,
  versioning, logging, and lifecycle rules to prevent data breaches and comply
  with security frameworks.
difficulty: intermediate
tags:
  - s3-security
  - encryption
  - bucket-policy
  - public-access
  - versioning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - AWS account
  - S3 basics
  - IAM policy understanding
faq:
  - question: How do I prevent S3 data breaches?
    answer: >-
      Four critical controls: (1) Enable public access blocks on all buckets —
      block_public_acls, ignore_public_acls, block_public_policy,
      restrict_public_buckets. (2) Enable server-side encryption (KMS or
      SSE-S3). (3) Deny unencrypted transport in bucket policy. (4) Use IAM
      policies with least-privilege, never bucket ACLs.
  - question: Should I use SSE-S3 or SSE-KMS for S3 encryption?
    answer: >-
      Use SSE-KMS when you need: audit trails (CloudTrail logs every key usage),
      key rotation control, cross-account access control via key policies, or
      compliance requirements specifying customer-managed keys. SSE-S3 is
      sufficient for basic encryption at rest with less operational overhead.
relatedItems:
  - aws-iam-security-architect
  - aws-vpc-architecture
  - aws-cost-optimization
version: 1.0.0
lastUpdated: '2026-03-11'
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
