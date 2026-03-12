---
id: pulumi-component-resources
stackId: pulumi
type: rule
name: Use Component Resources for Abstraction
description: >-
  All reusable infrastructure patterns must be encapsulated as Pulumi component
  resources — never create flat lists of primitive resources when a logical
  grouping exists.
difficulty: intermediate
globs:
  - '**/index.ts'
  - '**/__main__.py'
  - '**/main.go'
  - '**/components/**'
tags:
  - component-resources
  - abstraction
  - reusability
  - architecture
  - best-practices
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
  - question: When should I create a Pulumi component resource?
    answer: >-
      Create a component when you have 3+ resources that form a logical unit
      (VPC, database cluster, application service), when you want to reuse the
      pattern across stacks, or when you want to unit test infrastructure logic.
      Components provide typed interfaces, encapsulate complexity, and make
      infrastructure programs readable.
  - question: What is the parent option in Pulumi component resources?
    answer: >-
      Setting '{ parent: this }' on child resources creates a hierarchy in the
      Pulumi state tree. Without it, all resources appear flat at the root
      level. The parent relationship also enables cascading deletes (deleting
      the component deletes all children) and proper dependency tracking.
relatedItems:
  - pulumi-typed-configuration
  - pulumi-component-patterns
  - pulumi-iac-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Use Component Resources for Abstraction

## Rule
Any group of related resources that represents a logical unit (VPC, database cluster, application service) MUST be encapsulated as a ComponentResource with typed inputs and outputs.

## Good Examples
```typescript
// Component resource — clean interface
const vpc = new Vpc("production", {
  cidrBlock: "10.0.0.0/16",
  azCount: 3,
  enableNatGateway: true,
});

const database = new DatabaseCluster("main", {
  vpcId: vpc.vpcId,
  subnetIds: vpc.privateSubnetIds,
  engine: "postgres",
  engineVersion: "16",
  instanceClass: "db.r6g.large",
});

const app = new WebService("api", {
  vpcId: vpc.vpcId,
  subnetIds: vpc.privateSubnetIds,
  image: "myapp/api:2.0",
  port: 8080,
  databaseUrl: database.connectionString,
});
```

## Bad Examples
```typescript
// BAD: Flat list of primitives (no abstraction)
const vpc = new aws.ec2.Vpc("vpc", { cidrBlock: "10.0.0.0/16" });
const subnet1 = new aws.ec2.Subnet("sub1", { vpcId: vpc.id, cidrBlock: "10.0.1.0/24" });
const subnet2 = new aws.ec2.Subnet("sub2", { vpcId: vpc.id, cidrBlock: "10.0.2.0/24" });
const igw = new aws.ec2.InternetGateway("igw", { vpcId: vpc.id });
const rt = new aws.ec2.RouteTable("rt", { vpcId: vpc.id });
// ... 20 more resources with no grouping
```

## Component Resource Template
```typescript
interface MyComponentArgs {
  // Typed inputs
}

class MyComponent extends pulumi.ComponentResource {
  public readonly output1: pulumi.Output<string>;

  constructor(name: string, args: MyComponentArgs, opts?: pulumi.ComponentResourceOptions) {
    super("custom:category:MyComponent", name, {}, opts);

    // Create child resources with { parent: this }

    this.registerOutputs({ output1: this.output1 });
  }
}
```

## When to Create a Component
- 3+ resources that are always created together
- Resources with a clear logical grouping (network, database, service)
- Patterns you want to reuse across stacks or projects
- Infrastructure that would benefit from unit testing

## Enforcement
- Code review: flag flat resource lists that should be components
- Pulumi Automation API for programmatic validation
