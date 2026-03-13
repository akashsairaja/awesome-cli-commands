---
id: pulumi-stack-management
stackId: pulumi
type: skill
name: >-
  Pulumi Stack & Configuration Management
description: >-
  Manage Pulumi stacks for multi-environment deployments — stack
  configuration, secrets encryption, cross-stack references, environment
  promotion, developer stacks, and state management patterns.
difficulty: advanced
tags:
  - pulumi
  - stack
  - configuration
  - management
  - deployment
  - monitoring
  - machine-learning
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Pulumi Stack & Configuration Management skill?"
    answer: >-
      Use this skill to manage multi-environment infrastructure with Pulumi
      stacks — separate dev/staging/production configurations from a single
      codebase, encrypt secrets per-stack, share outputs across stacks with
      stack references, implement promotion workflows, and manage developer
      sandbox environments.
  - question: "What tools and setup does Pulumi Stack & Configuration Management require?"
    answer: >-
      Requires the Pulumi CLI and a state backend (Pulumi Cloud free tier,
      S3, Azure Blob, or local filesystem). Language runtime required for
      your chosen SDK (Node.js for TypeScript, Python, Go, or .NET).
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# Pulumi Stack & Configuration Management

## Overview

Pulumi stacks represent isolated instances of your infrastructure program. Each stack has its own configuration, state, and cloud resources. You write the infrastructure once in TypeScript, Python, Go, or C# — then deploy it to dev, staging, and production by switching stacks. Each stack can have different instance sizes, replica counts, regions, and secrets while sharing the same infrastructure code.

## Creating and Organizing Stacks

```bash
# Initialize a new Pulumi project
pulumi new aws-typescript --name my-infra

# Create stacks for each environment
pulumi stack init dev
pulumi stack init staging
pulumi stack init production

# List all stacks
pulumi stack ls
# NAME        LAST UPDATE  RESOURCE COUNT  URL
# dev         2 hours ago  12              app.pulumi.com/...
# staging     1 day ago    12              app.pulumi.com/...
# production  3 days ago   15              app.pulumi.com/...

# Switch stacks
pulumi stack select staging
```

### Stack Naming Convention

Stack names are fully qualified as `<organization>/<project>/<stack>`:

```bash
# Full qualified name (used in stack references)
myorg/networking/production
myorg/application/production
myorg/monitoring/production

# Create with organization prefix
pulumi stack init myorg/production
```

Use a consistent naming scheme: `{org}/{project}/{environment}` or `{org}/{project}/{environment}-{region}` for multi-region deployments.

## Stack Configuration

Configuration is per-stack and stored in `Pulumi.<stack>.yaml` files:

```bash
# Set configuration values for the current stack
pulumi stack select production
pulumi config set aws:region us-east-1
pulumi config set instanceType m6i.large
pulumi config set minCapacity 3
pulumi config set maxCapacity 10
pulumi config set enableMonitoring true

# Set secret values (encrypted at rest)
pulumi config set --secret dbPassword "prod-super-secret-password"
pulumi config set --secret apiKey "sk-live-abc123"
```

This produces a `Pulumi.production.yaml` file:

```yaml
# Pulumi.production.yaml (safe to commit — secrets are encrypted)
config:
  aws:region: us-east-1
  myapp:instanceType: m6i.large
  myapp:minCapacity: "3"
  myapp:maxCapacity: "10"
  myapp:enableMonitoring: "true"
  myapp:dbPassword:
    secure: AAABADFs...encrypted-value...
  myapp:apiKey:
    secure: AAABANmK...encrypted-value...
```

### Accessing Configuration in Code

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();

// Required values — deployment fails if missing
const instanceType = config.require("instanceType");
const minCapacity = config.requireNumber("minCapacity");
const dbPassword = config.requireSecret("dbPassword");

// Optional values with defaults
const maxCapacity = config.getNumber("maxCapacity") ?? 5;
const enableMonitoring = config.getBoolean("enableMonitoring") ?? true;

