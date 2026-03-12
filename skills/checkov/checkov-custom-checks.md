---
id: checkov-custom-checks
stackId: checkov
type: skill
name: Writing Custom Checkov Policies
description: >-
  Create custom Checkov checks in Python and YAML for organization-specific
  security standards — attribute validation, resource relationship rules, and
  naming conventions.
difficulty: advanced
tags:
  - custom-checks
  - python
  - yaml
  - policy-as-code
  - checkov
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Checkov installed
  - Python 3.8+ (for Python checks)
  - Terraform or CloudFormation templates
faq:
  - question: How do I write a custom Checkov check?
    answer: >-
      For simple attribute checks, use YAML definition files with metadata (id,
      name, category) and conditions (attribute exists, equals value). For
      complex logic, write a Python class extending BaseResourceCheck with a
      scan_resource_conf method. Place in a directory and pass
      --external-checks-dir to Checkov.
  - question: Should I use YAML or Python for custom Checkov checks?
    answer: >-
      Use YAML for simple attribute validation (field exists, equals value,
      matches pattern). Use Python when you need complex logic — regex matching,
      cross-resource validation, conditional checks based on multiple
      attributes. YAML is faster to write; Python is more flexible.
  - question: How do I test custom Checkov checks?
    answer: >-
      Create test Terraform files with both compliant and non-compliant
      configurations. Run Checkov against them with --external-checks-dir and
      verify the expected pass/fail results. Automate this in your CI pipeline
      to prevent regressions in custom checks.
relatedItems:
  - checkov-terraform-scanning
  - checkov-ci-integration
  - checkov-policy-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Writing Custom Checkov Policies

## Overview
Checkov's 1000+ built-in checks cover common misconfigurations, but every organization has unique standards. Custom checks let you enforce company-specific naming conventions, tagging requirements, resource configurations, and security baselines.

## How It Works

### YAML Custom Check (Simple Attribute Validation)
```yaml
# custom-checks/require-encryption.yaml
metadata:
  id: "CKV2_CUSTOM_1"
  name: "Ensure all EBS volumes use customer-managed KMS keys"
  category: "ENCRYPTION"
  guideline: "https://wiki.company.com/security/encryption-standard"

definition:
  and:
    - cond_type: "attribute"
      resource_types:
        - "aws_ebs_volume"
      attribute: "kms_key_id"
      operator: "exists"
    - cond_type: "attribute"
      resource_types:
        - "aws_ebs_volume"
      attribute: "encrypted"
      operator: "equals"
      value: true
```

### Python Custom Check (Complex Logic)
```python
# custom-checks/require_tags.py
from checkov.terraform.checks.resource.base_resource_check import BaseResourceCheck
from checkov.common.models.enums import CheckResult, CheckCategories

class RequireMandatoryTags(BaseResourceCheck):
    def __init__(self):
        name = "Ensure all resources have mandatory tags"
        id = "CKV2_CUSTOM_2"
        supported_resources = [
            "aws_instance", "aws_s3_bucket", "aws_rds_instance",
            "aws_lambda_function", "aws_ecs_service",
        ]
        categories = [CheckCategories.GENERAL_SECURITY]
        super().__init__(name=name, id=id, categories=categories,
                        supported_resources=supported_resources)

    def scan_resource_conf(self, conf):
        required_tags = ["Environment", "Team", "CostCenter"]
        tags = conf.get("tags", [{}])

        if isinstance(tags, list):
            tags = tags[0] if tags else {}

        for tag in required_tags:
            if tag not in tags:
                return CheckResult.FAILED

        return CheckResult.PASSED

check = RequireMandatoryTags()
```

### Naming Convention Check
```python
# custom-checks/naming_convention.py
from checkov.terraform.checks.resource.base_resource_check import BaseResourceCheck
from checkov.common.models.enums import CheckResult, CheckCategories
import re

class ResourceNamingConvention(BaseResourceCheck):
    def __init__(self):
        name = "Ensure resources follow naming convention: {env}-{service}-{resource}"
        id = "CKV2_CUSTOM_3"
        supported_resources = ["aws_s3_bucket", "aws_sqs_queue", "aws_sns_topic"]
        categories = [CheckCategories.CONVENTION]
        super().__init__(name=name, id=id, categories=categories,
                        supported_resources=supported_resources)

    def scan_resource_conf(self, conf):
        pattern = r'^(dev|staging|prod)-[a-z]+-[a-z]+$'
        name_fields = ["bucket", "name"]

        for field in name_fields:
            values = conf.get(field, [])
            if values and isinstance(values, list) and values[0]:
                if re.match(pattern, str(values[0])):
                    return CheckResult.PASSED

        return CheckResult.FAILED

check = ResourceNamingConvention()
```

### Running Custom Checks
```bash
# Specify custom checks directory
checkov -d ./terraform/ --external-checks-dir ./custom-checks/

# Combine with built-in checks
checkov -d ./terraform/ --external-checks-dir ./custom-checks/ --check CKV_AWS_18,CKV2_CUSTOM_1
```

## Best Practices
- Use YAML checks for simple attribute validation (faster to write, easier to maintain)
- Use Python checks for complex logic (regex, cross-resource relationships)
- Follow Checkov ID convention: CKV2_CUSTOM_{number}
- Include guideline URLs pointing to internal documentation
- Test custom checks against known-good and known-bad Terraform files
- Version custom checks alongside IaC code in the same repository

## Common Mistakes
- Reimplementing built-in checks as custom checks (check the registry first)
- Not testing custom checks (they can have false positives/negatives)
- Hardcoding values that should be configurable (use environment variables)
- Writing checks that are too specific to one project (make them reusable)
