---
id: database-schema-standards
stackId: database
type: rule
name: Database Schema Design Standards
description: >-
  Enforce universal database schema standards — primary key requirements, NOT
  NULL defaults, timestamp columns, constraint naming, and data type selection
  rules for any SQL database.
difficulty: beginner
globs:
  - '**/*.sql'
  - '**/migrations/**'
  - '**/prisma/**'
tags:
  - schema-design
  - constraints
  - data-types
  - not-null
  - standards
  - database
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
languages:
  - sql
faq:
  - question: Why should database columns be NOT NULL by default?
    answer: >-
      NULL introduces three-valued logic (true, false, NULL) which causes subtle
      bugs: NULL != NULL, aggregations skip NULLs silently, and application code
      needs null checks everywhere. Only allow NULL when the absence of a value
      has specific business meaning (e.g., cancelled_at is NULL means 'not
      cancelled').
  - question: Why should I use NUMERIC instead of FLOAT for money in databases?
    answer: >-
      FLOAT uses binary floating-point which cannot represent decimal fractions
      exactly. 0.1 + 0.2 = 0.30000000000000004 in FLOAT. NUMERIC/DECIMAL stores
      exact decimal values. For money, use NUMERIC(10,2) or store as integer
      cents (499 = $4.99). Never use FLOAT or DOUBLE for financial data.
relatedItems:
  - database-design-architect
  - database-migration-patterns
  - postgresql-naming-conventions
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Database Schema Design Standards

## Rule
Every database table MUST have a primary key, audit timestamps, appropriate NOT NULL constraints, and explicitly named constraints.

## Format
```sql
CREATE TABLE {table_name} (
  id {key_type} PRIMARY KEY,
  -- business columns with NOT NULL by default
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Requirements

### 1. Every Table Has a Primary Key
```sql
-- GOOD: Explicit primary key
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE
);

-- BAD: No primary key
CREATE TABLE logs (
  message TEXT,
  created_at TIMESTAMP
);
```

### 2. NOT NULL by Default
```sql
-- GOOD: Only allow NULL when absence of data is meaningful
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  cancelled_at TIMESTAMPTZ,  -- NULL means "not cancelled" (meaningful)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BAD: Everything nullable
CREATE TABLE orders (
  id SERIAL,
  user_id INTEGER,    -- Can orders exist without a user?
  total DECIMAL       -- Can orders have no total?
);
```

### 3. Correct Data Types
```sql
-- Money: NUMERIC, never FLOAT
total NUMERIC(10,2) NOT NULL      -- GOOD
total FLOAT                        -- BAD: precision loss

-- Boolean: native boolean type
is_active BOOLEAN NOT NULL DEFAULT true  -- GOOD
is_active INTEGER DEFAULT 1               -- BAD: use real booleans

-- Text: TEXT with CHECK constraints
email TEXT NOT NULL CHECK (length(email) <= 255)  -- GOOD
email VARCHAR(255)                                  -- OK but TEXT + CHECK is more flexible

-- Timestamps: always with timezone
created_at TIMESTAMPTZ NOT NULL    -- GOOD
created_at TIMESTAMP               -- BAD: no timezone
```

### 4. Audit Columns on Every Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Examples

### Good
```sql
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_order_items_orders FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_order_items_products FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_items_price CHECK (unit_price >= 0)
);
```

### Bad
```sql
CREATE TABLE OrderItem (
  OrderItemId INT AUTO_INCREMENT,
  OrderId INT,
  Amount FLOAT,
  PRIMARY KEY (OrderItemId)
);
```

## Enforcement
Use a SQL linter (squawk, sqlfluff) in CI to enforce schema standards. Require migration review in pull requests.
