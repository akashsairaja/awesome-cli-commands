---
id: trivy-container-scanning
stackId: trivy
type: skill
name: Container Image Vulnerability Scanning
description: >-
  Scan container images for OS and application vulnerabilities with Trivy —
  severity filtering, SBOM generation, VEX for false positive management,
  registry authentication, CI gating, and supply chain security patterns.
difficulty: advanced
tags:
  - trivy
  - container
  - image
  - vulnerability
  - scanning
  - security
  - deployment
  - docker
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Container Image Vulnerability Scanning skill?"
    answer: >-
      Scan container images before pushing to registries to catch known
      vulnerabilities in OS packages and application dependencies. Covers
      severity filtering, SBOM generation and scanning, VEX for managing
      false positives, private registry auth, and CI pipeline gating patterns.
  - question: "What tools and setup does Container Image Vulnerability Scanning require?"
    answer: >-
      Requires Trivy CLI installed (brew, apt, or Docker). No additional
      setup for public images. For private registries, configure Docker
      credentials or registry-specific auth. Trivy downloads its vulnerability
      database on first run (~30MB).
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# Container Image Vulnerability Scanning

## Overview

Trivy scans container images for known vulnerabilities in OS packages (apt, apk, yum, dnf) and application dependencies (npm, pip, gem, go modules, Maven, Cargo). It checks both the base image layers and your application's dependency tree in a single scan. Run Trivy before pushing to registries to catch vulnerabilities before they reach production.

Trivy's vulnerability database updates automatically and covers NVD, vendor advisories (Red Hat, Ubuntu, Debian, Alpine, etc.), and language-specific advisory databases (GitHub Advisories, RustSec, npm audit).

## Basic Image Scanning

```bash
# Scan a public image
trivy image nginx:1.25

# Scan a locally built image
trivy image myapp:latest

# Scan from a private registry
trivy image ghcr.io/myorg/myapp:v2.0.0

# Scan an image by digest (most precise)
trivy image myapp@sha256:abc123...
```

## Severity Filtering

Not all vulnerabilities are equal. Filter by severity to focus on what matters:

```bash
# Only show CRITICAL and HIGH vulnerabilities
trivy image --severity CRITICAL,HIGH nginx:1.25

# Fail CI only on CRITICAL (strictest gate)
trivy image --exit-code 1 --severity CRITICAL myapp:latest

# Fail on CRITICAL and HIGH (recommended for production)
trivy image --exit-code 1 --severity CRITICAL,HIGH myapp:latest
```

Severity levels: CRITICAL, HIGH, MEDIUM, LOW, UNKNOWN. Use `CRITICAL,HIGH` as your CI gate — it catches exploitable issues without blocking builds on every low-severity finding.

## Vulnerability Types

```bash
# Scan OS packages only
trivy image --vuln-type os nginx:1.25

# Scan application dependencies only
trivy image --vuln-type library myapp:latest

# Scan both (default behavior, but explicit is better in CI)
trivy image --vuln-type os,library myapp:latest

# Only show vulnerabilities with known fixes
trivy image --ignore-unfixed myapp:latest
```

The `--ignore-unfixed` flag is useful for reducing noise — it shows only vulnerabilities that have a patched version available. This helps prioritize actionable findings over vulnerabilities you cannot fix yet.

## Output Formats

```bash
# Table format (default, human-readable)
trivy image nginx:1.25

# JSON for programmatic processing
trivy image --format json --output results.json nginx:1.25

# SARIF for GitHub Security tab
trivy image --format sarif --output trivy.sarif nginx:1.25

# CycloneDX SBOM format
trivy image --format cyclonedx --output sbom.json nginx:1.25

# SPDX SBOM format
trivy image --format spdx-json --output sbom.spdx.json nginx:1.25

# Custom template (HTML report)
trivy image --format template \
  --template "@contrib/html.tpl" \
  --output report.html nginx:1.25
```

## SBOM Generation and Scanning

Software Bill of Materials (SBOM) is a complete inventory of every package in an image. Generate an SBOM once, then scan it repeatedly as new vulnerabilities are disclosed — without re-pulling the image:

```bash
# Generate CycloneDX SBOM
trivy image --format cyclonedx --output sbom.cdx.json myapp:latest

# Later: scan the SBOM for new vulnerabilities
trivy sbom sbom.cdx.json

# Scan with severity filter
trivy sbom --severity CRITICAL,HIGH sbom.cdx.json

# Generate SPDX SBOM
trivy image --format spdx-json --output sbom.spdx.json myapp:latest
```

SBOM scanning is significantly faster than image scanning because Trivy skips the image pull and layer analysis. Store SBOMs as build artifacts and scan them on a schedule to catch newly disclosed CVEs in already-deployed images.

## VEX: Managing False Positives

Vulnerability Exploitability Exchange (VEX) lets you document that specific CVEs do not affect your image — even though the vulnerable package is present:

```bash
# Create a VEX document (.vex.json)
cat > .vex.cdx.json << 'EOF'
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "vulnerabilities": [
    {
      "id": "CVE-2023-44487",
      "analysis": {
        "state": "not_affected",
        "justification": "code_not_reachable",
        "detail": "HTTP/2 rapid reset — our nginx config disables HTTP/2"
      }
    }
  ]
}
EOF

# Scan with VEX applied (suppresses documented non-issues)
trivy image --vex .vex.cdx.json myapp:latest

# Auto-discover VEX attestations from OCI registry
trivy image --vex oci myapp:latest
```

