---
id: grafana-provisioning-workflow
stackId: grafana
type: skill
name: Implement Grafana Dashboard-as-Code
description: >-
  Set up Grafana provisioning — dashboard JSON files, data source configuration,
  alert rules as code, and automated deployment for consistent monitoring across
  environments.
difficulty: advanced
tags:
  - grafana
  - provisioning
  - infrastructure-as-code
  - dashboards
  - automation
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
prerequisites:
  - Grafana instance with admin access
  - File system or API access to Grafana
faq:
  - question: What is Grafana dashboard provisioning?
    answer: >-
      Provisioning lets you manage Grafana dashboards, data sources, and alert
      rules as files. Place JSON dashboard files and YAML configuration in the
      provisioning directory, and Grafana loads them automatically on startup.
      This enables version control and consistent deployment across
      environments.
  - question: Should I use file provisioning or the Grafana API?
    answer: >-
      Use file provisioning for infrastructure-as-code (dashboards bundled with
      Grafana deployment). Use the HTTP API for CI/CD pipelines that deploy
      dashboards independently. Both approaches enable version control — file
      provisioning is simpler, API is more flexible for dynamic environments.
relatedItems:
  - grafana-dashboard-architect
  - grafana-alerting-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Implement Grafana Dashboard-as-Code

## Overview
Grafana provisioning lets you manage dashboards, data sources, and alert rules as code. Store configuration in Git, deploy consistently across environments, and review monitoring changes in pull requests.

## Why This Matters
- **Version control** — track every dashboard change in Git
- **Consistency** — same dashboards across dev, staging, production
- **Review** — monitoring changes go through PR review
- **Recovery** — rebuild Grafana from scratch from config files

## How It Works

### Step 1: Configure Provisioning Directory
```yaml
# /etc/grafana/provisioning/dashboards/dashboards.yaml
apiVersion: 1
providers:
  - name: 'default'
    orgId: 1
    folder: 'Provisioned'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: false
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: true
```

### Step 2: Provision Data Sources
```yaml
# /etc/grafana/provisioning/datasources/datasources.yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    jsonData:
      httpMethod: POST
      timeInterval: '15s'

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    jsonData:
      maxLines: 1000
```

### Step 3: Create Dashboard JSON
```json
{
  "dashboard": {
    "title": "API Service Overview",
    "tags": ["api", "production"],
    "timezone": "browser",
    "templating": {
      "list": [
        {
          "name": "environment",
          "type": "query",
          "query": "label_values(http_requests_total, environment)",
          "current": { "text": "production", "value": "production" }
        }
      ]
    },
    "panels": [
      {
        "title": "Request Rate",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 },
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{environment="$environment"}[5m]))",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "title": "Error Rate %",
        "type": "stat",
        "gridPos": { "h": 8, "w": 6, "x": 12, "y": 0 },
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status_code=~"5..",environment="$environment"}[5m])) / sum(rate(http_requests_total{environment="$environment"}[5m])) * 100"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "steps": [
                { "color": "green", "value": null },
                { "color": "yellow", "value": 1 },
                { "color": "red", "value": 5 }
              ]
            },
            "unit": "percent"
          }
        }
      }
    ]
  }
}
```

### Step 4: Deploy with CI/CD
```yaml
# GitHub Actions deployment
- name: Deploy Grafana dashboards
  run: |
    rsync -av dashboards/ grafana-server:/var/lib/grafana/dashboards/
    # Or use Grafana HTTP API
    for file in dashboards/*.json; do
      curl -X POST http://grafana:3000/api/dashboards/db \
        -H "Authorization: Bearer $GRAFANA_API_KEY" \
        -H "Content-Type: application/json" \
        -d @"$file"
    done
```

## Best Practices
- Use file provisioning for environments, API for CI/CD
- Organize dashboards by folder matching team/service structure
- Include template variables for environment/namespace filtering
- Set `allowUiUpdates: false` to prevent manual changes
- Export existing dashboards with the Grafana API before converting to provisioned
- Use Grafonnet or grafana-foundation-sdk for programmatic dashboard generation

## Common Mistakes
- Editing provisioned dashboards in UI (changes are overwritten)
- Not using template variables (hardcoded environment names)
- Missing data source UIDs in dashboard JSON (breaks on different Grafana instances)
- No folder structure (all dashboards in one flat list)
- Not testing dashboards with sample data before deploying
