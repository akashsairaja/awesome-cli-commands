---
id: k3s-security-agent
stackId: k3s
type: agent
name: K3s Security Hardener
description: >-
  AI agent specialized in securing K3s clusters — CIS benchmark compliance,
  network policies, RBAC configuration, secrets encryption, and audit logging
  for lightweight Kubernetes.
difficulty: advanced
tags:
  - k3s-security
  - cis-benchmark
  - rbac
  - secrets-encryption
  - audit-logging
  - hardening
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - K3s cluster running
  - Root/sudo access on nodes
  - Understanding of Kubernetes RBAC
faq:
  - question: How do I harden K3s for production security?
    answer: >-
      Start K3s with --protect-kernel-defaults, --secrets-encryption, and audit
      logging flags. Apply Pod Security Standards (restricted profile) to
      namespaces, configure RBAC with least-privilege roles, deploy network
      policies for namespace isolation, rotate the node-token, and run CIS
      benchmark scans with kube-bench. Disable unused components like the
      built-in traefik and servicelb if not needed.
  - question: Does K3s support secrets encryption at rest?
    answer: >-
      Yes. Start K3s with the --secrets-encryption flag to enable automatic
      encryption of secrets in the datastore. You can provide a custom
      encryption configuration file with --secrets-encryption-config for
      advanced key management. Re-encrypt existing secrets with 'k3s
      secrets-encrypt reencrypt' after enabling. Verify with 'k3s
      secrets-encrypt status'.
  - question: How does K3s CIS compliance differ from standard Kubernetes?
    answer: >-
      K3s has its own CIS hardening guide because its single-binary design
      bundles components that are separate in standard K8s. K3s supports CIS
      Benchmark 1.9 and 1.10 with self-assessment guides. Many CIS controls
      require specific K3s server flags rather than separate component
      configuration files.
relatedItems:
  - k3s-cluster-architect
  - k3s-upgrade-strategy
  - sops-secret-encryption
version: 1.0.0
lastUpdated: '2026-03-11'
---

# K3s Security Hardener

K3s ships with sensible defaults for development, but production deployment requires deliberate hardening. Its single-binary design bundles the API server, controller manager, scheduler, and kubelet into one process, which means security configuration happens through server flags rather than separate config files. The trade-off for K3s's lightweight footprint is that teams sometimes skip security hardening because it "feels like a dev tool" — but K3s runs real workloads in production, edge environments, and IoT, where the attack surface is often larger than a traditional datacenter. This agent applies CIS Benchmark controls, secrets encryption, network isolation, and audit logging while preserving K3s's operational simplicity.

## Hardened K3s Server Installation

A production K3s installation should start with security flags from the beginning. Retrofitting security is possible but more disruptive:

```bash
# Hardened K3s server installation
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server" sh -s - \
  --secrets-encryption \
  --protect-kernel-defaults \
  --kube-apiserver-arg="audit-log-path=/var/log/k3s/audit.log" \
  --kube-apiserver-arg="audit-log-maxage=30" \
  --kube-apiserver-arg="audit-log-maxbackup=10" \
  --kube-apiserver-arg="audit-log-maxsize=100" \
  --kube-apiserver-arg="audit-policy-file=/etc/k3s/audit-policy.yaml" \
  --kube-apiserver-arg="enable-admission-plugins=NodeRestriction,PodSecurity" \
  --kube-apiserver-arg="request-timeout=300s" \
  --kube-apiserver-arg="service-account-lookup=true" \
  --kube-controller-manager-arg="terminated-pod-gc-threshold=10" \
  --kubelet-arg="make-iptables-util-chains=true" \
  --kubelet-arg="event-qps=0" \
  --disable traefik \
  --disable servicelb
```

The `--protect-kernel-defaults` flag ensures the kubelet fails to start if kernel parameters are not set to the values required by the CIS Benchmark. Configure the required kernel parameters before starting K3s:

```bash
# /etc/sysctl.d/90-k3s-cis.conf — required kernel parameters
vm.panic_on_oom=0
vm.overcommit_memory=1
kernel.panic=10
kernel.panic_on_oops=1
```

```bash
sudo sysctl --system  # Apply kernel parameters
```

Disabling traefik and servicelb reduces the attack surface if you use an external ingress controller or load balancer. Every unused component is a potential vulnerability.

## Secrets Encryption at Rest

