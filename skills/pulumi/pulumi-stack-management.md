---
id: pulumi-stack-management
stackId: pulumi
type: skill
name: Pulumi Stack & Configuration Management
description: >-
  Manage Pulumi stacks for multi-environment deployments — stack configuration,
  secrets encryption, stack references, and environment promotion patterns.
difficulty: intermediate
tags:
  - stacks
  - configuration
  - secrets
  - multi-environment
  - stack-references
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - typescript
  - python
  - go
prerequisites:
  - Pulumi CLI 3.100+
  - Basic Pulumi program knowledge
faq:
  - question: What is a Pulumi stack?
    answer: >-
      A stack is an isolated instance of a Pulumi program with its own
      configuration, state, and cloud resources. You create one stack per
      environment (dev, staging, production) from the same code. Each stack can
      have different configuration values (instance sizes, replica counts,
      regions) and maintains independent state.
  - question: How do Pulumi stack references work?
    answer: >-
      Stack references allow one stack to read exported outputs from another
      stack. For example, a networking stack exports VPC IDs, and an application
      stack reads them with 'new
      pulumi.StackReference("org/project/stack").getOutput("vpcId")'. This
      creates a dependency between stacks without hardcoding resource IDs.
relatedItems:
  - pulumi-iac-architect
  - pulumi-component-patterns
  - pulumi-devops-engineer
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Pulumi Stack & Configuration Management

## Overview
Pulumi stacks represent isolated instances of your infrastructure program. Each stack has its own configuration, state, and cloud resources — enabling multi-environment deployments from a single codebase.

## Why This Matters
- **Environment isolation** — dev, staging, production as separate stacks
- **Configuration management** — environment-specific values without code changes
- **Secret encryption** — stack-level encryption for sensitive config
- **Cross-stack references** — share outputs between infrastructure layers

## Stack Configuration
```bash
# Create stacks for each environment
pulumi stack init dev
pulumi stack init staging
pulumi stack init production

# Set configuration per stack
pulumi stack select production
pulumi config set aws:region us-east-1
pulumi config set instanceType m6i.large
pulumi config set minCapacity 3
pulumi config set --secret dbPassword "super_secret"
```

## Using Configuration in Code
```typescript
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const instanceType = config.require("instanceType");
const minCapacity = config.requireNumber("minCapacity");
const dbPassword = config.requireSecret("dbPassword");
const enableMonitoring = config.getBoolean("enableMonitoring") ?? true;

// Stack name available for naming
const stack = pulumi.getStack(); // "production"
const namePrefix = `myapp-${stack}`;
```

## Stack References (Cross-Stack Dependencies)
```typescript
// networking stack exports
export const vpcId = vpc.id;
export const privateSubnetIds = privateSubnets.map(s => s.id);

// application stack consumes
const networkingStack = new pulumi.StackReference("myorg/networking/production");
const vpcId = networkingStack.getOutput("vpcId");
const subnetIds = networkingStack.getOutput("privateSubnetIds");
```

## Stack Configuration Files
```yaml
# Pulumi.production.yaml
config:
  aws:region: us-east-1
  myapp:instanceType: m6i.large
  myapp:minCapacity: "3"
  myapp:dbPassword:
    secure: AAABADFs...encrypted...
  myapp:enableMonitoring: "true"
```

## Environment Promotion
```bash
# Deploy to dev
pulumi stack select dev
pulumi up

# Promote to staging (same code, different config)
pulumi stack select staging
pulumi preview
pulumi up

# Promote to production (with approval)
pulumi stack select production
pulumi preview --diff
# Review changes carefully
pulumi up
```

## Best Practices
- One stack per environment per infrastructure layer
- Use `config.requireSecret()` for all sensitive values
- Export only necessary outputs from stacks
- Use stack references for cross-stack dependencies (not hardcoded ARNs)
- Keep Pulumi.{stack}.yaml files in version control (secrets are encrypted)
- Use `pulumi preview --diff` before every production update

## Common Mistakes
- Hardcoding environment-specific values instead of using config
- Storing secrets in plain text config (use `--secret` flag)
- Circular stack references (stack A depends on B depends on A)
- Too many resources in one stack (slow updates, large blast radius)
