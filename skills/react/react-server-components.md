---
id: react-server-components
stackId: react
type: skill
name: React Server Components (RSC)
description: >-
  Master React Server Components in React 19 — server-only rendering, zero
  client JavaScript, data fetching patterns, and the Server/Client component
  boundary.
difficulty: intermediate
tags:
  - server-components
  - react-19
  - ssr
  - data-fetching
  - server-actions
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
  - javascript
prerequisites:
  - React 19
  - Next.js 15 (or React framework with RSC support)
faq:
  - question: What are React Server Components?
    answer: >-
      React Server Components (RSC) are components that render exclusively on
      the server. They produce HTML with zero JavaScript sent to the client, can
      directly access databases and file systems, and support async/await for
      data fetching. They are the default component type in Next.js App Router.
  - question: When should I use 'use client' in React?
    answer: >-
      Add 'use client' only when a component needs interactivity: useState,
      useEffect, event handlers (onClick, onChange), browser APIs (localStorage,
      window), or third-party client libraries. Keep 'use client' components as
      small leaf nodes — everything else should remain a Server Component.
  - question: Can Server Components replace API routes?
    answer: >-
      For data fetching, yes — Server Components can directly query databases
      and call internal APIs without an API route intermediary. For mutations,
      Server Actions replace API routes. You still need API routes for webhooks,
      third-party integrations, and endpoints consumed by non-React clients
      (mobile apps, external services).
relatedItems:
  - react-performance-optimization
  - react-hooks-patterns
  - react-testing-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# React Server Components (RSC)

## Overview
React Server Components render exclusively on the server, sending HTML to the client with zero JavaScript bundle impact. They can directly access databases, file systems, and APIs without exposing credentials to the browser.

## Why This Matters
- **Zero bundle size** — Server Components add no JavaScript to the client
- **Direct backend access** — query databases, read files without API routes
- **Streaming** — send HTML progressively as data loads
- **Simplified architecture** — eliminate client-side data fetching waterfalls

## Step 1: Understand the Component Boundary
```tsx
// Server Component (default in Next.js App Router)
// No "use client" directive — runs ONLY on the server
async function ProductPage({ params }: { params: { id: string } }) {
  // Direct database access — no API route needed
  const product = await db.products.findById(params.id);
  const reviews = await db.reviews.findByProduct(params.id);

  return (
    <main>
      <ProductDetails product={product} />
      <ReviewList reviews={reviews} />
      {/* Client Component for interactivity */}
      <AddToCartButton productId={product.id} price={product.price} />
    </main>
  );
}
```

```tsx
// Client Component — needs interactivity
"use client";
import { useState } from 'react';

function AddToCartButton({ productId, price }: Props) {
  const [quantity, setQuantity] = useState(1);
  return (
    <div>
      <input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)} />
      <button onClick={() => addToCart(productId, quantity)}>
        Add to Cart — ${price * quantity}
      </button>
    </div>
  );
}
```

## Step 2: Data Fetching in Server Components
```tsx
// Fetch data directly — no useEffect, no loading state needed
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId); // Runs on server only

  return (
    <section>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={userId} />
      </Suspense>
    </section>
  );
}

// Parallel data fetching with Suspense
async function UserPosts({ userId }: { userId: string }) {
  const posts = await getPosts(userId); // Streams while other content is visible
  return <PostList posts={posts} />;
}
```

## Step 3: Server Actions for Mutations
```tsx
// Server Action — runs on the server, callable from client
async function updateProfile(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  await db.users.update({ name });
  revalidatePath("/profile");
}

// Use in a form — works without JavaScript (progressive enhancement)
function ProfileForm({ user }) {
  return (
    <form action={updateProfile}>
      <input name="name" defaultValue={user.name} />
      <button type="submit">Save</button>
    </form>
  );
}
```

## Best Practices
- Default to Server Components — add "use client" only when needed
- Keep Client Components at the leaves of the component tree
- Pass serializable props from Server to Client Components
- Use Suspense boundaries for independent data fetching
- Avoid passing functions as props to Client Components (not serializable)
- Use Server Actions for mutations instead of API routes

## Common Mistakes
- Adding "use client" to every component (loses all RSC benefits)
- Importing client-only libraries in Server Components (hooks, browser APIs)
- Trying to use useState/useEffect in Server Components
- Not using Suspense for async Server Components (blocking the whole page)
