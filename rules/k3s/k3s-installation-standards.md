---
id: k3s-installation-standards
stackId: k3s
type: rule
name: K3s Installation Standards
description: >-
  Enforce best practices for K3s installation — secure tokens, TLS SANs,
  disabled unused components, resource reservations, and kernel parameter
  configuration.
difficulty: intermediate
globs:
  - '**/k3s/**'
  - '**/scripts/*k3s*'
  - '**/ansible/*k3s*'
tags:
  - k3s-installation
  - secure-setup
  - tls-san
  - kernel-defaults
  - production-config
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: What flags are required for a production K3s installation?
    answer: >-
      Production K3s installations need: a strong random K3S_TOKEN, --tls-san
      for all API access points, --protect-kernel-defaults for security,
      --node-taint on server nodes in HA setups, --write-kubeconfig-mode 644,
      and --disable for unused components like traefik if replaced.
  - question: Why should I disable default Traefik in K3s?
    answer: >-
      Disable the bundled Traefik with --disable traefik when using an
      alternative ingress controller like NGINX, HAProxy, or a service mesh.
      Running two ingress controllers causes port conflicts and unexpected
      routing behavior.
relatedItems:
  - k3s-networking-standards
  - k3s-ha-cluster-setup
  - k3s-cluster-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# K3s Installation Standards

## Rule
All K3s installations MUST use secure tokens, explicit TLS SANs, and appropriate component configuration flags.

## Format
```bash
curl -sfL https://get.k3s.io | K3S_TOKEN="<strong-random-token>" sh -s - server \
  --tls-san=<load-balancer-dns> \
  --tls-san=<load-balancer-ip> \
  --node-taint CriticalAddonsOnly=true:NoExecute \
  --protect-kernel-defaults \
  --write-kubeconfig-mode 644 \
  --disable=<unused-components>
```

## Requirements
1. **Secure token** — use a strong random value, never default or simple strings
2. **TLS SANs** — add all DNS names and IPs used to access the API server
3. **Server taints** — taint server nodes in HA setups to prevent workload scheduling
4. **Kernel protection** — enable `--protect-kernel-defaults` in production
5. **Kubeconfig permissions** — set `--write-kubeconfig-mode 644` for non-root access
6. **Disable unused components** — remove traefik, servicelb when using alternatives

## Examples

### Good — Production HA Server
```bash
curl -sfL https://get.k3s.io | K3S_TOKEN="$(openssl rand -hex 32)" sh -s - server \
  --cluster-init \
  --tls-san=k3s.example.com \
  --tls-san=10.0.0.100 \
  --node-taint CriticalAddonsOnly=true:NoExecute \
  --protect-kernel-defaults \
  --write-kubeconfig-mode 644 \
  --disable traefik \
  --disable servicelb \
  --kubelet-arg="system-reserved=cpu=250m,memory=256Mi" \
  --etcd-snapshot-schedule-cron="0 */6 * * *" \
  --etcd-snapshot-retention=10
```

### Bad
```bash
# Insecure: default token, no TLS SAN, no taints, no kernel protection
curl -sfL https://get.k3s.io | sh -
```

## Enforcement
Document installation commands in runbooks and GitOps bootstrap scripts. Review K3s startup flags with `systemctl cat k3s` during audits.
