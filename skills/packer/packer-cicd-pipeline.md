---
id: packer-cicd-pipeline
stackId: packer
type: skill
name: Packer CI/CD Image Pipelines
description: >-
  Integrate Packer into CI/CD pipelines — GitHub Actions workflows, automated
  builds on merge, image promotion across environments, and managing image
  lifecycle in production.
difficulty: advanced
tags:
  - ci-cd
  - github-actions
  - automation
  - image-lifecycle
  - testing
  - promotion
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Packer CLI installed
  - 'CI/CD platform (GitHub Actions, GitLab CI)'
  - Cloud credentials configured
faq:
  - question: How do I automate Packer builds in GitHub Actions?
    answer: >-
      Use hashicorp/setup-packer action to install Packer. Configure cloud
      credentials with OIDC (aws-actions/configure-aws-credentials). Run packer
      init, packer validate, then packer build with -var flags for version
      metadata. Upload manifest.json as an artifact for downstream tracking.
  - question: How do I test a Packer image before deploying?
    answer: >-
      After build: parse manifest.json for AMI ID, launch a test instance, run
      smoke tests (check services, ports, configs), then terminate. Automate
      with a test script in CI. Only promote to production after tests pass. Use
      InSpec or Serverspec for structured image testing.
  - question: How do I clean up old AMIs automatically?
    answer: >-
      List images sorted by date, keep the last N versions, deregister the rest.
      Also delete associated snapshots. Run as a scheduled CI job or Lambda
      function. Tag images with expiration dates for lifecycle policies. AWS has
      native AMI lifecycle management via DLM.
relatedItems:
  - packer-hcl2-templates
  - packer-provisioner-scripts
  - packer-image-builder
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Packer CI/CD Image Pipelines

## Overview
Automate image builds with CI/CD for consistent, tested, and auditable machine images. Build on merge, test images, promote across environments, and manage image lifecycle.

## Why This Matters
- **Consistency** — every image built the same way
- **Speed** — automated builds on code merge
- **Auditing** — build logs and manifests for compliance
- **Lifecycle** — automated image deprecation and cleanup

## How It Works

### Step 1: CI/CD Workflow Structure
```bash
# GitHub Actions: .github/workflows/packer.yml
# name: Build Image
# on:
#   push:
#     branches: [main]
#     paths: ['packer/**', 'scripts/**']
#
# jobs:
#   validate:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - uses: hashicorp/setup-packer@main
#       - run: packer init packer/
#       - run: packer validate packer/
#       - run: packer fmt -check packer/
#
#   build:
#     needs: validate
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - uses: hashicorp/setup-packer@main
#       - uses: aws-actions/configure-aws-credentials@v4
#         with:
#           role-to-assume: ${{ secrets.AWS_ROLE }}
#       - run: |
#           packer init packer/
#           packer build \
#             -var="version=${{ github.sha }}" \
#             -var="git_sha=${{ github.sha }}" \
#             packer/
#       - uses: actions/upload-artifact@v4
#         with:
#           name: manifest
#           path: manifest.json
```

### Step 2: Build with Metadata
```bash
# Pass CI metadata to builds
packer build \
  -var="version=$(git describe --tags)" \
  -var="git_sha=$(git rev-parse HEAD)" \
  -var="build_number=$BUILD_NUMBER" \
  -var="build_url=$BUILD_URL" \
  template.pkr.hcl

# Post-processor manifest for tracking
# post-processor "manifest" {
#   output     = "manifest.json"
#   strip_path = true
#   custom_data = {
#     version     = var.version
#     git_sha     = var.git_sha
#     build_time  = timestamp()
#   }
# }
```

### Step 3: Image Testing
```bash
# Launch test instance from new AMI
AMI_ID=$(jq -r '.builds[-1].artifact_id' manifest.json | cut -d: -f2)

# Run tests against the image
aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type t3.micro \
  --key-name test-key \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Purpose,Value=image-test}]"

# Wait and test
sleep 60
ssh -o StrictHostKeyChecking=no ubuntu@$IP "nginx -v && systemctl is-active nginx"

# Terminate test instance
aws ec2 terminate-instances --instance-ids "$INSTANCE_ID"
```

### Step 4: Image Lifecycle Management
```bash
# Tag for promotion
aws ec2 create-tags --resources "$AMI_ID" \
  --tags Key=Environment,Value=staging Key=Promoted,Value=true

# Deregister old images (keep last 5)
aws ec2 describe-images --owners self \
  --filters "Name=tag:Project,Values=myapp" \
  --query 'Images | sort_by(@, &CreationDate) | [:-5].[ImageId]' \
  --output text | while read ami; do
    aws ec2 deregister-image --image-id "$ami"
  done

# Promote staging to production
aws ec2 copy-image \
  --source-image-id "$AMI_ID" \
  --source-region us-east-1 \
  --region us-west-2 \
  --name "myapp-prod-$VERSION"
```

## Best Practices
- Validate and fmt-check in CI before building
- Tag images with git SHA, version, and build metadata
- Test images before promoting to production
- Automate image cleanup (keep last N versions)
- Use OIDC for AWS authentication in CI (no static keys)

## Common Mistakes
- No validation step in CI (broken templates waste build time)
- No image testing (broken images deployed to production)
- No lifecycle management (hundreds of orphaned AMIs)
- Static AWS keys in CI (use OIDC roles instead)
- No manifest artifact (can't trace deployed images to builds)
