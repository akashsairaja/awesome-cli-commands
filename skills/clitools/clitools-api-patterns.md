---
id: clitools-api-patterns
stackId: clitools
type: skill
name: API Patterns
description: >-
  > API design principles and decision-making for 2025. > **Learn to THINK,
  not copy fixed patterns.** **Read ONLY files relevant to the request!**
  Check the content map, find what you need.
difficulty: beginner
tags:
  - clitools
  - api
  - patterns
  - security
  - testing
  - best-practices
  - type-safety
compatibility:
  - claude-code
faq:
  - question: "When should I use the API Patterns skill?"
    answer: >-
      > API design principles and decision-making for 2025. > **Learn to
      THINK, not copy fixed patterns.** **Read ONLY files relevant to the
      request!** Check the content map, find what you need. This skill
      provides a structured workflow for API design, documentation,
      architecture patterns, and development workflows.
  - question: "What tools and setup does API Patterns require?"
    answer: >-
      Works with standard CLI & Dev Tools tooling (various CLI tools, code
      generators). No special setup required beyond a working developer
      tooling environment.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# API Patterns

> API design principles and decision-making for 2025.
> **Learn to THINK, not copy fixed patterns.**

## 🎯 Selective Reading Rule

**Read ONLY files relevant to the request!** Check the content map, find what you need.

---

## 📑 Content Map

| File | Description | When to Read |
|------|-------------|--------------|
| `api-style.md` | REST vs GraphQL vs tRPC decision tree | Choosing API type |
| `rest.md` | Resource naming, HTTP methods, status codes | Designing REST API |
| `response.md` | Envelope pattern, error format, pagination | Response structure |
| `graphql.md` | Schema design, when to use, security | Considering GraphQL |
| `trpc.md` | TypeScript monorepo, type safety | TS fullstack projects |
| `versioning.md` | URI/Header/Query versioning | API evolution planning |
| `auth.md` | JWT, OAuth, Passkey, API Keys | Auth pattern selection |
| `rate-limiting.md` | Token bucket, sliding window | API protection |
| `documentation.md` | OpenAPI/Swagger best practices | Documentation |
| `security-testing.md` | OWASP API Top 10, auth/authz testing | Security audits |

---

## 🔗 Related Skills

| Need | Skill |
|------|-------|
| API implementation | `@[skills/backend-development]` |
| Data structure | `@[skills/database-design]` |
| Security details | `@[skills/security-hardening]` |

---

## ✅ Decision Checklist

Before designing an API:

- [ ] **Asked user about API consumers?**
- [ ] **Chosen API style for THIS context?** (REST/GraphQL/tRPC)
- [ ] **Defined consistent response format?**
- [ ] **Planned versioning strategy?**
- [ ] **Considered authentication needs?**
- [ ] **Planned rate limiting?**
- [ ] **Documentation approach defined?**

---

## ❌ Anti-Patterns

**DON'T:**
- Default to REST for everything
- Use verbs in REST endpoints (/getUsers)
- Return inconsistent response formats
- Expose internal errors to clients
- Skip rate limiting

**DO:**
- Choose API style based on context
- Ask about client requirements
- Document thoroughly
- Use appropriate status codes

---

## Script

| Script | Purpose | Command |
|--------|---------|---------|
| `scripts/api_validator.py` | API endpoint validation | `python scripts/api_validator.py <project_path>` |


## When to Use
This skill is applicable to execute the workflow or actions described in the overview.
