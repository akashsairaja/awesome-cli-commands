---
id: checkov-skip-check-rules
stackId: checkov
type: rule
name: Check Skip and Suppression Standards
description: >-
  Define standards for skipping Checkov checks — inline suppressions must
  include justification comments, skip lists must be reviewed, and no blanket
  suppressions are allowed.
difficulty: intermediate
globs:
  - '**/*.tf'
  - '**/.checkov*'
  - '**/.github/workflows/**'
tags:
  - check-suppression
  - inline-skip
  - policy-exceptions
  - documentation
  - checkov
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
  - question: How do I skip a Checkov check properly?
    answer: >-
      Use inline suppression with a justification: '#checkov:skip=CKV_ID: Reason
      for skipping'. The reason is mandatory — undocumented suppressions are
      prohibited. For CI-level skips, use '--skip-check CKV_ID' with a comment
      explaining why. Every suppression should be reviewed in PRs.
  - question: When is it acceptable to skip a Checkov check?
    answer: >-
      When the check is a confirmed false positive for your setup, when
      compensating controls exist (WAF, network segmentation), or when the check
      does not apply to your use case (e.g., public-read S3 bucket for a static
      website). Always document the reason and compensating controls.
relatedItems:
  - checkov-scan-all-iac
  - checkov-baseline-policy
  - checkov-custom-checks
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Check Skip and Suppression Standards

## Rule
Checkov check suppressions MUST include a documented justification. Blanket suppressions of entire check categories are prohibited. Every suppression is subject to code review.

## Inline Suppression (Terraform)
```hcl
# Good — documented justification
resource "aws_security_group_rule" "allow_ssh" {
  #checkov:skip=CKV_AWS_24: "SSH access restricted to VPN CIDR (10.0.0.0/8), not public internet"
  type        = "ingress"
  from_port   = 22
  to_port     = 22
  cidr_blocks = ["10.0.0.0/8"]
}

# Bad — no justification
resource "aws_s3_bucket" "data" {
  #checkov:skip=CKV_AWS_19
  bucket = "my-bucket"
}
```

## CLI Skip (CI Configuration)
```bash
# Good — documented skip list
checkov -d ./terraform/ \
  --skip-check CKV_AWS_999  # Check is known false positive for our provider version

# Bad — skipping many checks without documentation
checkov -d ./terraform/ --skip-check CKV_AWS_1,CKV_AWS_2,...,CKV_AWS_50
```

## Rules
1. Every inline suppression MUST include a reason after the colon
2. CLI `--skip-check` entries must be documented in a comment or README
3. Never skip encryption checks (CKV_AWS_18, CKV_AWS_19) without compensating controls
4. Never skip public access checks without network-level mitigation
5. Suppressions require approval from a security-aware reviewer

## Review Process
1. PRs with new Checkov suppressions require explicit reviewer acknowledgment
2. Quarterly audit of all suppressions — remove those with available fixes
3. Track suppression count as a security health metric

## Anti-Patterns
- Inline suppression without reason text
- Skipping 10+ checks in CI without documentation
- Suppressing checks to "get the build green"
- Copy-pasting suppressions from other resources without evaluation