VEX is more rigorous than `.trivyignore` — it documents why a CVE does not affect you, not just that you want to ignore it. Use VEX for permanent suppressions and `.trivyignore` for temporary accepted risks.

## Ignore Rules

```bash
# Create .trivyignore for accepted risks
cat > .trivyignore << 'EOF'
# CVE-2023-44487: Not exploitable — HTTP/2 disabled in our config
# Accepted by: security-team on 2026-01-15, expires 2026-07-15
CVE-2023-44487

# CVE-2023-39325: No fix available, mitigated by WAF rate limiting
CVE-2023-39325
EOF

# Scan with ignore file
trivy image --ignorefile .trivyignore myapp:latest
```

## Private Registry Authentication

```bash
# Docker Hub (uses ~/.docker/config.json)
docker login
trivy image myorg/myapp:latest

# AWS ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
trivy image 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:latest

# GCR / Artifact Registry
gcloud auth configure-docker
trivy image gcr.io/myproject/myapp:latest

# GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
trivy image ghcr.io/myorg/myapp:latest
```

Trivy reads Docker's credential store automatically. If you can `docker pull` an image, Trivy can scan it.

## CI Pipeline Integration

### Build-Scan-Push Pattern

```bash
#!/bin/bash
# build-scan-push.sh

IMAGE="myorg/myapp:$(git rev-parse --short HEAD)"

# Build the image
docker build -t "$IMAGE" .

# Scan — fail on CRITICAL/HIGH
if ! trivy image --exit-code 1 --severity CRITICAL,HIGH "$IMAGE"; then
  echo "Security scan failed. Fix vulnerabilities before pushing."
  exit 1
fi

# Generate SBOM for audit trail
trivy image --format cyclonedx --output "sbom-$(date +%Y%m%d).json" "$IMAGE"

# Push only if scan passes
docker push "$IMAGE"
```

### GitHub Actions

```yaml
- name: Build image
  run: docker build -t myapp:${{ github.sha }} .

- name: Trivy scan
  run: |
    trivy image --format sarif --output trivy.sarif \
      --exit-code 1 --severity CRITICAL,HIGH \
      myapp:${{ github.sha }}

- name: Upload SARIF
  if: always()
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: trivy.sarif

- name: Generate SBOM
  if: success()
  run: |
    trivy image --format cyclonedx \
      --output sbom.json myapp:${{ github.sha }}

- name: Upload SBOM
  if: success()
  uses: actions/upload-artifact@v4
  with:
    name: sbom
    path: sbom.json
```

### Scheduled SBOM Rescanning

```yaml
# .github/workflows/sbom-rescan.yml
name: Rescan SBOMs
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM

jobs:
  rescan:
    runs-on: ubuntu-latest
    steps:
      - name: Download latest SBOM
        uses: actions/download-artifact@v4
        with:
          name: sbom

      - name: Rescan for new CVEs
        run: |
          trivy sbom --exit-code 1 --severity CRITICAL sbom.json
```

## Base Image Selection

Your choice of base image has the biggest impact on vulnerability count:

```bash
# Compare vulnerability counts across base images
trivy image node:20              # ~200-400 vulns (Debian full)
trivy image node:20-slim         # ~50-100 vulns (Debian slim)
trivy image node:20-alpine       # ~5-20 vulns (Alpine)
trivy image gcr.io/distroless/nodejs20  # ~0-5 vulns (Distroless)
```

Alpine and Distroless images have dramatically fewer vulnerabilities because they include fewer packages. If your application does not need a full Linux userland, these images reduce both attack surface and scan noise.

## Database Management

```bash
# Update the vulnerability database manually
trivy image --download-db-only

# Scan without updating (offline/air-gapped)
trivy image --skip-db-update myapp:latest

# Use a specific database mirror
trivy image --db-repository ghcr.io/aquasecurity/trivy-db myapp:latest

# Clear cached database
trivy clean --vuln-db
```

In CI, consider running `--download-db-only` as a separate step to cache the database between builds, reducing scan time.

## Best Practices

- Scan images in CI before pushing to registries — never push unscanned images.
- Use `--exit-code 1 --severity CRITICAL,HIGH` as your CI gate. Start strict; relax selectively with documented exceptions.
- Generate SBOMs as build artifacts and rescan them daily to catch newly disclosed CVEs.
- Use `--ignore-unfixed` in development to focus on actionable vulnerabilities.
- Pin base image digests (`FROM node:20-alpine@sha256:abc...`) for reproducible builds and scans.
- Use VEX for permanent false positive documentation. Use `.trivyignore` for temporary accepted risks with expiration dates.
- Prefer Alpine or Distroless base images to minimize the vulnerability surface.
- Upload SARIF output to GitHub Security tab for centralized vulnerability tracking.

## Common Pitfalls

- Scanning only the final stage of a multi-stage build — intermediate stages can leak vulnerable packages into the final image if `COPY --from` pulls more than intended.
- Not updating Trivy's database — stale databases miss recently disclosed CVEs. In CI, download the DB as a cached step.
- Ignoring vulnerabilities without documented justification — `.trivyignore` without comments is a silent security hole.
- Using `--severity LOW` in CI gates — too noisy, blocks every build. Gate on CRITICAL,HIGH and track MEDIUM in dashboards.
- Scanning only at build time — newly disclosed CVEs affect already-deployed images. Rescan SBOMs on a schedule.
- Using `:latest` tags — scan results are not reproducible. Pin versions or digests.
