---
id: gcloud-project-organization
stackId: gcloud
type: skill
name: >-
  Google Cloud Project & Organization Structure
description: >-
  Design Google Cloud organization hierarchy with folders, projects, and
  resource labels — project naming conventions, billing management,
  organization policies, Shared VPC, IAM inheritance, and multi-team
  governance patterns.
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
      Use this skill when designing or restructuring your GCP hierarchy —
      organizing projects into folders by environment, setting up naming
      conventions, configuring organization policies for security guardrails,
      managing billing attribution, and implementing Shared VPC for centralized
      networking.
  - question: "What tools and setup does Google Cloud Project & Organization Structure require?"
    answer: >-
      Requires gcloud CLI with Organization Admin or Folder Admin IAM roles.
      An organization resource requires a verified Google Workspace or Cloud
      Identity domain. Individual accounts can create projects but cannot use
      folders or organization policies.
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# Google Cloud Project & Organization Structure

## Overview

A well-designed GCP organization hierarchy is the foundation for security isolation, cost attribution, and policy governance at scale. GCP's resource hierarchy has four levels: Organization, Folders, Projects, and Resources. IAM policies and organization constraints inherit downward — set a policy at the folder level and every project in that folder inherits it. Getting the hierarchy right early prevents painful reorganizations later.

## The Resource Hierarchy

```
Organization (mycompany.com)                     ← IAM + Org Policies apply here
├── Production/                                   ← Folder: strict policies
│   ├── myco-webapp-prod        (project)
│   ├── myco-api-prod           (project)
│   ├── myco-shared-net-prod    (project)        ← Shared VPC host
│   └── myco-shared-data-prod   (project)        ← Shared databases
├── Staging/                                      ← Folder: production-like policies
│   ├── myco-webapp-staging     (project)
│   └── myco-api-staging        (project)
├── Development/                                  ← Folder: relaxed policies
│   ├── myco-webapp-dev         (project)
│   ├── myco-api-dev            (project)
│   └── myco-sandbox-team-a     (project)        ← Team sandbox
├── Platform/                                     ← Folder: shared services
│   ├── myco-shared-cicd        (project)        ← Cloud Build, Artifact Registry
│   ├── myco-shared-monitoring  (project)        ← Cloud Monitoring, Logging
│   └── myco-shared-security    (project)        ← Security Command Center, KMS
└── Sandbox/                                      ← Folder: individual experimentation
    ├── myco-sandbox-alice      (project)
    └── myco-sandbox-bob        (project)
```

The key design decisions:

- **Projects are the isolation boundary.** IAM, networking, and billing are project-scoped. One project per workload per environment.
- **Folders group by environment.** Production, Staging, Development get different policies and access controls.
- **Platform folder for shared infrastructure.** CI/CD, monitoring, networking, and security tooling live in dedicated projects.
- **Sandbox folder for experimentation.** Developers get isolated projects with budget limits and auto-deletion policies.

## Creating the Hierarchy

### Create Folders

```bash
# Get your organization ID
gcloud organizations list
# DISPLAY_NAME    ID             DIRECTORY_CUSTOMER_ID
# mycompany.com   123456789012   C01abc123

ORG_ID=123456789012

# Create top-level folders
gcloud resource-manager folders create \
  --display-name="Production" \
  --organization=$ORG_ID

gcloud resource-manager folders create \
  --display-name="Staging" \
  --organization=$ORG_ID

gcloud resource-manager folders create \
  --display-name="Development" \
  --organization=$ORG_ID

gcloud resource-manager folders create \
  --display-name="Platform" \
  --organization=$ORG_ID

gcloud resource-manager folders create \
  --display-name="Sandbox" \
  --organization=$ORG_ID

# List folders to get their IDs
gcloud resource-manager folders list --organization=$ORG_ID
```

A parent folder can contain up to 300 direct child folders. Those children can contain additional folders and projects — the hierarchy supports up to 10 levels of nesting.

### Create Projects

```bash
PROD_FOLDER_ID=111111111111
DEV_FOLDER_ID=222222222222
PLATFORM_FOLDER_ID=333333333333

# Production project with labels
gcloud projects create myco-webapp-prod \
  --folder=$PROD_FOLDER_ID \
  --labels="environment=production,team=webapp,cost-center=eng-100,managed-by=terraform"

# Development project
gcloud projects create myco-webapp-dev \
  --folder=$DEV_FOLDER_ID \
  --labels="environment=development,team=webapp,cost-center=eng-100"

# Platform project for CI/CD
gcloud projects create myco-shared-cicd \
  --folder=$PLATFORM_FOLDER_ID \
  --labels="environment=platform,team=devops,cost-center=platform-200"
```