By default, Kubernetes stores secrets as base64-encoded plaintext in its datastore. Anyone with read access to the underlying storage (etcd or K3s's embedded SQLite/etcd) can decode them trivially. K3s's `--secrets-encryption` flag enables AES-CBC encryption:

```bash
# Check current encryption status
k3s secrets-encrypt status
# Expected output: Encryption Status: Enabled, Current Rotation Stage: start

# View the encryption configuration
cat /var/lib/rancher/k3s/server/cred/encryption-config.json
```

For advanced key management, provide a custom encryption configuration:

```yaml
# /etc/k3s/encryption-config.yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
      - configmaps  # Also encrypt configmaps if they contain sensitive data
    providers:
      - aescbc:
          keys:
            - name: key-2026-03
              secret: <base64-encoded-32-byte-key>
      - aescbc:
          keys:
            - name: key-2025-12
              secret: <base64-encoded-previous-key>
      - identity: {}  # Fallback for reading unencrypted data during migration
```

After enabling encryption or rotating keys, re-encrypt all existing secrets:

```bash
# Re-encrypt all secrets with the current key
k3s secrets-encrypt reencrypt

# Verify a specific secret is encrypted (will show encrypted data in etcd)
k3s kubectl get secret my-secret -o yaml
# The data values should appear as encrypted blobs, not base64 plaintext
```

## Audit Logging

Audit logs record every API request, who made it, what they accessed, and whether it was allowed. These are mandatory for SOC 2, PCI-DSS, and HIPAA compliance:

```yaml
# /etc/k3s/audit-policy.yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  # Log all requests to secrets at the Metadata level (no secret values in logs)
  - level: Metadata
    resources:
      - group: ""
        resources: ["secrets"]

  # Log all changes to RBAC
  - level: RequestResponse
    resources:
      - group: "rbac.authorization.k8s.io"
        resources: ["clusterroles", "clusterrolebindings", "roles", "rolebindings"]

  # Log pod creation and deletion
  - level: Request
    resources:
      - group: ""
        resources: ["pods"]
    verbs: ["create", "delete", "patch"]

  # Log authentication failures
  - level: Metadata
    nonResourceURLs: ["/healthz*", "/version", "/swagger*"]
    omitStages: ["RequestReceived"]

  # Log namespace-level operations
  - level: Request
    resources:
      - group: ""
        resources: ["namespaces"]
    verbs: ["create", "delete", "update"]

  # Default: log metadata for everything else
  - level: Metadata
    omitStages: ["RequestReceived"]
```

Never log secrets at the `Request` or `RequestResponse` level — this writes secret values into audit logs, creating a new data leak vector. Always use `Metadata` level for secrets, which logs who accessed what without logging the content.

## Pod Security Standards

Pod Security Standards (PSS) replace the deprecated PodSecurityPolicy. K3s supports PSS through the built-in PodSecurity admission controller:

```yaml
# Apply restricted profile to production namespaces
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    # Enforce: reject pods that violate the restricted profile
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    # Warn: log violations against restricted (catches drift)
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/warn-version: latest
    # Audit: record violations in audit logs
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/audit-version: latest
```

The restricted profile enforces: non-root containers, read-only root filesystem capability, dropped ALL capabilities, no privilege escalation, restricted volume types, and seccomp profiles. Workloads must comply:

```yaml
# Pod spec compliant with restricted PSS
apiVersion: v1
kind: Pod
metadata:
  name: app
  namespace: production
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      image: myapp:latest
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop: ["ALL"]
      volumeMounts:
        - name: tmp
          mountPath: /tmp
  volumes:
    - name: tmp
      emptyDir: {}
```

## RBAC Least-Privilege Configuration

Never use the default service account for workloads. Create dedicated service accounts with the minimum permissions required:

```yaml
# Dedicated service account for a deployment
apiVersion: v1
kind: ServiceAccount
metadata:
  name: order-processor
  namespace: production
automountServiceAccountToken: false  # Don't mount token unless needed
---
# Role with minimum required permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: order-processor-role
  namespace: production
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    resourceNames: ["order-config"]  # Restrict to specific resources
    verbs: ["get"]
  - apiGroups: [""]
    resources: ["secrets"]
    resourceNames: ["order-db-creds"]
    verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: order-processor-binding
  namespace: production
subjects:
  - kind: ServiceAccount
    name: order-processor
    namespace: production
roleRef:
  kind: Role
  name: order-processor-role
  apiGroup: rbac.authorization.k8s.io
```

Use `resourceNames` to restrict access to specific ConfigMaps and Secrets rather than granting access to all resources of that type. This is the difference between "can read the database password" and "can read every secret in the namespace."

## Network Policies for Namespace Isolation

K3s ships with a network policy controller that enforces any policies you create. By default, all pods can communicate with all other pods — network policies restrict this:

```yaml
# Default deny all ingress and egress for a namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
---
# Allow specific ingress: only from ingress controller
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-controller
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: web-api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-system
      ports:
        - protocol: TCP
          port: 8080
---
# Allow egress to database only
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-db-egress
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: web-api
  policyTypes:
    - Egress
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgresql
      ports:
        - protocol: TCP
          port: 5432
    - to:  # Allow DNS resolution
        - namespaceSelector: {}
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
```

Start with default-deny, then add specific allow policies. Always include DNS egress (port 53) — without it, pods cannot resolve service names and everything breaks silently.

## Node Token Rotation

The K3s node token authenticates agent nodes to the server. The default token is generated at install and stored in `/var/lib/rancher/k3s/server/node-token`. Rotate it after initial cluster setup:

```bash
# Generate a new node token
k3s token rotate

# View the new token
cat /var/lib/rancher/k3s/server/node-token

# Existing agents continue to work — they authenticated during join
# New agents must use the new token to join the cluster
```

Store the node token in a secrets manager, not in scripts, documentation, or CI/CD variables. Anyone with the node token can join a machine to your cluster.

## CIS Benchmark Validation

Run kube-bench against your K3s cluster to validate CIS compliance:

```bash
# Run kube-bench with K3s-specific configuration
kube-bench run --config-dir /etc/kube-bench/cfg --config /etc/kube-bench/cfg/config.yaml

# Or use the K3s CIS self-assessment guide to manually verify
# Check API server settings
k3s kubectl get pod kube-apiserver-<node> -n kube-system -o yaml | grep -A5 command

# Verify secrets encryption is active
k3s secrets-encrypt status

# Verify PSS labels on namespaces
k3s kubectl get namespaces --show-labels | grep pod-security

# Verify network policies exist
k3s kubectl get networkpolicies --all-namespaces
```

Address findings by priority: encryption and authentication failures first, then access control, then logging, then best-practice recommendations. Track remediation in a compliance register and re-scan after each fix to verify resolution.
