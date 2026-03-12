---
id: k3s-backup-standards
stackId: k3s
type: rule
name: K3s Backup and Recovery Standards
description: >-
  Enforce backup standards for K3s clusters — etcd snapshot scheduling,
  retention policies, off-site storage, and documented recovery procedures.
difficulty: intermediate
globs:
  - '**/k3s/**'
  - '**/backup/**'
  - '**/disaster-recovery/**'
tags:
  - k3s-backup
  - etcd-snapshots
  - disaster-recovery
  - data-protection
  - retention-policy
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: How do I back up a K3s cluster?
    answer: >-
      K3s supports etcd snapshots via startup flags:
      --etcd-snapshot-schedule-cron for scheduling, --etcd-snapshot-retention
      for how many to keep, and --etcd-s3 flags for off-site S3 storage. Take
      manual snapshots with 'k3s etcd-snapshot save' before upgrades or major
      changes.
  - question: How do I restore a K3s cluster from a backup?
    answer: >-
      Stop K3s, run 'k3s server --cluster-reset
      --cluster-reset-restore-path=/path/to/snapshot' to restore etcd from the
      snapshot, then restart K3s. For HA clusters, restore on one server node
      first, then rejoin the others.
relatedItems:
  - k3s-installation-standards
  - k3s-ha-cluster-setup
  - k3s-upgrade-strategy
version: 1.0.0
lastUpdated: '2026-03-11'
---

# K3s Backup and Recovery Standards

## Rule
All production K3s clusters MUST have automated etcd snapshots with off-site storage and documented recovery procedures.

## Format
```bash
# Server startup flags for automated backups
--etcd-snapshot-schedule-cron="0 */6 * * *"
--etcd-snapshot-retention=10
--etcd-snapshot-dir=/var/lib/rancher/k3s/server/db/snapshots
```

## Requirements
1. **Scheduled snapshots** — minimum every 6 hours for production
2. **Retention** — keep at least 10 snapshots (2.5 days at 6h intervals)
3. **Off-site copies** — sync snapshots to S3, GCS, or remote storage
4. **Pre-upgrade snapshots** — always snapshot before K3s version upgrades
5. **Recovery runbook** — documented, tested procedure for restoration
6. **Regular testing** — practice recovery quarterly

## Examples

### Good
```bash
# K3s server with backup configuration
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --etcd-snapshot-schedule-cron="0 */4 * * *" \
  --etcd-snapshot-retention=20 \
  --etcd-s3 \
  --etcd-s3-endpoint=s3.amazonaws.com \
  --etcd-s3-bucket=k3s-backups \
  --etcd-s3-region=us-east-1 \
  --etcd-s3-access-key=AKIA... \
  --etcd-s3-secret-key=...

# Manual pre-upgrade snapshot
sudo k3s etcd-snapshot save --name pre-upgrade-$(date +%Y%m%d)

# Recovery procedure
sudo systemctl stop k3s
sudo k3s server --cluster-reset \
  --cluster-reset-restore-path=/var/lib/rancher/k3s/server/db/snapshots/<snapshot>
sudo systemctl start k3s
```

### Bad
```bash
# No backup configuration — default K3s has no scheduled snapshots
curl -sfL https://get.k3s.io | sh -
# No off-site copies — snapshots only on local disk
# No documented recovery procedure
```

## Enforcement
Include backup configuration in K3s installation runbooks. Monitor snapshot age with alerting when the latest snapshot is older than expected. Run recovery drills quarterly.
