---
id: firebase-security-rules-standards
stackId: firebase
type: rule
name: Firestore Security Rules Standards
description: >-
  Enforce secure Firestore Security Rules patterns — deny by default, field
  validation, ownership checks, custom functions, and mandatory testing
  requirements.
difficulty: intermediate
globs:
  - '**/firestore.rules'
  - '**/firebase.json'
  - '**/firestore.indexes.json'
tags:
  - security-rules
  - firestore
  - access-control
  - validation
  - firebase
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
  - question: What is the most important Firestore Security Rule?
    answer: >-
      Deny by default. Never use 'allow read, write: if true' or wildcard
      matches without conditions. Start with everything denied, then explicitly
      allow specific operations with authentication checks, field validation,
      and ownership verification for each collection.
  - question: How do I validate data in Firestore Security Rules?
    answer: >-
      Use request.resource.data to validate incoming writes. Check required
      fields with hasAll(), verify types with 'is string'/'is number', validate
      lengths with size(), and ensure ownership with request.auth.uid
      comparisons. Always validate that users cannot change fields they should
      not control (like authorId).
relatedItems:
  - firebase-security-architect
  - firebase-cloud-functions-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Firestore Security Rules Standards

## Rule
All Firestore collections MUST have explicit security rules. Default deny everything, then allow specific operations with proper authentication, validation, and ownership checks.

## Format
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions at top
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Collection-specific rules
    match /collection/{docId} {
      allow read: if <condition>;
      allow create: if <condition> && <validation>;
      allow update: if <condition> && <validation>;
      allow delete: if <condition>;
    }
  }
}
```

## Requirements

### Authentication
- ALL write operations MUST require authentication
- Public reads only for explicitly public collections
- Admin operations require custom claims verification

### Field Validation
```
allow create: if isAuthenticated()
  && request.resource.data.keys().hasAll(['title', 'content', 'authorId'])
  && request.resource.data.title is string
  && request.resource.data.title.size() > 0
  && request.resource.data.title.size() <= 200
  && request.resource.data.authorId == request.auth.uid;
```

### Ownership Verification
```
allow update: if isOwner(resource.data.authorId)
  && request.resource.data.authorId == resource.data.authorId;  // Cannot change author
```

## Examples

### Good
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return request.auth.token.admin == true;
    }

    match /posts/{postId} {
      allow read: if resource.data.published == true || isOwner(resource.data.authorId);
      allow create: if isAuthenticated()
        && request.resource.data.keys().hasAll(['title', 'content', 'authorId', 'published'])
        && request.resource.data.authorId == request.auth.uid
        && request.resource.data.title is string
        && request.resource.data.title.size() <= 200;
      allow update: if isOwner(resource.data.authorId) || isAdmin();
      allow delete: if isOwner(resource.data.authorId) || isAdmin();
    }
  }
}
```

### Bad
```
// NEVER DO THIS IN PRODUCTION
match /{document=**} {
  allow read, write: if true;
}

// No validation
match /posts/{postId} {
  allow write: if request.auth != null;  // No field validation!
}
```

## Enforcement
Test ALL rules with Firebase Emulator and @firebase/rules-unit-testing.
Run rule tests in CI before deploying.
Review security rules in every PR that modifies firestore.rules.
