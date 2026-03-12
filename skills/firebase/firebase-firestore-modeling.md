---
id: firebase-firestore-modeling
stackId: firebase
type: skill
name: Design Firestore Data Models
description: >-
  Master Firestore data modeling — document structure, subcollections,
  denormalization, composite indexes, and query optimization for scalable NoSQL
  databases.
difficulty: intermediate
tags:
  - firestore
  - data-modeling
  - nosql
  - denormalization
  - indexes
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Firebase project with Firestore
  - Basic NoSQL understanding
faq:
  - question: How is Firestore data modeling different from SQL?
    answer: >-
      Firestore has no JOINs, so you denormalize data — store the author name
      inside each post document instead of referencing a users table. You model
      data around your queries: if you need to display posts with author names,
      put both in the same document. Read performance is proportional to result
      set, not collection size.
  - question: When should I use subcollections vs root collections in Firestore?
    answer: >-
      Use subcollections when data belongs to a parent and you primarily query
      within that parent (user's orders, post's comments). Use root collections
      when you need to query across all documents regardless of parent (all
      orders by date, all comments for moderation). Collection group queries can
      bridge both approaches.
  - question: How do I handle counters and aggregations in Firestore?
    answer: >-
      Use Cloud Functions triggers to maintain counter fields (likeCount,
      commentCount) when related documents are created or deleted. Do not rely
      on client-side counting or transactions — they do not scale. For complex
      aggregations, use Firestore's count() and sum() queries or Cloud Functions
      scheduled aggregations.
relatedItems:
  - firebase-security-architect
  - firebase-cloud-functions
  - firebase-auth-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Design Firestore Data Models

## Overview
Firestore data modeling requires thinking in documents and collections instead of tables and rows. The key principle: structure data for your queries, not for normalized relationships. Denormalization and subcollections are your primary tools.

## Why This Matters
- **Query performance** — reads are proportional to result set, not collection size
- **Cost efficiency** — fewer reads with denormalized data
- **Scalability** — Firestore scales automatically with proper modeling
- **Simplicity** — well-modeled data simplifies client code

## How It Works

### Step 1: Document & Collection Design
```
// BAD: Deep nesting
users/{userId}/posts/{postId}/comments/{commentId}/likes/{likeId}

// GOOD: Flat structure with references
users/{userId}
posts/{postId}
comments/{commentId}      // with postId field
likes/{likeId}            // with commentId field
```

### Step 2: Denormalize for Read Performance
```typescript
// Post document — includes author name (denormalized)
interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;      // Denormalized from users collection
  authorAvatar: string;    // Denormalized from users collection
  tags: string[];
  likeCount: number;       // Aggregation counter
  commentCount: number;    // Aggregation counter
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Avoids a JOIN — one read gets post + author info
```

### Step 3: Use Subcollections for Unbounded Lists
```typescript
// BAD: Array in document (limited to 1MB document size)
interface User {
  followers: string[];  // Breaks at 10K+ followers
}

// GOOD: Subcollection for unbounded data
// users/{userId}/followers/{followerId}
interface Follower {
  followerId: string;
  followedAt: Timestamp;
}
```

### Step 4: Composite Indexes
```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "published", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "authorId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Step 5: Aggregation with Counters
```typescript
// Use Cloud Functions to maintain counters
import { onDocumentCreated } from "firebase-functions/v2/firestore";

export const incrementCommentCount = onDocumentCreated(
  "comments/{commentId}",
  async (event) => {
    const postId = event.data?.data().postId;
    await getFirestore()
      .doc(`posts/${postId}`)
      .update({ commentCount: FieldValue.increment(1) });
  }
);
```

## Best Practices
- Model for queries, not relationships (denormalize when needed)
- Use subcollections for unbounded lists (comments, followers, activity)
- Keep documents under 1MB (Firestore limit)
- Maintain counters with Cloud Functions (not client-side transactions)
- Pre-define composite indexes in firestore.indexes.json
- Use collection group queries for cross-collection searches

## Common Mistakes
- Over-normalizing like a SQL database (requires expensive joins)
- Storing unbounded arrays in documents (hits 1MB limit)
- Not creating composite indexes (queries fail at runtime)
- Client-side aggregations instead of server-side counters
- Deep nesting subcollections (hard to query across collections)
