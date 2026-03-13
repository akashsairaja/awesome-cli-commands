---
id: vercel-analytics-vitals
stackId: vercel
type: skill
name: >-
  Set Up Vercel Analytics & Web Vitals Monitoring
description: >-
  Configure Vercel Analytics and Speed Insights for real-user performance
  monitoring — Core Web Vitals, audience insights, and performance regression
  detection.
difficulty: intermediate
tags:
  - vercel
  - set
  - analytics
  - web
  - vitals
  - monitoring
  - performance
  - deployment
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Set Up Vercel Analytics & Web Vitals Monitoring skill?"
    answer: >-
      Configure Vercel Analytics and Speed Insights for real-user performance
      monitoring — Core Web Vitals, audience insights, and performance
      regression detection. This skill provides a structured workflow for
      deployment automation, edge functions, analytics, and monorepo
      configuration.
  - question: "What tools and setup does Set Up Vercel Analytics & Web Vitals Monitoring require?"
    answer: >-
      Requires npm/yarn/pnpm installed. Works with Vercel projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Set Up Vercel Analytics & Web Vitals Monitoring

## Overview
Vercel Analytics provides real-user monitoring (RUM) for Core Web Vitals, page views, and audience insights. Speed Insights tracks LCP, FID, CLS, INP, and TTFB across all pages to detect performance regressions before they impact users.

## Why This Matters
- **Real user data** — not synthetic benchmarks, actual user experience
- **Core Web Vitals** — directly impacts Google search ranking
- **Regression detection** — catch performance drops after deployments
- **Audience insights** — understand traffic patterns and user demographics

## How It Works

### Step 1: Install Analytics Package
```bash
npm install @vercel/analytics @vercel/speed-insights
```

### Step 2: Add to Root Layout
```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Step 3: Track Custom Events
```typescript
import { track } from '@vercel/analytics';

// Track button clicks, form submissions, etc.
function handlePurchase(productId: string, price: number) {
  track('purchase', { productId, price, currency: 'USD' });
}

function handleSignup(method: string) {
  track('signup', { method }); // 'google', 'email', 'github'
}
```

### Step 4: Monitor in Vercel Dashboard
```
Vercel Dashboard > Project > Analytics
- Page views, unique visitors, top pages
- Core Web Vitals: LCP, FID/INP, CLS, TTFB
- Performance scores by page and device type
- Geographic distribution of users
```

## Best Practices
- Enable both Analytics and Speed Insights (they serve different purposes)
- Set up alerts for Web Vitals regression after deployments
- Track meaningful custom events (purchases, signups, key interactions)
- Review performance by device type (mobile vs desktop)
- Use the data to prioritize performance optimization efforts
- Compare Web Vitals before and after each deployment

## Common Mistakes
- Installing analytics but never checking the dashboard
- Not tracking custom events for business-critical actions
- Ignoring mobile performance (often worse than desktop)
- Not setting up regression alerts for deployments
- Confusing Vercel Analytics (page views) with Speed Insights (performance)