## Project Naming Convention

```
{org-prefix}-{workload}-{environment}[-{region}]

Examples:
myco-webapp-prod              # Web application, production
myco-webapp-staging           # Web application, staging
myco-webapp-dev               # Web application, development
myco-api-prod                 # API service, production
myco-shared-net-prod          # Shared VPC host, production
myco-shared-cicd              # CI/CD (environment-agnostic)
myco-shared-monitoring        # Monitoring (environment-agnostic)
myco-sandbox-alice            # Developer sandbox
myco-webapp-prod-eu           # Multi-region variant
```

GCP project IDs are globally unique and immutable. Choose a naming convention before creating projects — you cannot rename them later. Project IDs must be 6-30 characters, lowercase letters, digits, and hyphens only.

## Billing Management

```bash
# List billing accounts
gcloud billing accounts list

BILLING_ACCOUNT_ID=01ABCD-EFGH12-345678

# Link a project to a billing account
gcloud billing projects link myco-webapp-prod \
  --billing-account=$BILLING_ACCOUNT_ID

# Set a budget alert (via gcloud or Console)
gcloud billing budgets create \
  --billing-account=$BILLING_ACCOUNT_ID \
  --display-name="webapp-prod-monthly" \
  --budget-amount=5000 \
  --threshold-rule=percent=0.5 \
  --threshold-rule=percent=0.8 \
  --threshold-rule=percent=1.0 \
  --filter-projects="projects/myco-webapp-prod"
```

### Cost Attribution with Labels

Labels are the primary mechanism for cost reporting across projects:

```bash
# Required labels for all projects
gcloud projects update myco-webapp-prod \
  --update-labels="\
environment=production,\
team=webapp,\
cost-center=eng-100,\
managed-by=terraform,\
business-unit=consumer"

# Query costs by label in BigQuery billing export
# SELECT labels.value AS team, SUM(cost) AS total_cost
# FROM billing_export
# WHERE labels.key = 'team'
# GROUP BY team
```

Define a mandatory label schema and enforce it with organization policies or CI checks. Without labels, you cannot attribute costs to teams, and cloud bills become an undifferentiated lump.

## Organization Policies

Organization policies are security guardrails that inherit down the hierarchy. Set them at the organization or folder level:

### Restrict Allowed Regions

```bash
# Create policy YAML
cat > restrict-regions.yaml << 'EOF'
constraint: constraints/gcp.resourceLocations
listPolicy:
  allowedValues:
    - in:us-locations
    - in:eu-locations
  deniedValues:
    - in:asia-locations
EOF

# Apply at organization level
gcloud org-policies set-policy restrict-regions.yaml \
  --organization=$ORG_ID
```

### Enforce Security Defaults

```bash
# Disable service account key creation (use Workload Identity instead)
gcloud org-policies set-policy \
  --organization=$ORG_ID \
  --constraint=iam.disableServiceAccountKeyCreation \
  --type=boolean \
  --enforce

# Require uniform bucket-level access (disable ACLs)
gcloud org-policies set-policy \
  --organization=$ORG_ID \
  --constraint=storage.uniformBucketLevelAccess \
  --type=boolean \
  --enforce

# Disable VM serial port access
gcloud org-policies set-policy \
  --organization=$ORG_ID \
  --constraint=compute.disableSerialPortAccess \
  --type=boolean \
  --enforce

# Require OS Login for SSH (no project-wide SSH keys)
gcloud org-policies set-policy \
  --organization=$ORG_ID \
  --constraint=compute.requireOsLogin \
  --type=boolean \
  --enforce
```

### Folder-Level Policy Overrides

```bash
# Allow SA key creation in the Platform folder (CI/CD needs it)
gcloud org-policies set-policy \
  --folder=$PLATFORM_FOLDER_ID \
  --constraint=iam.disableServiceAccountKeyCreation \
  --type=boolean \
  --no-enforce
```

Policies inherit downward but can be overridden at lower levels. Use the organization level for strict defaults and folder-level overrides for legitimate exceptions.

