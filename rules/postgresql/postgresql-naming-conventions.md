---
id: postgresql-naming-conventions
stackId: postgresql
type: rule
name: PostgreSQL Naming Conventions
description: >-
  Enforce consistent naming standards for PostgreSQL tables, columns, indexes,
  constraints, and functions — snake_case everywhere, explicit constraint names,
  and predictable patterns.
difficulty: beginner
globs:
  - '**/*.sql'
  - '**/migrations/**'
  - '**/migrate/**'
tags:
  - naming-conventions
  - snake-case
  - schema-design
  - standards
  - postgresql
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
  - question: Why use snake_case for PostgreSQL naming?
    answer: >-
      PostgreSQL folds unquoted identifiers to lowercase. If you use PascalCase
      like 'OrderItems', it becomes 'orderitems' unless you quote it everywhere.
      Snake_case (order_items) is the natural PostgreSQL convention — readable,
      consistent, and never requires quoting.
  - question: Why should I name constraints explicitly in PostgreSQL?
    answer: >-
      Auto-generated constraint names like 'orders_user_id_fkey' are
      unpredictable across environments and hard to reference in migrations.
      Explicit names like 'fk_orders_users' are readable, consistent, and make
      ALTER TABLE ... DROP CONSTRAINT statements clear and maintainable.
relatedItems:
  - postgresql-migration-safety
  - postgresql-database-architect
  - database-naming-conventions
version: 1.0.0
lastUpdated: '2026-03-11'
---

# PostgreSQL Naming Conventions

## Rule
All database objects MUST use snake_case naming with explicit, descriptive names. Never rely on auto-generated constraint names.

## Format
```
Tables:       plural snake_case          → users, order_items, user_roles
Columns:      singular snake_case        → first_name, created_at, is_active
Primary keys: id                         → users.id (always "id")
Foreign keys: {referenced_table}_id      → orders.user_id
Indexes:      idx_{table}_{columns}      → idx_users_email
Unique:       uniq_{table}_{columns}     → uniq_users_email
Check:        chk_{table}_{description}  → chk_products_positive_price
Foreign key:  fk_{table}_{ref_table}     → fk_orders_users
Functions:    verb_noun                   → get_user_by_email, calculate_total
Enums:        {name}_type                → status_type, role_type
Sequences:    {table}_{column}_seq       → users_id_seq
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
  CONSTRAINT chk_order_items_positive_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_items_positive_price CHECK (unit_price > 0)
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);
```

### Bad
```sql
CREATE TABLE OrderItem (             -- PascalCase
  OrderItemID SERIAL PRIMARY KEY,    -- PascalCase, redundant prefix
  OrderID INTEGER,                   -- No foreign key constraint
  Qty INTEGER,                       -- Abbreviated
  Price FLOAT,                       -- FLOAT for money
  -- No explicit constraint names
  FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
);
```

## Enforcement
Use a linter like squawk or sqlfluff to enforce naming conventions in CI. Add migration review as a required step in your PR process.
