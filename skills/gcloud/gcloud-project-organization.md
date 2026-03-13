---
id: gcloud-project-organization
stackId: gcloud
type: skill
name: >-
  Google Cloud Project & Organization Structure
description: >-
  Design Google Cloud organization hierarchy with folders, projects, and
  resource labels — implement project naming conventions, billing management,
  and organization-level policies.
difficulty: advanced
tags:
  - gcloud
  - google
  - cloud
  - project
  - organization
  - structure
  - security
  - monitoring
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Google Cloud Project & Organization Structure skill?"
    answer: >-
      Design Google Cloud organization hierarchy with folders, projects, and
      resource labels — implement project naming conventions, billing
      management, and organization-level policies. It includes practical
      examples for GCP cloud development.
  - question: "What tools and setup does Google Cloud Project & Organization Structure require?"
    answer: >-
      Requires gcloud CLI installed. Works with Google Cloud projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Google Cloud Project & Organization Structure

## Overview
A well-designed GCP organization hierarchy separates environments, teams, and workloads into projects grouped by folders. This enables security isolation, cost attribution, and policy inheritance.

## Why This Matters
- **Security isolation** — IAM and networking are project-scoped
- **Cost attribution** — billing labels and project-level budgets
- **Policy inheritance** — Organization Policies apply at folder level
- **Blast radius** — issues in one project do not affect others

## Organization Hierarchy
```
Organization (mycompany.com)
├── Folders
│   ├── Production/
│   │   ├── myapp-prod (project)
│   │   ├── shared-prod-networking (project)
│   │   └── shared-prod-data (project)
│   ├── Staging/
│   │   └── myapp-staging (project)
│   ├── Development/
│   │   ├── myapp-dev (project)
│   │   └── sandbox-team-alpha (project)
│   └── Platform/
│       ├── shared-cicd (project)
│       ├── shared-monitoring (project)
│       └── shared-security (project)
```

## Project Naming Convention
```
{org-prefix}-{workload}-{environment}

Examples:
myco-webapp-prod
myco-webapp-staging
myco-webapp-dev
myco-shared-networking-prod
myco-shared-cicd
```

## Creating the Hierarchy
```bash
# Create folders
gcloud resource-manager folders create \
  --display-name="Production" \
  --organization=123456789

gcloud resource-manager folders create \
  --display-name="Development" \
  --organization=123456789

# Create projects in folders
gcloud projects create myco-webapp-prod \
  --folder=PRODUCTION_FOLDER_ID \
  --labels=environment=production,team=webapp,cost-center=eng-100

gcloud projects create myco-webapp-dev \
  --folder=DEVELOPMENT_FOLDER_ID \
  --labels=environment=development,team=webapp,cost-center=eng-100

# Link billing account
gcloud billing projects link myco-webapp-prod \
  --billing-account=BILLING_ACCOUNT_ID
```

## Organization Policies
```bash
# Restrict allowed regions (all projects inherit)
gcloud org-policies set-policy \
  --organization=123456789 \
  policy.yaml

# policy.yaml
# constraint: constraints/gcp.resourceLocations
# listPolicy:
#   allowedValues:
#     - in:us-central1-locations
#     - in:us-east1-locations

# Disable service account key creation
gcloud org-policies set-policy \
  --organization=123456789 \
  --constraint=iam.disableServiceAccountKeyCreation \
  --type=boolean \
  --enforce

# Require uniform bucket-level access
gcloud org-policies set-policy \
  --organization=123456789 \
  --constraint=storage.uniformBucketLevelAccess \
  --type=boolean \
  --enforce
```

## Project Labels
```bash
# Required labels for all projects
gcloud projects update myco-webapp-prod \
  --update-labels="environment=production,team=webapp,cost-center=eng-100,managed-by=terraform"
```

## Best Practices
- One project per workload per environment
- Group projects into folders by environment (prod/staging/dev)
- Apply Organization Policies at the Organization or Folder level
- Use a separate project for shared infrastructure (VPC, CI/CD, monitoring)
- Label all projects for cost attribution
- Use Shared VPC to centralize networking in a host project

## Common Mistakes
- All resources in a single project (no isolation, hard to manage IAM)
- No folder structure (flat project list, no policy inheritance)
- Missing project labels (cannot attribute costs)
- Organization Policies not set (each project does its own thing)
