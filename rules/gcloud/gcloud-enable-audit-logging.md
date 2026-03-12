---
id: gcloud-enable-audit-logging
stackId: gcloud
type: rule
name: Enable Cloud Audit Logging
description: >-
  Enable Cloud Audit Logs on all GCP projects for admin activity, data access,
  and system events — required for security monitoring, incident response, and
  compliance.
difficulty: beginner
globs:
  - '**/*.tf'
  - '**/*.yaml'
  - '**/*.yml'
  - '**/gcloud/**'
  - '**/logging/**'
tags:
  - audit-logging
  - security-monitoring
  - compliance
  - cloud-logging
  - incident-response
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
  - question: What are GCP Cloud Audit Logs?
    answer: >-
      Cloud Audit Logs record who did what, where, and when in your GCP
      environment. Admin Activity logs (always on) track resource changes. Data
      Access logs (off by default) track data read/write operations. They are
      essential for security monitoring, incident response, and compliance
      (SOC2, HIPAA, PCI-DSS).
  - question: Should I enable Data Access audit logs on all services?
    answer: >-
      Enable Data Access logs on sensitive services: IAM, Cloud Storage,
      BigQuery, Cloud SQL, and KMS. Enabling on all services can generate high
      log volume and cost. Start with sensitive services, then expand based on
      compliance requirements and security monitoring needs.
relatedItems:
  - gcloud-no-service-account-keys
  - gcloud-project-labels
  - gcloud-iam-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Enable Cloud Audit Logging

## Rule
All GCP projects MUST have Admin Activity audit logs enabled (default). Data Access audit logs MUST be enabled for sensitive services (IAM, Cloud Storage, BigQuery, Cloud SQL).

## Audit Log Types
| Log Type | Default | Content |
|----------|---------|---------|
| Admin Activity | Always on | Resource creation, deletion, modification |
| Data Access | Off by default | Read/list operations on data |
| System Event | Always on | Google-triggered system actions |
| Policy Denied | Always on | Access denied by IAM or Org Policy |

## Enable Data Access Logs
```bash
# Get current audit config
gcloud projects get-iam-policy myproject --format=json > policy.json
```

```json
{
  "auditConfigs": [
    {
      "service": "allServices",
      "auditLogConfigs": [
        { "logType": "ADMIN_READ" },
        { "logType": "DATA_READ" },
        { "logType": "DATA_WRITE" }
      ]
    }
  ]
}
```

```bash
# Apply the policy
gcloud projects set-iam-policy myproject policy.json
```

## Terraform Configuration
```hcl
resource "google_project_iam_audit_config" "all_services" {
  project = var.project_id
  service = "allServices"

  audit_log_config {
    log_type = "ADMIN_READ"
  }
  audit_log_config {
    log_type = "DATA_READ"
  }
  audit_log_config {
    log_type = "DATA_WRITE"
  }
}
```

## Log Routing to BigQuery
```bash
# Create log sink for long-term analysis
gcloud logging sinks create audit-logs-bq \
  bigquery.googleapis.com/projects/myproject/datasets/audit_logs \
  --log-filter='logName:"cloudaudit.googleapis.com"'
```

## Key Queries
```bash
# View recent admin activity
gcloud logging read 'logName:"cloudaudit.googleapis.com/activity"' \
  --limit=50 --format=json

# Service account key creation events
gcloud logging read 'protoPayload.methodName="google.iam.admin.v1.CreateServiceAccountKey"' \
  --limit=10

# IAM policy changes
gcloud logging read 'protoPayload.methodName="SetIamPolicy"' \
  --limit=10
```

## Enforcement
- Verify audit config with: `gcloud projects get-iam-policy PROJECT`
- Organization Policy to require audit logging
- Route audit logs to a central project for security team access
- Retain audit logs for minimum 1 year (compliance requirement)