// Stack name for dynamic naming
const stack = pulumi.getStack(); // "production"
const namePrefix = `myapp-${stack}`;

// Use in resource definitions
const cluster = new aws.ecs.Cluster(`${namePrefix}-cluster`);

const service = new aws.ecs.Service(`${namePrefix}-service`, {
    cluster: cluster.arn,
    desiredCount: minCapacity,
    // dbPassword is an Output<string> — stays encrypted in state
});
```

The `requireSecret()` method returns an `Output<string>` that is encrypted in the state file and masked in logs. Use it for all sensitive values — even if they are not traditionally "secrets" (database names, internal URLs).

### Structured Configuration

For complex configuration, use structured values:

```bash
# Set structured config
pulumi config set --path 'database.engine' postgres
pulumi config set --path 'database.version' 15
pulumi config set --path 'database.instanceClass' db.r6g.large
pulumi config set --path --secret 'database.password' 'super-secret'
```

```typescript
interface DatabaseConfig {
    engine: string;
    version: number;
    instanceClass: string;
    password: pulumi.Output<string>;
}

const dbConfig = config.requireObject<DatabaseConfig>("database");
```

## Cross-Stack References

Stack references let you share outputs between independent stacks. This is how you decompose infrastructure into layers — networking, compute, monitoring — while keeping them connected.

### Exporting Stack Outputs

```typescript
// networking/index.ts — the networking stack
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const vpc = new aws.ec2.Vpc("main", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
});

const privateSubnets = [
    new aws.ec2.Subnet("private-a", {
        vpcId: vpc.id,
        cidrBlock: "10.0.1.0/24",
        availabilityZone: "us-east-1a",
    }),
    new aws.ec2.Subnet("private-b", {
        vpcId: vpc.id,
        cidrBlock: "10.0.2.0/24",
        availabilityZone: "us-east-1b",
    }),
];

// Export values for other stacks to consume
export const vpcId = vpc.id;
export const privateSubnetIds = privateSubnets.map(s => s.id);
export const vpcCidrBlock = vpc.cidrBlock;
```

### Consuming Stack Outputs

```typescript
// application/index.ts — the application stack
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const stack = pulumi.getStack();

// Reference the networking stack's outputs
const networkingStack = new pulumi.StackReference(`myorg/networking/${stack}`);

// requireOutput fails fast if the output doesn't exist
const vpcId = networkingStack.requireOutput("vpcId");
const subnetIds = networkingStack.requireOutput("privateSubnetIds");

// Use the referenced values
const alb = new aws.lb.LoadBalancer("app-lb", {
    internal: false,
    loadBalancerType: "application",
    subnets: subnetIds as pulumi.Output<string[]>,
});
```

Use `requireOutput()` instead of `getOutput()` — it surfaces missing or misspelled output names as a clear, immediate error rather than silently propagating undefined values.

### Dynamic Environment Matching

```typescript
// Automatically match the consuming stack's environment
const stack = pulumi.getStack(); // "staging"
const networkRef = new pulumi.StackReference(`myorg/networking/${stack}`);
// References: myorg/networking/staging
```

This pattern means the application's staging stack always references the networking staging stack — no hardcoded stack names.

## Environment Promotion

```bash
# 1. Deploy to dev and verify
pulumi stack select dev
pulumi up --yes

# 2. Run tests against dev

# 3. Promote to staging
pulumi stack select staging
pulumi preview --diff  # Review what will change
pulumi up --yes

# 4. Run integration tests against staging

# 5. Promote to production (with review)
pulumi stack select production
pulumi preview --diff  # ALWAYS review production changes
pulumi up              # No --yes for production — require manual confirmation
```

### CI/CD Pipeline Pattern

```bash
#!/bin/bash
# deploy.sh — called by CI with STACK environment variable

STACK="${1:?Usage: deploy.sh <stack>}"
pulumi stack select "$STACK"

