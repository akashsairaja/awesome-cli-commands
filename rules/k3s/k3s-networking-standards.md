---
id: k3s-networking-standards
stackId: k3s
type: rule
name: K3s Networking and Firewall Standards
description: >-
  Enforce network configuration standards for K3s clusters — required ports,
  firewall rules, CNI configuration, and network policy enforcement.
difficulty: intermediate
globs:
  - '**/network-policies/**/*.yaml'
  - '**/firewall/**'
  - '**/k3s/**'
tags:
  - k3s-networking
  - firewall-rules
  - network-policies
  - port-configuration
  - cluster-security
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: What ports does K3s need open?
    answer: >-
      Server nodes need 6443 (API), 2379-2380 (etcd), 10250 (kubelet), and
      8472/UDP (VXLAN). Agent nodes need 10250 (kubelet), 8472/UDP (VXLAN), and
      30000-32767 (NodePorts). Restrict all ports to trusted network ranges
      only.
  - question: How do I enable network policies in K3s?
    answer: >-
      K3s uses Flannel CNI by default, which does not support network policies.
      To enable them, install K3s with --flannel-backend=none and deploy a CNI
      that supports policies like Calico or Cilium. Then apply default-deny
      NetworkPolicy resources to each namespace.
relatedItems:
  - k3s-installation-standards
  - k3s-security-agent
  - k3s-ha-cluster-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# K3s Networking and Firewall Standards

## Rule
All K3s clusters MUST have proper firewall rules configured and network policies enabled to restrict inter-pod traffic.

## Required Ports

### Server Nodes
| Port | Protocol | Direction | Purpose |
|------|----------|-----------|---------|
| 6443 | TCP | Inbound | Kubernetes API server |
| 2379-2380 | TCP | Server-to-Server | etcd client/peer |
| 10250 | TCP | Inbound | Kubelet metrics |
| 8472 | UDP | All nodes | VXLAN (Flannel) |
| 51820 | UDP | All nodes | WireGuard (if enabled) |

### Agent Nodes
| Port | Protocol | Direction | Purpose |
|------|----------|-----------|---------|
| 10250 | TCP | Inbound | Kubelet metrics |
| 8472 | UDP | All nodes | VXLAN (Flannel) |
| 30000-32767 | TCP | Inbound | NodePort services |

## Examples

### Good — Firewall Configuration
```bash
# Server node firewall (ufw example)
sudo ufw allow from 10.0.0.0/24 to any port 6443   # API server from trusted network
sudo ufw allow from 10.0.0.0/24 to any port 2379:2380/tcp  # etcd
sudo ufw allow from 10.0.0.0/24 to any port 10250/tcp      # kubelet
sudo ufw allow from 10.0.0.0/24 to any port 8472/udp       # VXLAN
sudo ufw deny from any to any port 6443  # Block public API access
```

### Good — Network Policy (Default Deny)
```yaml
# Apply to every namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

### Bad
```bash
# No firewall rules — all ports exposed
# No network policies — all pods can communicate freely
sudo ufw disable
```

## Enforcement
Deploy default-deny NetworkPolicies via GitOps. Validate firewall rules with port scanning during security audits. Use admission controllers to reject pods without matching NetworkPolicies.
