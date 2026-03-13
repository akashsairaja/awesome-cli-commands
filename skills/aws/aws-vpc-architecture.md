---
id: aws-vpc-architecture
stackId: aws
type: skill
name: AWS VPC Architecture Design
description: >-
  Design production-ready AWS VPC architectures with public/private subnets,
  NAT gateways, VPC endpoints, flow logs, and multi-AZ high availability
  patterns.
difficulty: intermediate
tags:
  - aws
  - vpc
  - architecture
  - design
  - security
  - api
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the AWS VPC Architecture Design skill?"
    answer: >-
      Design production-ready AWS VPC architectures with public/private
      subnets, NAT gateways, VPC endpoints, flow logs, and multi-AZ high
      availability patterns. It includes practical examples for AWS cloud
      development.
  - question: "What tools and setup does AWS VPC Architecture Design require?"
    answer: >-
      Requires Terraform CLI, Azure CLI installed. Works with AWS projects.
      Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# AWS VPC Architecture Design

## Overview
A well-designed VPC is the foundation of AWS security and networking. Proper subnet design, routing, and endpoint configuration determines the security posture, availability, and cost of your entire infrastructure.

## Why This Matters
- **Security** — network isolation is the first line of defense
- **Availability** — multi-AZ design survives AZ failures
- **Cost** — VPC endpoints save NAT gateway data processing fees
- **Compliance** — private subnets keep resources off the public internet

## Standard Three-Tier Architecture
```
VPC: 10.0.0.0/16

Public Subnets (ALB, NAT Gateway):
  10.0.1.0/24 (us-east-1a)
  10.0.2.0/24 (us-east-1b)
  10.0.3.0/24 (us-east-1c)

Private Subnets (App servers, containers):
  10.0.11.0/24 (us-east-1a)
  10.0.12.0/24 (us-east-1b)
  10.0.13.0/24 (us-east-1c)

Database Subnets (RDS, ElastiCache):
  10.0.21.0/24 (us-east-1a)
  10.0.22.0/24 (us-east-1b)
  10.0.23.0/24 (us-east-1c)
```

## Terraform Implementation
```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.5.0"

  name = "${var.project}-${var.environment}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
  database_subnets = ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment != "production"
  one_nat_gateway_per_az = var.environment == "production"

  enable_dns_hostnames = true
  enable_dns_support   = true

  enable_flow_log                      = true
  create_flow_log_cloudwatch_log_group = true
  create_flow_log_iam_role             = true

  tags = local.common_tags
}
```

## VPC Endpoints (Save NAT Gateway Costs)
```hcl
# Gateway endpoints (free)
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = module.vpc.vpc_id
  service_name = "com.amazonaws.us-east-1.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids = module.vpc.private_route_table_ids
}

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id       = module.vpc.vpc_id
  service_name = "com.amazonaws.us-east-1.dynamodb"
  vpc_endpoint_type = "Gateway"
  route_table_ids = module.vpc.private_route_table_ids
}

# Interface endpoints (for ECR, CloudWatch, etc.)
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.us-east-1.ecr.api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = module.vpc.private_subnets
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
}
```

## Security Groups
```hcl
# ALB: Allow HTTPS from internet
resource "aws_security_group" "alb" {
  vpc_id = module.vpc.vpc_id
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# App: Allow traffic only from ALB
resource "aws_security_group" "app" {
  vpc_id = module.vpc.vpc_id
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
}

# Database: Allow traffic only from App
resource "aws_security_group" "db" {
  vpc_id = module.vpc.vpc_id
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
}
```

## Best Practices
- Use /16 CIDR for VPCs to allow growth (65,536 IPs)
- Place resources in private subnets by default
- Use NAT gateway per AZ in production (redundancy)
- Use single NAT in dev/staging (cost savings)
- Enable VPC flow logs for security monitoring
- Use VPC endpoints for S3/DynamoDB to avoid NAT costs

## Common Mistakes
- Using /24 VPC CIDR (only 256 IPs, run out quickly)
- Placing application servers in public subnets
- Not enabling flow logs (no visibility into network traffic)
- Missing VPC endpoints (all S3 traffic goes through NAT = expensive)