## IAM Inheritance

IAM follows the same inheritance model as organization policies:

```bash
# Grant a team Viewer access to all projects in their folder
gcloud resource-manager folders add-iam-policy-binding $DEV_FOLDER_ID \
  --member="group:webapp-devs@mycompany.com" \
  --role="roles/viewer"

# Grant Editor on specific project
gcloud projects add-iam-policy-binding myco-webapp-dev \
  --member="group:webapp-devs@mycompany.com" \
  --role="roles/editor"

# Grant org-wide security auditing
gcloud organizations add-iam-policy-binding $ORG_ID \
  --member="group:security-team@mycompany.com" \
  --role="roles/iam.securityReviewer"
```

Set IAM at the highest appropriate level to reduce management overhead. If a group needs access to all projects in a folder, set the binding at the folder — not on each project individually.

## Shared VPC

Shared VPC centralizes network management in a host project while allowing service projects to deploy resources into shared subnets:

```bash
# Enable Shared VPC on the host project
gcloud compute shared-vpc enable myco-shared-net-prod

# Associate service projects
gcloud compute shared-vpc associated-projects add myco-webapp-prod \
  --host-project=myco-shared-net-prod

gcloud compute shared-vpc associated-projects add myco-api-prod \
  --host-project=myco-shared-net-prod

# Service projects can now use subnets from the host project
```

Shared VPC means the networking team controls VPC configuration, firewall rules, and subnet allocation. Application teams deploy into pre-approved subnets without needing network admin permissions.

## Listing and Auditing

```bash
# List all projects in the organization
gcloud projects list --filter="parent.id=$ORG_ID"

# List all projects in a folder (recursive)
gcloud projects list --filter="parent.id=$PROD_FOLDER_ID"

# List all folders
gcloud resource-manager folders list --organization=$ORG_ID

# List project labels
gcloud projects describe myco-webapp-prod --format="value(labels)"

# Find projects missing required labels
gcloud projects list --format="table(projectId,labels)" \
  --filter="NOT labels.cost-center:*"

# Check active organization policies
gcloud org-policies list --organization=$ORG_ID
```

## Terraform Integration

```hcl
# terraform/projects/main.tf
resource "google_project" "webapp_prod" {
  name            = "Webapp Production"
  project_id      = "myco-webapp-prod"
  folder_id       = google_folder.production.name
  billing_account = var.billing_account_id

  labels = {
    environment  = "production"
    team         = "webapp"
    cost-center  = "eng-100"
    managed-by   = "terraform"
  }
}

resource "google_folder" "production" {
  display_name = "Production"
  parent       = "organizations/${var.org_id}"
}
```

## Best Practices

- One project per workload per environment. This provides IAM isolation, clear cost attribution, and limits blast radius. A monolithic project with everything is unmanageable at scale.
- Group projects into folders by environment (Production, Staging, Development). Apply the strictest organization policies at the production folder level.
- Apply organization policies at the org or folder level — not per-project. Per-project policies do not scale and are easy to forget.
- Use a dedicated project for shared infrastructure (VPC, CI/CD, monitoring). Do not mix shared and application resources in the same project.
- Label every project with at minimum: `environment`, `team`, `cost-center`, and `managed-by`. Labels enable cost reporting and automated governance.
- Use Shared VPC to centralize networking. Application teams should not manage their own VPCs in production.
- Disable service account key creation org-wide. Use Workload Identity Federation for external access and service account impersonation for internal access.
- Manage the hierarchy with Terraform or Pulumi — manual Console changes drift and are not auditable.

## Common Pitfalls

- Putting all resources in a single project — no isolation, IAM becomes a mess, and cost attribution is impossible.
- No folder structure — a flat list of projects without grouping provides no policy inheritance. You end up setting the same policies on every project individually.
- Missing project labels — without labels, the monthly cloud bill is an undifferentiated number that nobody can break down by team or workload.
- Not setting organization policies — each project team invents their own security posture. Public buckets, exposed VMs, and SA key sprawl follow.
- Creating projects through the Console instead of Terraform — leads to inconsistent naming, missing labels, and configuration drift.
- Using project-level VPCs in every project — creates networking silos, complicates firewall management, and prevents centralized network monitoring.
- Not planning for project ID immutability — project IDs cannot be changed after creation. A bad naming convention haunts you forever.
