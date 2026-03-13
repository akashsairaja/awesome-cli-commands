---
id: azure-aks-configuration
stackId: azure
type: skill
name: Azure AKS Cluster Configuration
description: >-
  Deploy and configure production-ready AKS clusters with managed identity,
  Azure CNI, node pool auto-scaling, workload identity, and integration with
  Azure Key Vault and Container Registry.
difficulty: advanced
tags:
  - azure
  - aks
  - cluster
  - configuration
  - security
  - deployment
  - api
  - kubernetes
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Azure AKS Cluster Configuration skill?"
    answer: >-
      Deploy and configure production-ready AKS clusters with managed
      identity, Azure CNI, node pool auto-scaling, workload identity, and
      integration with Azure Key Vault and Container Registry. This skill
      provides a structured workflow for resource management, serverless
      functions, AKS configuration, and infrastructure automation.
  - question: "What tools and setup does Azure AKS Cluster Configuration require?"
    answer: >-
      Requires Azure CLI installed. Works with Azure projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Azure AKS Cluster Configuration

## Overview
Azure Kubernetes Service (AKS) provides managed Kubernetes with Azure-native integrations. Proper configuration of networking, identity, scaling, and security is critical for production workloads.

## Why This Matters
- **Security** — managed identity eliminates stored credentials
- **Networking** — Azure CNI provides VNet-native pod networking
- **Scaling** — cluster and node auto-scaling matches demand
- **Integration** — native Key Vault, ACR, and Monitor integration

## Step 1: Create Production AKS Cluster
```bash
# Create resource group
az group create -n myapp-aks-rg -l eastus

# Create AKS cluster
az aks create \
  --resource-group myapp-aks-rg \
  --name myapp-aks \
  --node-count 3 \
  --node-vm-size Standard_D4s_v5 \
  --enable-managed-identity \
  --network-plugin azure \
  --network-policy calico \
  --vnet-subnet-id "/subscriptions/.../subnets/aks-subnet" \
  --service-cidr 10.1.0.0/16 \
  --dns-service-ip 10.1.0.10 \
  --enable-cluster-autoscaler \
  --min-count 3 \
  --max-count 10 \
  --zones 1 2 3 \
  --enable-oidc-issuer \
  --enable-workload-identity \
  --auto-upgrade-channel stable \
  --tier standard \
  --tags Project=myapp Environment=production
```

## Step 2: Attach Container Registry
```bash
# Create ACR
az acr create -n myappacr -g myapp-aks-rg --sku Standard

# Attach ACR to AKS (grants AcrPull role)
az aks update -n myapp-aks -g myapp-aks-rg --attach-acr myappacr
```

## Step 3: Configure Workload Identity
```bash
# Create managed identity for workload
az identity create -n myapp-identity -g myapp-aks-rg

# Create federated credential
az identity federated-credential create \
  --name myapp-fed-cred \
  --identity-name myapp-identity \
  --resource-group myapp-aks-rg \
  --issuer "$(az aks show -n myapp-aks -g myapp-aks-rg --query oidcIssuerProfile.issuerUrl -o tsv)" \
  --subject "system:serviceaccount:default:myapp-sa" \
  --audience api://AzureADTokenExchange
```

```yaml
# Kubernetes ServiceAccount with workload identity
apiVersion: v1
kind: ServiceAccount
metadata:
  name: myapp-sa
  annotations:
    azure.workload.identity/client-id: "<managed-identity-client-id>"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    metadata:
      labels:
        azure.workload.identity/use: "true"
    spec:
      serviceAccountName: myapp-sa
```

## Step 4: Key Vault Integration
```bash
# Enable Key Vault secrets provider
az aks enable-addons -n myapp-aks -g myapp-aks-rg \
  --addons azure-keyvault-secrets-provider

# Grant access to managed identity
az keyvault set-policy -n myapp-kv \
  --secret-permissions get list \
  --object-id "$(az identity show -n myapp-identity -g myapp-aks-rg --query principalId -o tsv)"
```

## Step 5: Add Specialized Node Pools
```bash
# Spot node pool for dev/batch workloads
az aks nodepool add \
  --cluster-name myapp-aks \
  --resource-group myapp-aks-rg \
  --name spot \
  --priority Spot \
  --eviction-policy Delete \
  --spot-max-price -1 \
  --node-count 0 \
  --min-count 0 \
  --max-count 10 \
  --enable-cluster-autoscaler \
  --node-vm-size Standard_D4s_v5 \
  --labels workload=batch
```

## Best Practices
- Use managed identity (never store credentials)
- Enable Azure CNI for VNet-native networking
- Use workload identity for pod-level Azure access
- Enable cluster autoscaler with appropriate min/max
- Deploy across Availability Zones (--zones 1 2 3)
- Use node pool taints for workload isolation
- Enable auto-upgrade on the stable channel

## Common Mistakes
- Using kubenet instead of Azure CNI (no VNet integration, limited NetworkPolicy)
- Not enabling workload identity (falling back to pod identity v1, deprecated)
- Single availability zone (no AZ redundancy)
- Not attaching ACR (pods fail with ImagePullBackOff)