# Preview and capture output
pulumi preview --diff --json > preview.json

# Check for destructive changes
if grep -q '"delete"' preview.json; then
    echo "WARNING: Destructive changes detected in $STACK"
    if [ "$STACK" = "production" ]; then
        echo "Production destructive changes require manual approval"
        exit 1
    fi
fi

# Apply
if [ "$STACK" = "production" ]; then
    pulumi up --diff  # Interactive confirmation for production
else
    pulumi up --yes   # Auto-approve for dev/staging
fi
```

## Developer Stacks

Give each developer their own isolated stack for experimentation:

```bash
# Each developer creates a personal stack
pulumi stack init dev-alice
pulumi stack init dev-bob

# Copy configuration from the dev stack
pulumi config cp --stack dev --dest dev-alice

# Override specific values for the personal stack
pulumi config set instanceType t3.micro  # Smaller/cheaper
pulumi config set minCapacity 1          # Minimal resources

# Deploy personal environment
pulumi up --yes

# Clean up when done
pulumi destroy --yes
pulumi stack rm dev-alice
```

Developer stacks use the same code as dev/staging/production but with minimal resource configurations to save cost.

## Secrets Management

```bash
# Change the secrets provider (default: Pulumi Cloud)
pulumi stack init production --secrets-provider="awskms://alias/pulumi-secrets"

# Other supported providers:
# --secrets-provider="gcpkms://projects/myproject/locations/global/keyRings/my-ring/cryptoKeys/my-key"
# --secrets-provider="azurekeyvault://my-vault.vault.azure.net/keys/my-key"
# --secrets-provider="passphrase"  # Simple passphrase encryption

# Rotate all secrets (after key rotation)
pulumi stack change-secrets-provider "awskms://alias/new-key"
```

## State Management

```bash
# Export stack state (backup)
pulumi stack export --file state-backup.json

# Import stack state (restore or migration)
pulumi stack import --file state-backup.json

# Refresh state from cloud provider (detect drift)
pulumi refresh

# View stack outputs
pulumi stack output
pulumi stack output vpcId  # Specific output

# View resource history
pulumi stack history
```

### Handling Drift

```bash
# Detect drift between Pulumi state and actual cloud resources
pulumi refresh --diff

# Review and accept drift (update state to match reality)
pulumi refresh --yes

# Or reject drift (update cloud to match state)
pulumi up
```

## Best Practices

- One stack per environment per infrastructure layer. Avoid monolithic stacks with 100+ resources — they are slow to update and have a large blast radius.
- Use `config.requireSecret()` for all sensitive values. Secrets are encrypted in the state file and masked in CLI output.
- Use `requireOutput()` for stack references — it fails fast on missing outputs instead of silently returning undefined.
- Keep `Pulumi.<stack>.yaml` files in version control. Secrets are encrypted, so the files are safe to commit.
- Use `pulumi preview --diff` before every production update. Review the output for unexpected changes.
- Export only necessary outputs from stacks. Fewer exports means fewer cross-stack coupling points.
- Use dynamic stack name matching (`myorg/networking/${stack}`) so references automatically follow the environment.
- Give developers personal stacks with minimal resources for experimentation.

## Common Pitfalls

- Hardcoding environment-specific values in code instead of using stack configuration — breaks when you switch stacks.
- Storing secrets in plain text config — always use `pulumi config set --secret` or `requireSecret()` in code.
- Circular stack references (stack A depends on B which depends on A) — redesign to break the cycle with a shared base stack.
- Too many resources in one stack — leads to slow updates (10+ minutes), large blast radius, and state file conflicts in teams.
- Using `getOutput()` instead of `requireOutput()` — silently returns undefined on typos, causing runtime errors far from the source.
- Not running `pulumi preview` before `pulumi up` in production — surprises in production are always bad.
- Forgetting to destroy developer stacks — orphaned cloud resources accumulate costs.
