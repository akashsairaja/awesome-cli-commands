---
id: aws-iam-least-privilege
stackId: aws
type: rule
name: IAM Least-Privilege Policies
description: >-
  Every AWS IAM policy must follow the principle of least privilege — specific
  actions, specific resources, conditions where possible, and no wildcard
  permissions in production.
difficulty: intermediate
globs:
  - '**/*.json'
  - '**/*.tf'
  - '**/iam/**'
  - '**/policies/**'
  - '**/*policy*'
tags:
  - iam
  - least-privilege
  - security-policy
  - access-control
  - aws-security
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
  - question: Why should IAM policies never use wildcard permissions?
    answer: >-
      Wildcard permissions ('Action': '*', 'Resource': '*') grant full
      administrative access — if the role is compromised, the attacker can do
      anything in your account. Least-privilege policies limit blast radius by
      granting only the specific actions on specific resources needed for the
      workload.
  - question: How do I find the minimum IAM permissions my application needs?
    answer: >-
      Start with IAM Access Analyzer which analyzes CloudTrail logs to show
      which permissions are actually used. Alternatively, start with broader
      permissions in dev, use CloudTrail to log API calls for 30 days, then
      narrow the policy to only the observed actions and resources.
relatedItems:
  - aws-s3-encryption-required
  - aws-iam-security-architect
  - aws-no-root-access-keys
version: 1.0.0
lastUpdated: '2026-03-11'
---

# IAM Least-Privilege Policies

## Rule
All IAM policies MUST specify exact actions and resource ARNs. Wildcard permissions (`*`) are NEVER acceptable for production workloads.

## Format
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["<specific-action>"],
      "Resource": ["<specific-arn>"],
      "Condition": { "<optional-condition>" }
    }
  ]
}
```

## Good Examples
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-app-uploads/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/users"
    }
  ]
}
```

## Bad Examples
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }
  ]
}

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*"
    }
  ]
}
```

## Condition Keys for Extra Security
```json
{
  "Condition": {
    "StringEquals": {
      "aws:PrincipalOrgID": "o-myorgid",
      "aws:RequestedRegion": ["us-east-1", "us-west-2"]
    },
    "Bool": {
      "aws:SecureTransport": "true"
    }
  }
}
```

## Enforcement
- Use IAM Access Analyzer to identify unused permissions
- Run `aws iam simulate-principal-policy` to test policies
- Enable AWS Config rule `iam-policy-no-statements-with-admin-access`
- Regular quarterly access reviews with credential reports
