---
id: aws-lambda-best-practices
stackId: aws
type: skill
name: AWS Lambda Best Practices
description: >-
  Build efficient AWS Lambda functions with proper memory sizing, cold start
  optimization, connection pooling, error handling, and observability using
  structured logging and X-Ray tracing.
difficulty: intermediate
tags:
  - lambda
  - serverless
  - cold-start
  - optimization
  - powertools
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
  - AWS account
  - Lambda basics
  - Node.js or Python
faq:
  - question: How do I reduce AWS Lambda cold start time?
    answer: >-
      Four key strategies: (1) Initialize SDK clients outside the handler. (2)
      Keep deployment packages small (under 50 MB). (3) Use provisioned
      concurrency for latency-sensitive functions. (4) Choose a fast runtime —
      Node.js and Python have faster cold starts than Java/.NET. Avoid
      VPC-attached Lambda unless necessary (adds ~1s cold start).
  - question: What is the best memory setting for AWS Lambda?
    answer: >-
      Start with 1769 MB which gives exactly 1 full vCPU. Lambda CPU scales
      linearly with memory, so 128 MB gets only 0.08 vCPU — often making
      execution slower AND more expensive. Use AWS Lambda Power Tuning to find
      the optimal memory/cost balance for your specific function.
relatedItems:
  - aws-iam-security-architect
  - aws-s3-security
version: 1.0.0
lastUpdated: '2026-03-11'
---

# AWS Lambda Best Practices

## Overview
AWS Lambda enables serverless computing but requires careful optimization for performance and cost. Proper memory configuration, cold start mitigation, connection management, and error handling make the difference between a fast, reliable function and one that is slow, expensive, and unreliable.

## Why This Matters
- **Cost** — Lambda charges per millisecond of execution time
- **Performance** — cold starts add 100ms-10s latency
- **Reliability** — proper error handling prevents silent failures
- **Observability** — structured logging enables debugging in production

## Memory and Performance Sizing
```bash
# Lambda CPU scales proportionally with memory
# 128 MB  = 0.08 vCPU
# 1024 MB = 0.58 vCPU
# 1769 MB = 1.0 vCPU (sweet spot for most workloads)
# 10240 MB = 6 vCPU

# Use AWS Lambda Power Tuning to find optimal memory
# https://github.com/alexcasalboni/aws-lambda-power-tuning
```

## Cold Start Optimization
```typescript
// Initialize outside the handler (runs once per cold start)
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Connection reused across invocations
const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

// Handler runs on every invocation
export const handler = async (event: APIGatewayEvent) => {
  // Use the pre-initialized client
  const result = await dynamo.send(new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: { id: event.pathParameters?.id },
  }));

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
  };
};
```

## Error Handling
```typescript
export const handler = async (event: SQSEvent) => {
  const failedRecords: SQSBatchItemFailure[] = [];

  for (const record of event.Records) {
    try {
      await processRecord(JSON.parse(record.body));
    } catch (error) {
      console.error("Failed to process record", {
        messageId: record.messageId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      failedRecords.push({ itemIdentifier: record.messageId });
    }
  }

  // Partial batch failure — only retry failed records
  return { batchItemFailures: failedRecords };
};
```

## Structured Logging
```typescript
import { Logger } from "@aws-lambda-powertools/logger";

const logger = new Logger({ serviceName: "payment-api" });

export const handler = async (event: APIGatewayEvent) => {
  logger.addContext({ requestId: event.requestContext.requestId });
  logger.info("Processing payment", { orderId: event.pathParameters?.id });

  try {
    const result = await processPayment(event);
    logger.info("Payment processed", { result });
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    logger.error("Payment failed", { error });
    return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) };
  }
};
```

## Best Practices
- Initialize SDK clients outside the handler (reuse connections)
- Use Lambda Powertools for structured logging, tracing, and metrics
- Set memory to 1769 MB (1 full vCPU) as a starting point, then tune
- Use provisioned concurrency for latency-sensitive functions
- Enable partial batch failure reporting for SQS triggers
- Keep deployment packages small (use layers for large dependencies)
- Set appropriate timeout (not max 15 min — match expected duration)

## Common Mistakes
- Initializing SDK clients inside the handler (new connection per invocation)
- Using 128 MB memory (minimum CPU, slow execution, often MORE expensive)
- Not using environment variables for configuration
- Catching errors without logging them (silent failures)
- Setting timeout to 15 minutes for functions that should complete in seconds
