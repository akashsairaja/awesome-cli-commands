---
id: k3s-storage-setup
stackId: k3s
type: skill
name: Configure Persistent Storage for K3s
description: >-
  Set up persistent storage in K3s clusters using local-path-provisioner,
  Longhorn distributed storage, and NFS for stateful workloads like databases
  and file stores.
difficulty: intermediate
tags:
  - k3s-storage
  - longhorn
  - local-path
  - persistent-volumes
  - nfs
  - stateful-workloads
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - K3s cluster running
  - kubectl access
  - 'For Longhorn: open-iscsi installed on all nodes'
faq:
  - question: What storage options are available for K3s?
    answer: >-
      K3s includes local-path-provisioner by default for single-node storage.
      For multi-node clusters, use Longhorn (built-in replication, snapshots,
      backups), NFS CSI driver (external NFS server), or cloud provider CSI
      drivers (EBS, Azure Disk, etc.).
  - question: Should I use local-path or Longhorn for K3s storage?
    answer: >-
      Use local-path for development and single-node clusters where data
      locality is fine. Use Longhorn for multi-node production clusters where
      you need data replication across nodes, volume snapshots, and backup
      capabilities.
relatedItems:
  - k3s-ha-cluster-setup
  - k3s-cluster-architect
  - k3s-upgrade-strategy
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Configure Persistent Storage for K3s

## Overview
K3s bundles local-path-provisioner by default for single-node storage. For production multi-node clusters, you need distributed storage like Longhorn or external NFS to ensure data availability when pods move between nodes.

## Why This Matters
- **Stateful workloads** — databases, message queues, and file stores need persistent data
- **Pod mobility** — distributed storage lets pods run on any node
- **Data protection** — replication prevents data loss from node failure
- **Dynamic provisioning** — create PVCs on demand without manual PV creation

## How It Works

### Option A: Local-Path (Default — Single Node)
```bash
# Already installed by default in K3s
# Check the StorageClass
kubectl get storageclass

# Create a PVC
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-data
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: local-path
  resources:
    requests:
      storage: 5Gi
EOF
```

### Option B: Longhorn (Distributed — Multi Node)
```bash
# Install prerequisites
sudo apt-get install -y open-iscsi nfs-common

# Install Longhorn via Helm
helm repo add longhorn https://charts.longhorn.io
helm repo update
helm install longhorn longhorn/longhorn \
  --namespace longhorn-system \
  --create-namespace \
  --set defaultSettings.defaultReplicaCount=3

# Set Longhorn as default StorageClass
kubectl patch storageclass local-path -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
kubectl patch storageclass longhorn -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

### Option C: NFS External Storage
```bash
# Install NFS CSI driver
helm repo add nfs-csi https://raw.githubusercontent.com/kubernetes-csi/csi-driver-nfs/master/charts
helm install nfs-csi nfs-csi/csi-driver-nfs --namespace kube-system

# Create StorageClass
cat <<'EOF' | kubectl apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs-csi
provisioner: nfs.csi.k8s.io
parameters:
  server: nfs-server.example.com
  share: /exports/k3s
reclaimPolicy: Retain
volumeBindingMode: Immediate
mountOptions:
  - nfsvers=4.1
EOF
```

## Best Practices
- Use local-path only for single-node or development clusters
- Use Longhorn for multi-node production (built-in replication and backups)
- Set `reclaimPolicy: Retain` for production data (prevents accidental deletion)
- Configure Longhorn replica count to match your node count (max 3)
- Set resource limits on Longhorn manager to prevent resource starvation
- Test storage failover by draining nodes and verifying data access

## Common Mistakes
- Using local-path on multi-node clusters (data stuck on one node)
- Not installing open-iscsi before Longhorn (volumes fail to attach)
- Setting replica count higher than node count (volumes stay degraded)
- Using `reclaimPolicy: Delete` for production databases
- Not monitoring storage capacity (PVCs fail when disk is full)
