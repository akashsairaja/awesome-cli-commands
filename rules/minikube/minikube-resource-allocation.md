---
id: minikube-resource-allocation
stackId: minikube
type: rule
name: Minikube Resource Allocation Standards
description: >-
  Enforce minimum and maximum resource allocation for Minikube clusters — CPU,
  memory, and disk settings to prevent under-provisioning and host resource
  exhaustion.
difficulty: beginner
globs:
  - '**/Makefile'
  - '**/scripts/dev-setup*'
  - '**/.minikube/**'
tags:
  - resource-allocation
  - minikube-config
  - cpu-memory
  - development-setup
  - performance
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: How much memory should I allocate to minikube?
    answer: >-
      Minimum 4GB for basic testing. 8GB for microservices development with
      multiple pods. 12GB+ if running databases or data-heavy workloads. Never
      allocate more than 75% of your host's total RAM to avoid system
      instability.
  - question: How do I set default minikube resource allocation?
    answer: >-
      Use 'minikube config set memory 8192', 'minikube config set cpus 4', and
      'minikube config set disk-size 40g'. These defaults apply to all future
      'minikube start' commands. Share these settings in your project's setup
      documentation.
relatedItems:
  - minikube-profile-standards
  - minikube-dev-environment
  - minikube-multi-node-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Minikube Resource Allocation Standards

## Rule
All minikube clusters MUST have explicit resource allocation appropriate for the workload. Never use defaults for anything beyond basic testing.

## Format
```bash
minikube start \
  --cpus=<2-8> \
  --memory=<4096-16384> \
  --disk-size=<20g-100g> \
  --driver=<docker|hyperkit|hyperv>
```

## Requirements
1. **Minimum allocation** — 2 CPUs, 4GB RAM, 20GB disk for single-node
2. **Multi-node** — multiply minimums by node count
3. **Host headroom** — never allocate more than 75% of host resources
4. **Disk sizing** — allocate enough for images and persistent volumes
5. **Persistent config** — use `minikube config set` for team defaults

## Recommended Settings

| Workload | CPUs | Memory | Disk |
|----------|------|--------|------|
| Basic testing | 2 | 4GB | 20GB |
| Microservices dev | 4 | 8GB | 40GB |
| Data-heavy (DBs) | 4 | 12GB | 60GB |
| Multi-node (per node) | 2 | 4GB | 20GB |
| CI runner | 2 | 4GB | 30GB |

## Examples

### Good
```bash
# Set defaults for the team
minikube config set cpus 4
minikube config set memory 8192
minikube config set disk-size 40g
minikube config set driver docker

# Start with explicit allocation
minikube start --cpus=4 --memory=8192 --disk-size=40g
```

### Bad
```bash
# Defaults: 2 CPUs, 2GB RAM — too small for real workloads
minikube start

# Over-allocating on a 16GB laptop
minikube start --cpus=8 --memory=14336  # Leaves nothing for the host
```

## Enforcement
Document recommended minikube config in project README or Makefile. Use `minikube config set` commands in project setup scripts.
