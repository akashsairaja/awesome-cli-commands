---
id: pulumi-component-patterns
stackId: pulumi
type: skill
name: Pulumi Component Resource Patterns
description: >-
  Build reusable Pulumi component resources in TypeScript — encapsulate
  infrastructure patterns, accept typed inputs, expose outputs, and enable
  composition of complex cloud architectures.
difficulty: beginner
tags:
  - pulumi
  - component
  - resource
  - patterns
  - testing
  - type-safety
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Pulumi Component Resource Patterns skill?"
    answer: >-
      Build reusable Pulumi component resources in TypeScript — encapsulate
      infrastructure patterns, accept typed inputs, expose outputs, and enable
      composition of complex cloud architectures. It includes practical
      examples for pulumi development.
  - question: "What tools and setup does Pulumi Component Resource Patterns require?"
    answer: >-
      Requires Terraform CLI installed. Works with pulumi projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Pulumi Component Resource Patterns

## Overview
Component resources are Pulumi's primary abstraction mechanism. They group related cloud resources into reusable, typed classes — similar to modules in Terraform but with the full power of a programming language.

## Why This Matters
- **Reusability** — define a VPC pattern once, use across all environments
- **Type safety** — TypeScript catches misconfiguration at compile time
- **Testability** — unit test components with mocked providers
- **Encapsulation** — hide implementation details, expose clean interfaces

## Basic Component Resource
```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

interface VpcArgs {
  cidrBlock: string;
  azCount: number;
  enableNatGateway: boolean;
  tags?: Record<string, string>;
}

export class Vpc extends pulumi.ComponentResource {
  public readonly vpcId: pulumi.Output<string>;
  public readonly publicSubnetIds: pulumi.Output<string>[];
  public readonly privateSubnetIds: pulumi.Output<string>[];

  constructor(name: string, args: VpcArgs, opts?: pulumi.ComponentResourceOptions) {
    super("custom:networking:Vpc", name, {}, opts);

    const vpc = new aws.ec2.Vpc(`${name}-vpc`, {
      cidrBlock: args.cidrBlock,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      tags: { ...args.tags, Name: `${name}-vpc` },
    }, { parent: this });

    this.vpcId = vpc.id;

    // Create subnets across AZs
    const azs = aws.getAvailabilityZonesOutput({ state: "available" });

    this.publicSubnetIds = [];
    this.privateSubnetIds = [];

    for (let i = 0; i < args.azCount; i++) {
      const publicSubnet = new aws.ec2.Subnet(`${name}-public-${i}`, {
        vpcId: vpc.id,
        cidrBlock: `10.0.${i + 1}.0/24`,
        availabilityZone: azs.names[i],
        mapPublicIpOnLaunch: true,
        tags: { Name: `${name}-public-${i}` },
      }, { parent: this });

      this.publicSubnetIds.push(publicSubnet.id);

      const privateSubnet = new aws.ec2.Subnet(`${name}-private-${i}`, {
        vpcId: vpc.id,
        cidrBlock: `10.0.${i + 11}.0/24`,
        availabilityZone: azs.names[i],
        tags: { Name: `${name}-private-${i}` },
      }, { parent: this });

      this.privateSubnetIds.push(privateSubnet.id);
    }

    this.registerOutputs({
      vpcId: this.vpcId,
      publicSubnetIds: this.publicSubnetIds,
      privateSubnetIds: this.privateSubnetIds,
    });
  }
}
```

## Using the Component
```typescript
// index.ts
import { Vpc } from "./components/vpc";

const vpc = new Vpc("myapp", {
  cidrBlock: "10.0.0.0/16",
  azCount: 3,
  enableNatGateway: true,
  tags: { Environment: "production", Team: "platform" },
});

export const vpcId = vpc.vpcId;
export const publicSubnets = vpc.publicSubnetIds;
```

## Unit Testing Components
```typescript
import * as pulumi from "@pulumi/pulumi";
import { Vpc } from "./components/vpc";

// Mock Pulumi runtime
pulumi.runtime.setMocks({
  newResource: (args) => ({
    id: `${args.name}-id`,
    state: args.inputs,
  }),
  call: (args) => args.inputs,
});

describe("Vpc Component", () => {
  it("creates correct number of subnets", async () => {
    const vpc = new Vpc("test", {
      cidrBlock: "10.0.0.0/16",
      azCount: 3,
      enableNatGateway: false,
    });

    expect(vpc.publicSubnetIds.length).toBe(3);
    expect(vpc.privateSubnetIds.length).toBe(3);
  });
});
```

## Best Practices
- Always call `registerOutputs` at the end of the constructor
- Set `{ parent: this }` on all child resources for proper hierarchy
- Use TypeScript interfaces for component args (type safety)
- Export only the outputs consumers need
- Implement unit tests with pulumi.runtime.setMocks
- Follow naming convention: `custom:<category>:<name>` for resource type

## Common Mistakes
- Forgetting `{ parent: this }` (resources appear at root instead of nested)
- Not calling `registerOutputs` (outputs not tracked in state)
- Creating resources outside the constructor (lifecycle issues)
- Overly broad component scope (should be focused, composable units)
