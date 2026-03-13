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
  - react
  - server
  - components
  - rsc
  - architecture
  - api
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the React Server Components (RSC) skill?"
    answer: >-
      Master React Server Components in React 19 — server-only rendering, zero
      client JavaScript, data fetching patterns, and the Server/Client
      component boundary. This skill provides a structured workflow for
      component architecture, state management, performance optimization, and
      UI patterns.
  - question: "What tools and setup does React Server Components (RSC) require?"
    answer: >-
      Works with standard React tooling (React 19+, JSX/TSX). No special setup
      required beyond a working React frontend environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
