---
id: flux-notification-setup
stackId: flux
type: skill
name: Configure Flux Notifications and Alerts
description: >-
  Set up Flux notification controller to send alerts to Slack, Teams, Discord,
  and webhooks when reconciliation events occur — deployments, failures, and
  drift detection.
difficulty: intermediate
tags:
  - flux
  - configure
  - notifications
  - alerts
  - deployment
  - machine-learning
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Configure Flux Notifications and Alerts skill?"
    answer: >-
      Set up Flux notification controller to send alerts to Slack, Teams,
      Discord, and webhooks when reconciliation events occur — deployments,
      failures, and drift detection. This skill provides a structured workflow
      for development tasks.
  - question: "What tools and setup does Configure Flux Notifications and Alerts require?"
    answer: >-
      Works with standard flux tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Configure Flux Notifications and Alerts

## Overview
The Flux notification controller sends alerts when reconciliation events occur — successful deployments, failures, health check violations, and drift corrections. Connect to Slack, Microsoft Teams, Discord, PagerDuty, or generic webhooks for real-time GitOps observability.

## Why This Matters
- **Immediate feedback** — know when deployments succeed or fail
- **Incident response** — alert on-call when reconciliation breaks
- **Audit visibility** — team-wide awareness of cluster changes
- **Drift detection** — catch manual changes that conflict with Git state

## How It Works

### Step 1: Create a Notification Provider
```yaml
# notifications/slack-provider.yaml
apiVersion: notification.toolkit.fluxcd.io/v1beta3
kind: Provider
metadata:
  name: slack
  namespace: flux-system
spec:
  type: slack
  channel: gitops-alerts
  secretRef:
    name: slack-webhook-url
---
apiVersion: v1
kind: Secret
metadata:
  name: slack-webhook-url
  namespace: flux-system
stringData:
  address: https://hooks.slack.com/services/T00/B00/XXXX
```

### Step 2: Create Alerts for Events
```yaml
# notifications/alerts.yaml
apiVersion: notification.toolkit.fluxcd.io/v1beta3
kind: Alert
metadata:
  name: on-call-alerts
  namespace: flux-system
spec:
  providerRef:
    name: slack
  eventSeverity: error
  eventSources:
    - kind: Kustomization
      name: "*"
    - kind: HelmRelease
      name: "*"
---
apiVersion: notification.toolkit.fluxcd.io/v1beta3
kind: Alert
metadata:
  name: deployment-notifications
  namespace: flux-system
spec:
  providerRef:
    name: slack
  eventSeverity: info
  eventSources:
    - kind: Kustomization
      name: "*"
    - kind: HelmRelease
      name: "*"
  exclusionList:
    - ".*no changes.*"
```

### Step 3: Set Up Webhook Receivers for External Triggers
```yaml
# notifications/receiver.yaml
apiVersion: notification.toolkit.fluxcd.io/v1
kind: Receiver
metadata:
  name: github-webhook
  namespace: flux-system
spec:
  type: github
  events:
    - "ping"
    - "push"
  secretRef:
    name: webhook-token
  resources:
    - kind: GitRepository
      name: flux-system
```

### Step 4: Verify Notification Delivery
```bash
# Check provider status
flux get alert-providers

# Check alert status
flux get alerts

# Trigger a reconciliation to test
flux reconcile kustomization flux-system --with-source

# View notification controller logs
flux logs --kind=Kustomization --level=info
```

## Best Practices
- Separate info alerts (all events) from error alerts (failures only)
- Use `exclusionList` to filter noisy "no changes" events
- Encrypt webhook secrets with SOPS before committing to Git
- Set up both Slack notifications and PagerDuty for critical alerts
- Use Receiver webhooks to trigger immediate reconciliation on push

## Common Mistakes
- Storing webhook URLs in plain text in Git (use SOPS or Sealed Secrets)
- Not filtering "no changes" events (creates alert fatigue)
- Missing error-severity alerts (only notifying on success)
- Forgetting to create the Provider Secret in the correct namespace
