---
id: gcloud-project-labels
stackId: gcloud
type: rule
name: Mandatory Project and Resource Labels
description: >-
  Every GCP project and resource must have mandatory labels for cost
  attribution, ownership tracking, and environment identification — enforced via
  Organization Policies.
difficulty: beginner
globs:
  - '**/*.tf'
  - '**/*.yaml'
  - '**/*.yml'
  - '**/gcloud/**'
tags:
  - labels
  - cost-attribution
  - governance
  - naming-conventions
  - billing
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
  - question: Why are labels important on GCP projects and resources?
    answer: >-
      Labels enable cost attribution (which team/project is spending),
      environment identification, ownership tracking, and resource filtering.
      GCP Billing export to BigQuery can be queried by labels to generate
      per-team cost reports. Without labels, cloud spend is unattributable and
      resources become orphaned.
  - question: How do I enforce mandatory labels on GCP resources?
    answer: >-
      Use Organization Policies to require labels at the project level. In
      Terraform, define common_labels as a local and merge into every resource.
      Use variable validation to require environment and team labels. Query
      BigQuery billing export to identify resources without required labels.
relatedItems:
  - gcloud-no-service-account-keys
  - gcloud-project-organization
  - terraform-required-tags
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Mandatory Project and Resource Labels

## Rule
Every GCP project MUST have labels: environment, team, and cost-center. All taggable resources SHOULD inherit project labels.

## Required Labels
| Label | Example | Purpose |
|-------|---------|---------|
| environment | production | Environment identification |
| team | platform | Ownership |
| cost-center | eng-100 | Financial tracking |
| managed-by | terraform | IaC tracking |

## Project Labels
```bash
# Set labels on project creation
gcloud projects create myco-webapp-prod \
  --labels=environment=production,team=webapp,cost-center=eng-100,managed-by=terraform

# Update existing project labels
gcloud projects update myco-webapp-prod \
  --update-labels=environment=production,team=webapp,cost-center=eng-100
```

## Resource Labels (Terraform)
```hcl
locals {
  common_labels = {
    environment = var.environment
    team        = var.team
    cost-center = var.cost_center
    managed-by  = "terraform"
  }
}

resource "google_compute_instance" "web" {
  name         = "web-server"
  machine_type = "e2-medium"
  labels       = merge(local.common_labels, {
    component = "frontend"
  })
}

resource "google_storage_bucket" "data" {
  name     = "myapp-data"
  labels   = local.common_labels
}
```

## Good Examples
```bash
# All required labels present
gcloud compute instances create web-01 \
  --labels=environment=production,team=webapp,cost-center=eng-100,component=frontend
```

## Bad Examples
```bash
# BAD: No labels
gcloud compute instances create web-01

# BAD: Incomplete labels
gcloud compute instances create web-01 --labels=name=web
```

## Cost Attribution
```bash
# View costs by label in BigQuery billing export
SELECT
  labels.value AS team,
  SUM(cost) AS total_cost
FROM `billing.gcp_billing_export`
CROSS JOIN UNNEST(labels) AS labels
WHERE labels.key = 'team'
GROUP BY team
ORDER BY total_cost DESC
```

## Enforcement
- Organization Policy: require labels on project creation
- Terraform variable validation for mandatory labels
- BigQuery billing export filtered by labels for cost reports
- Regular audit for unlabeled resources
