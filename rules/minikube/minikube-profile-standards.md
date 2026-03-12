---
id: minikube-profile-standards
stackId: minikube
type: rule
name: Minikube Profile Management Standards
description: >-
  Enforce minikube profile usage for project isolation — one profile per
  project, naming conventions, cleanup policies, and context switching best
  practices.
difficulty: beginner
globs:
  - '**/Makefile'
  - '**/scripts/dev-setup*'
  - '**/README*'
tags:
  - minikube-profiles
  - project-isolation
  - context-switching
  - cleanup
  - development-workflow
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: What are minikube profiles and why should I use them?
    answer: >-
      Minikube profiles are isolated cluster instances, each with their own
      configuration, addons, and Kubernetes context. Use one profile per project
      to prevent resource conflicts, namespace collisions, and configuration
      bleed between unrelated projects.
  - question: How do I switch between minikube profiles?
    answer: >-
      Use 'minikube profile <name>' to switch the active profile and kubectl
      context. 'minikube profile list' shows all profiles. Each profile has its
      own set of nodes, addons, and Kubernetes resources.
relatedItems:
  - minikube-resource-allocation
  - minikube-dev-environment
  - minikube-addon-management
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Minikube Profile Management Standards

## Rule
Each project MUST use a dedicated minikube profile. Never share a single minikube cluster across unrelated projects.

## Format
```bash
minikube start --profile=<project-name> --cpus=<n> --memory=<n>
```

## Requirements
1. **One profile per project** — isolates namespaces, resources, and addons
2. **Naming convention** — use project name as profile: `--profile=myapp`
3. **Context switching** — use `minikube profile <name>` to switch
4. **Cleanup** — delete unused profiles to free resources
5. **Documentation** — document profile name and config in project README

## Examples

### Good
```bash
# Create project-specific profiles
minikube start --profile=frontend-app --cpus=2 --memory=4096
minikube start --profile=backend-api --cpus=4 --memory=8192

# Switch between projects
minikube profile frontend-app
kubectl get pods  # Shows frontend-app context

minikube profile backend-api
kubectl get pods  # Shows backend-api context

# List all profiles
minikube profile list

# Clean up when done with a project
minikube delete --profile=old-project
```

### Bad
```bash
# Using default profile for everything
minikube start  # Every project shares this cluster

# Deploying multiple unrelated apps to same cluster
kubectl apply -f project-a/
kubectl apply -f project-b/
# Namespace conflicts, resource contention, config bleed
```

## Enforcement
Document the profile name in each project's Makefile or docker-compose.yml. Use `minikube profile list` during onboarding to verify isolation.
