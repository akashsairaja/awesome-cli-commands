---
id: minikube-addon-management
stackId: minikube
type: skill
name: Essential Minikube Addons Configuration
description: >-
  Enable and configure the most useful Minikube addons — ingress, dashboard,
  metrics-server, registry, and storage provisioner for productive local
  Kubernetes development.
difficulty: beginner
tags:
  - minikube-addons
  - ingress
  - dashboard
  - metrics-server
  - local-registry
  - development-tools
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - minikube installed and running
  - kubectl configured
faq:
  - question: Which minikube addons should I enable for development?
    answer: >-
      Start with ingress (HTTP routing), metrics-server (resource monitoring and
      HPA), and storage-provisioner (dynamic PVs). Add dashboard for visual
      cluster management and registry if you need a local image registry. Enable
      only what you use to conserve resources.
  - question: How do I access services running in minikube?
    answer: >-
      Three options: (1) 'minikube tunnel' assigns real IPs to LoadBalancer
      services. (2) Enable the ingress addon and create Ingress resources for
      HTTP routing. (3) 'minikube service <name>' opens the service URL
      directly. Avoid using NodePort for everything.
relatedItems:
  - minikube-multi-node-setup
  - minikube-dev-environment
  - minikube-testing-agent
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Essential Minikube Addons Configuration

## Overview
Minikube addons are pre-packaged Kubernetes components that you enable with a single command. They provide functionality like ingress routing, dashboards, monitoring, and local registries that would otherwise require manual Helm chart installation.

## Why This Matters
- **One-command setup** — no Helm charts or manual YAML for common tools
- **Pre-configured** — addons work out of the box with minikube
- **Resource efficient** — enable only what you need
- **Development productivity** — dashboard, metrics, and ingress in seconds

## How It Works

### List and Enable Addons
```bash
# List all available addons
minikube addons list

# Enable essential addons
minikube addons enable ingress          # NGINX Ingress Controller
minikube addons enable dashboard        # Kubernetes Dashboard
minikube addons enable metrics-server   # CPU/Memory metrics for HPA
minikube addons enable registry         # Local container registry
minikube addons enable storage-provisioner  # Dynamic PV provisioning (default)
```

### Configure Ingress
```bash
# Enable ingress
minikube addons enable ingress

# Get the minikube IP
minikube ip  # e.g., 192.168.49.2

# Create an Ingress resource
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
spec:
  rules:
    - host: myapp.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-app
                port:
                  number: 80
EOF

# Add to /etc/hosts
echo "$(minikube ip) myapp.local" | sudo tee -a /etc/hosts

# Access at http://myapp.local
```

### Access Dashboard
```bash
# Open dashboard in browser
minikube dashboard

# Or get the URL without opening browser
minikube dashboard --url
```

### Set Up Local Registry
```bash
# Enable registry addon
minikube addons enable registry

# Build and push to local registry
docker build -t localhost:5000/myapp:latest .
docker push localhost:5000/myapp:latest

# Use in Kubernetes
kubectl create deployment myapp --image=localhost:5000/myapp:latest
```

### Use Minikube Tunnel for LoadBalancer
```bash
# Start tunnel (requires sudo)
minikube tunnel

# Now LoadBalancer services get external IPs
kubectl get svc
# NAME    TYPE           EXTERNAL-IP   PORT(S)
# myapp   LoadBalancer   127.0.0.1     80:31234/TCP
```

## Best Practices
- Enable only the addons you actually need (saves resources)
- Use `minikube tunnel` instead of NodePort for service access
- Configure ingress with host-based routing for multi-service development
- Use `minikube image load` as a simpler alternative to the registry addon
- Disable dashboard in CI (unnecessary resource usage)

## Common Mistakes
- Enabling too many addons (each consumes CPU and memory)
- Not adding minikube IP to /etc/hosts for ingress (DNS resolution fails)
- Forgetting to run `minikube tunnel` for LoadBalancer services
- Using NodePort for everything instead of ingress (port management headache)
