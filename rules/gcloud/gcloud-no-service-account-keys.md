---
id: gcloud-no-service-account-keys
stackId: gcloud
type: rule
name: Never Export Service Account Keys
description: >-
  GCP service account JSON key files must never be created or exported — use
  Workload Identity Federation, attached service accounts, or Application
  Default Credentials instead.
difficulty: intermediate
globs:
  - '**/*.tf'
  - '**/*.yaml'
  - '**/*.yml'
  - '**/*.json'
  - '**/gcloud/**'
  - '**/.github/**'
tags:
  - service-account-keys
  - workload-identity
  - security
  - credentials
  - gcp-security
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
  - question: Why should I never create GCP service account key files?
    answer: >-
      Service account keys are long-lived credentials that never expire
      automatically. They are the #1 cause of GCP security incidents — leaked
      through Git commits, shared in chat, or left on compromised machines. Use
      Workload Identity Federation for CI/CD, attached service accounts for GCP
      workloads, and ADC for development.
  - question: How do I authenticate to GCP without service account keys?
    answer: >-
      Four alternatives: (1) Workload Identity Federation for external services
      (GitHub, AWS, Azure). (2) Attached service accounts for GCE, Cloud Run,
      GKE. (3) GKE Workload Identity for Kubernetes pods. (4) Application
      Default Credentials (gcloud auth application-default login) for local
      development. All provide short-lived, auto-rotating credentials.
relatedItems:
  - gcloud-iam-architect
  - gcloud-project-labels
  - gcloud-gke-configuration
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Never Export Service Account Keys

## Rule
Service account JSON key files MUST NOT be created or exported. Use Workload Identity Federation for external access and attached service accounts for GCP-native workloads.

## Why This Is Critical
- Exported keys are **long-lived** — they never expire unless manually rotated
- Keys are **easily leaked** — committed to Git, shared in Slack, left on developer machines
- Keys **cannot be scoped** — they provide full SA permissions with no IP or time restriction
- Key compromise is the **#1 cause** of GCP security incidents

## Alternatives by Use Case

### GKE Pods
```yaml
# Use Workload Identity (never mount key files)
apiVersion: v1
kind: ServiceAccount
metadata:
  name: myapp-ksa
  annotations:
    iam.gke.io/gcp-service-account: myapp-sa@myproject.iam.gserviceaccount.com
```

### GitHub Actions
```yaml
# Use Workload Identity Federation (no stored secrets)
- uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: 'projects/123/locations/global/workloadIdentityPools/github/providers/my-repo'
    service_account: 'deploy-sa@myproject.iam.gserviceaccount.com'
```

### Compute Engine / Cloud Run
```bash
# Attach service account (automatic credentials)
gcloud compute instances create myvm \
  --service-account=myapp-sa@myproject.iam.gserviceaccount.com \
  --scopes=cloud-platform

gcloud run deploy myapp \
  --service-account=myapp-sa@myproject.iam.gserviceaccount.com
```

### Local Development
```bash
# Application Default Credentials (interactive login, short-lived)
gcloud auth application-default login
# Grants temporary credentials that auto-refresh
```

## Good Practices
```bash
# Workload Identity Federation — zero stored credentials
# Attached service accounts — automatic credential rotation
# Application Default Credentials — short-lived developer tokens
```

## Bad Practices
```bash
# NEVER do this
gcloud iam service-accounts keys create key.json \
  --iam-account=myapp@myproject.iam.gserviceaccount.com

# NEVER commit key files to Git
# NEVER share key files via Slack, email, or cloud storage
# NEVER store key files in CI/CD environment variables
```

## Enforcement
- Organization Policy: `iam.disableServiceAccountKeyCreation`
- Audit with: `gcloud iam service-accounts keys list --iam-account=SA_EMAIL`
- Alert on key creation events in Cloud Audit Logs
- Rotate and delete any existing keys
