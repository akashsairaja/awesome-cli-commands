---
id: aws-no-root-access-keys
stackId: aws
type: rule
name: No Root Account Access Keys
description: >-
  The AWS root account must never have access keys, must have MFA enabled, and
  must only be used for account-level operations that require root. All other
  work uses IAM roles.
difficulty: beginner
globs:
  - '**/*.tf'
  - '**/iam/**'
  - '**/organizations/**'
tags:
  - root-account
  - mfa
  - access-keys
  - account-security
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
  - question: Why should the AWS root account never have access keys?
    answer: >-
      Root access keys provide unrestricted access to every service and resource
      in the account with no way to limit permissions. If compromised, an
      attacker can do anything — create resources, delete data, modify billing.
      Root keys cannot be restricted with IAM policies, SCPs, or permission
      boundaries.
  - question: What MFA should I use for the AWS root account?
    answer: >-
      Use a hardware security key (YubiKey, Titan) for the strongest protection.
      If hardware is not available, use a TOTP authenticator app (not SMS — SMS
      is vulnerable to SIM swapping). Store the MFA recovery codes in a secure
      vault accessible by authorized administrators.
relatedItems:
  - aws-iam-least-privilege
  - aws-iam-security-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# No Root Account Access Keys

## Rule
The AWS root account MUST NOT have access keys. Root MUST have MFA enabled. Root MUST only be used for operations that specifically require root account access.

## Root Account Security Checklist
1. Delete all root access keys
2. Enable MFA (hardware key preferred, TOTP minimum)
3. Use a strong, unique password stored in a team vault
4. Set up root account email to a group alias (not personal email)
5. Enable CloudTrail to monitor any root account usage
6. Set up billing alerts for root account

## Operations That Require Root
- Change account settings (name, email, password)
- Close the AWS account
- Change or cancel AWS Support plan
- Enable MFA Delete on S3 buckets
- Restore IAM permissions when only root has access
- Create X.509 signing certificates
- Transfer Route 53 domains to another account

## Everything Else Uses IAM
```bash
# Check if root has access keys
aws iam get-account-summary --query 'SummaryMap.AccountAccessKeysPresent'
# Should return: 0

# Check root MFA status
aws iam get-account-summary --query 'SummaryMap.AccountMFAEnabled'
# Should return: 1
```

## Monitoring Root Usage
```bash
# CloudWatch alarm for any root account usage
aws cloudwatch put-metric-alarm \
  --alarm-name "RootAccountUsage" \
  --metric-name "RootAccountUsageCount" \
  --namespace "CloudTrailMetrics" \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions "arn:aws:sns:us-east-1:123456789012:security-alerts"
```

## Enforcement
- AWS Config rule: `root-account-mfa-enabled`
- AWS Config rule: `iam-root-access-key-check`
- SCP to deny all actions from root (except specific account operations)
- CloudTrail + CloudWatch alarm on root usage
- Regular credential report review: `aws iam generate-credential-report`
