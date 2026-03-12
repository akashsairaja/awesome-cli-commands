---
id: gcloud-gke-configuration
stackId: gcloud
type: skill
name: GKE Cluster Configuration & Best Practices
description: >-
  Deploy and configure production-ready GKE clusters — Autopilot vs Standard,
  Workload Identity, Binary Authorization, cluster autoscaling, and security
  hardening.
difficulty: advanced
tags:
  - gke
  - kubernetes
  - autopilot
  - workload-identity
  - binary-authorization
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Google Cloud account
  - gcloud CLI
  - Kubernetes basics
faq:
  - question: Should I use GKE Autopilot or Standard?
    answer: >-
      Use Autopilot for most workloads. It eliminates node management, enforces
      security best practices (no privileged containers), and charges per pod
      resource request. Use Standard only when you need: DaemonSets for custom
      monitoring, privileged containers, specific machine types, GPUs, or
      fine-grained node pool control.
  - question: What is GKE Workload Identity and how does it work?
    answer: >-
      Workload Identity links Kubernetes ServiceAccounts (KSA) to Google Cloud
      service accounts (GSA). Pods using the KSA automatically receive
      short-lived GCP credentials via the GKE metadata server. This eliminates
      service account key files entirely. Configure by annotating the KSA with
      the GSA email and binding the workloadIdentityUser role.
relatedItems:
  - gcloud-iam-architect
  - gcloud-cli-patterns
  - kubernetes-pod-security
version: 1.0.0
lastUpdated: '2026-03-11'
---

# GKE Cluster Configuration & Best Practices

## Overview
Google Kubernetes Engine (GKE) provides managed Kubernetes with deep Google Cloud integration. Choosing between Autopilot and Standard, configuring Workload Identity, and enabling security features are critical decisions for production clusters.

## Why This Matters
- **Operational overhead** — Autopilot eliminates node management
- **Security** — Workload Identity replaces service account key files
- **Cost** — Autopilot charges per pod, Standard charges per node
- **Compliance** — Binary Authorization ensures only trusted images run

## GKE Autopilot (Recommended)
```bash
gcloud container clusters create-auto myapp-cluster \
  --region us-central1 \
  --release-channel regular \
  --network myapp-vpc \
  --subnetwork myapp-gke-subnet \
  --cluster-secondary-range-name pods \
  --services-secondary-range-name services \
  --enable-master-authorized-networks \
  --master-authorized-networks 10.0.0.0/8 \
  --enable-private-nodes \
  --master-ipv4-cidr 172.16.0.0/28
```

## GKE Standard (When You Need Control)
```bash
gcloud container clusters create myapp-cluster \
  --region us-central1 \
  --num-nodes 3 \
  --machine-type e2-standard-4 \
  --release-channel regular \
  --network myapp-vpc \
  --subnetwork myapp-gke-subnet \
  --enable-ip-alias \
  --enable-autoscaling --min-nodes 3 --max-nodes 10 \
  --enable-autorepair \
  --enable-autoupgrade \
  --workload-pool=myproject.svc.id.goog \
  --enable-shielded-nodes \
  --enable-private-nodes \
  --master-ipv4-cidr 172.16.0.0/28 \
  --enable-master-authorized-networks \
  --master-authorized-networks 10.0.0.0/8
```

## Workload Identity (GKE + GCP IAM)
```bash
# Enable Workload Identity on cluster
gcloud container clusters update myapp-cluster \
  --workload-pool=myproject.svc.id.goog \
  --region us-central1

# Create GCP service account
gcloud iam service-accounts create myapp-sa \
  --display-name="MyApp GKE Workload"

# Grant permissions to service account
gcloud projects add-iam-policy-binding myproject \
  --member="serviceAccount:myapp-sa@myproject.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Link KSA to GSA
gcloud iam service-accounts add-iam-policy-binding \
  myapp-sa@myproject.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="serviceAccount:myproject.svc.id.goog[default/myapp-ksa]"
```

```yaml
# Kubernetes ServiceAccount annotation
apiVersion: v1
kind: ServiceAccount
metadata:
  name: myapp-ksa
  annotations:
    iam.gke.io/gcp-service-account: myapp-sa@myproject.iam.gserviceaccount.com
```

## Security Hardening
```bash
# Enable Binary Authorization
gcloud container clusters update myapp-cluster \
  --enable-binauthz --region us-central1

# Enable network policy enforcement
gcloud container clusters update myapp-cluster \
  --enable-network-policy --region us-central1

# Enable Shielded GKE Nodes
gcloud container clusters update myapp-cluster \
  --enable-shielded-nodes --region us-central1
```

## Autopilot vs Standard
| Feature | Autopilot | Standard |
|---------|-----------|---------|
| Node management | Google-managed | User-managed |
| Pricing | Per pod resources | Per node |
| GPU support | Yes (limited) | Full control |
| DaemonSets | Limited | Full support |
| Privileged pods | Not allowed | Allowed |
| Best for | Most workloads | Custom requirements |

## Best Practices
- Use Autopilot for most workloads (less ops, enforced security)
- Enable Workload Identity (never use exported service account keys)
- Use private clusters (no public node IPs)
- Enable master authorized networks
- Use regular or stable release channel
- Enable Binary Authorization for production

## Common Mistakes
- Using Standard when Autopilot would suffice (unnecessary ops burden)
- Exporting service account keys instead of using Workload Identity
- Public cluster nodes (unnecessary attack surface)
- Disabling auto-upgrade (missing security patches)
