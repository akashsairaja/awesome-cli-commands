---
id: helm-hooks-lifecycle
stackId: helm
type: skill
name: >-
  Helm Hooks & Release Lifecycle
description: >-
  Use Helm hooks for database migrations, pre-install checks, post-upgrade
  notifications, and cleanup tasks — control execution order and handle hook
  failures gracefully.
difficulty: intermediate
tags:
  - helm
  - hooks
  - release
  - lifecycle
  - deployment
  - migration
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Helm Hooks & Release Lifecycle skill?"
    answer: >-
      Use Helm hooks for database migrations, pre-install checks, post-upgrade
      notifications, and cleanup tasks — control execution order and handle
      hook failures gracefully. It includes practical examples for Kubernetes
      packaging development.
  - question: "What tools and setup does Helm Hooks & Release Lifecycle require?"
    answer: >-
      Requires npm/yarn/pnpm, Helm CLI installed. Works with Helm projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Helm Hooks & Release Lifecycle

## Overview
Helm hooks are resources annotated to run at specific points in the release lifecycle — before install, after upgrade, before delete, etc. Common uses include database migrations, health checks, notifications, and cleanup.

## Why This Matters
- **Database migrations** — run before app upgrade, rollback on failure
- **Validation** — check prerequisites before installing
- **Cleanup** — remove temporary resources after uninstall
- **Notifications** — alert teams after successful deployments

## Hook Annotations
```yaml
annotations:
  "helm.sh/hook": pre-upgrade         # When to run
  "helm.sh/hook-weight": "-5"         # Execution order (lower = first)
  "helm.sh/hook-delete-policy": hook-succeeded  # Cleanup policy
```

## Available Hooks
| Hook | When |
|------|------|
| pre-install | Before resources are created |
| post-install | After all resources are created |
| pre-upgrade | Before resources are updated |
| post-upgrade | After all resources are updated |
| pre-delete | Before resources are deleted |
| post-delete | After all resources are deleted |
| pre-rollback | Before rollback |
| post-rollback | After rollback |
| test | When `helm test` is run |

## Database Migration Hook
```yaml
# templates/migration-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "myapp.fullname" . }}-migrate
  annotations:
    "helm.sh/hook": pre-upgrade,pre-install
    "helm.sh/hook-weight": "-1"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  backoffLimit: 3
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          command: ["npm", "run", "db:migrate"]
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: {{ include "myapp.fullname" . }}-db
                  key: url
```

## Pre-Install Validation Hook
```yaml
# templates/check-prerequisites.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "myapp.fullname" . }}-check
  annotations:
    "helm.sh/hook": pre-install
    "helm.sh/hook-weight": "-10"
    "helm.sh/hook-delete-policy": hook-succeeded,hook-failed
spec:
  backoffLimit: 0
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: check
          image: bitnami/kubectl:latest
          command:
            - /bin/sh
            - -c
            - |
              echo "Checking prerequisites..."
              kubectl get secret db-credentials -n {{ .Release.Namespace }} || \
                (echo "ERROR: db-credentials secret not found" && exit 1)
              echo "All prerequisites met."
```

## Delete Policies
| Policy | Behavior |
|--------|----------|
| before-hook-creation | Delete previous hook before creating new one |
| hook-succeeded | Delete hook after successful completion |
| hook-failed | Delete hook after failure |

## Best Practices
- Use `hook-weight` to control execution order (migrations before app start)
- Set `hook-delete-policy: before-hook-creation,hook-succeeded` for migrations
- Use `backoffLimit: 3` for retryable operations, `0` for validation checks
- Set `restartPolicy: Never` on hook Jobs
- Use `--atomic` with `helm upgrade` to auto-rollback if hooks fail
- Keep hooks fast — long-running hooks block the release

## Common Mistakes
- Hooks without delete policies (old Jobs accumulate)
- Missing backoffLimit (infinite retries on failure)
- Hooks that depend on resources created in the same release
- Not using hook-weight (random execution order)
