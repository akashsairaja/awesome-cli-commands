---
id: trivy-scan-before-push
stackId: trivy
type: rule
name: Scan Before Push Policy
description: >-
  Mandate Trivy scanning of all container images before pushing to registries —
  no image enters production without passing vulnerability and misconfiguration
  checks.
difficulty: beginner
globs:
  - '**/Dockerfile*'
  - '**/.trivyignore'
  - '**/.github/workflows/**'
  - '**/docker-compose*'
tags:
  - scan-before-push
  - container-security
  - policy
  - ci-gate
  - trivy
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
  - question: Why must images be scanned before pushing to registries?
    answer: >-
      Scanning before push prevents vulnerable images from entering registries
      where they could be deployed. Once an image is in a registry, any
      automated deployment could pull and run it. Scanning before push is the
      last gate before a vulnerability reaches production.
  - question: How do I handle Trivy findings that block a release?
    answer: >-
      For CRITICAL: fix immediately by updating the base image or dependency.
      For HIGH with no fix available: add to .trivyignore with documented
      justification and a review date, then escalate to the security team. Never
      permanently ignore without a review process.
relatedItems:
  - trivy-ignore-policy
  - trivy-base-image-standards
  - trivy-container-scanning
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Scan Before Push Policy

## Rule
Every container image MUST pass a Trivy vulnerability scan before being pushed to any container registry. Images with unresolved CRITICAL vulnerabilities are blocked.

## Enforcement
```bash
# Build → Scan → Push workflow
docker build -t myapp:v1.2.3 .
trivy image --exit-code 1 --severity CRITICAL,HIGH myapp:v1.2.3
docker push registry.example.com/myapp:v1.2.3  # Only if scan passes
```

## CI/CD Gate
```yaml
- name: Build image
  run: docker build -t app:${{ github.sha }} .

- name: Scan image (MUST pass)
  run: trivy image --exit-code 1 --severity CRITICAL,HIGH app:${{ github.sha }}

- name: Push image (only if scan passed)
  run: docker push registry.example.com/app:${{ github.sha }}
```

## Severity Policies
| Severity | Action | Timeline |
|----------|--------|----------|
| CRITICAL | Block push, fix immediately | Same day |
| HIGH | Block push, fix within sprint | 1 week |
| MEDIUM | Warn, track in backlog | 30 days |
| LOW | Log, review quarterly | 90 days |

## Ignore Rules (Exceptions)
```
# .trivyignore — document every exception
# CVE-2023-44487: HTTP/2 rapid reset — mitigated by WAF rules
# Review date: 2026-06-01
CVE-2023-44487
```

## Anti-Patterns
- Pushing images without scanning
- Scanning after push (too late — image is already deployable)
- Disabling exit-code to "get the build green"
- Permanent ignore rules without review dates
- Scanning only in production pipeline (scan in development too)
