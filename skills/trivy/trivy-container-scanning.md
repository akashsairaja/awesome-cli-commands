---
id: trivy-container-scanning
stackId: trivy
type: skill
name: Container Image Vulnerability Scanning
description: >-
  Scan container images for OS and application vulnerabilities with Trivy —
  configure severity filters, output formats, and registry authentication for
  comprehensive image security.
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
      Scan container images for OS and application vulnerabilities with Trivy
      — configure severity filters, output formats, and registry
      authentication for comprehensive image security. This skill provides a
      structured workflow for container scanning, filesystem scanning, IaC
      scanning, and SBOM generation.
  - question: "What tools and setup does Container Image Vulnerability Scanning require?"
    answer: >-
      Requires npm/yarn/pnpm, Docker, pip/poetry installed. Works with Trivy
      projects. No additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Container Image Vulnerability Scanning

## Overview
Trivy scans container images for known vulnerabilities in OS packages (apt, apk, yum) and application dependencies (npm, pip, gem, go modules). Scan before pushing to registries to catch vulnerabilities before deployment.

## How It Works

### Step 1: Basic Image Scan
```bash
# Scan a local or remote image
trivy image nginx:1.25
trivy image myapp:latest
trivy image ghcr.io/org/app:v2.0.0

# Scan with severity filter
trivy image --severity CRITICAL,HIGH nginx:1.25

# Scan and fail on vulnerabilities (for CI)
trivy image --exit-code 1 --severity CRITICAL nginx:1.25
```

### Step 2: Output Formats
```bash
# Table format (default, human-readable)
trivy image --format table nginx:1.25

# JSON for programmatic processing
trivy image --format json --output results.json nginx:1.25

# SARIF for GitHub Security tab
trivy image --format sarif --output trivy.sarif nginx:1.25

# Template-based output
trivy image --format template --template "@html.tpl" --output report.html nginx:1.25
```

### Step 3: Scan with Ignore Rules
```bash
# Create .trivyignore
cat > .trivyignore << 'EOF'
# False positive — not exploitable in our context
CVE-2023-44487

# Accepted risk — no fix available, mitigated by WAF
CVE-2023-39325
EOF

trivy image --ignorefile .trivyignore myapp:latest
```

### Step 4: Scan During Docker Build
```dockerfile
# Multi-stage build with Trivy scan
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

FROM node:20-alpine AS production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

```bash
# Build and scan
docker build -t myapp:latest .
trivy image --exit-code 1 --severity CRITICAL,HIGH myapp:latest
# Only push if scan passes
docker push myapp:latest
```

## Best Practices
- Scan images in CI before pushing to registries
- Use `--exit-code 1` with severity filters for automated gates
- Scan with `--vuln-type os,library` to cover both OS and app dependencies
- Use Alpine or Distroless base images to minimize vulnerability surface
- Pin base image digests for reproducible builds
- Generate SARIF output for GitHub Security tab integration

## Common Mistakes
- Scanning only the final image (multi-stage build artifacts may leak)
- Not updating Trivy's vulnerability database regularly
- Ignoring vulnerabilities without documented justification
- Using `--severity LOW` in CI gates (too noisy, blocks everything)
