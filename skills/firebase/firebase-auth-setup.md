---
id: firebase-auth-setup
stackId: firebase
type: skill
name: Implement Firebase Authentication
description: >-
  Set up Firebase Authentication with multiple providers — email/password,
  Google, GitHub OAuth, custom tokens, and role-based access control with custom
  claims.
difficulty: beginner
tags:
  - authentication
  - firebase-auth
  - oauth
  - custom-claims
  - rbac
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Firebase project
  - Firebase SDK installed
faq:
  - question: How do Firebase custom claims work for role-based access?
    answer: >-
      Custom claims are key-value pairs embedded in the Firebase auth token
      (JWT). Set them with Admin SDK (setCustomUserClaims) via Cloud Functions.
      They are available in Security Rules (request.auth.token.admin) and client
      code (getIdTokenResult). Claims propagate on next token refresh (up to 1
      hour).
  - question: Should I store user roles in Firestore or custom claims?
    answer: >-
      Use custom claims for roles used in Security Rules (admin, moderator) —
      they are included in every auth token without extra database reads. Use
      Firestore for complex profile data (preferences, settings). Custom claims
      are limited to 1000 bytes total, so keep them minimal.
  - question: How do I handle auth state in a React Firebase app?
    answer: >-
      Use onAuthStateChanged in a React context provider. Create an AuthContext
      that wraps your app, observes auth state changes, and provides the current
      user and loading state to all components. This ensures your UI reacts to
      login, logout, and token refresh events.
relatedItems:
  - firebase-security-architect
  - firebase-firestore-modeling
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Implement Firebase Authentication

## Overview
Firebase Authentication provides drop-in auth with support for email/password, social providers (Google, GitHub, Apple), phone auth, and custom tokens. Custom claims enable role-based access control across your entire Firebase stack.

## Why This Matters
- **Pre-built UI** — FirebaseUI handles login flows with zero custom code
- **Multi-provider** — support Google, GitHub, Apple, phone, and email
- **Custom claims** — role-based access embedded in auth tokens
- **Security Rules integration** — auth state available in Firestore/Storage rules

## How It Works

### Step 1: Configure Auth Providers
```typescript
// firebase.ts — Initialize Firebase Auth
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
```

### Step 2: Implement Sign-In
```typescript
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Google sign-in
async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Email/password registration
async function registerWithEmail(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Email/password sign-in
async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}
```

### Step 3: Set Custom Claims (Admin SDK)
```typescript
// Cloud Function to set admin role
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";

export const setAdminRole = onCall(async (request) => {
  // Only existing admins can create new admins
  if (!request.auth?.token.admin) {
    throw new HttpsError("permission-denied", "Only admins can assign roles");
  }

  const { uid, role } = request.data;
  await getAuth().setCustomUserClaims(uid, { [role]: true });
  return { success: true };
});
```

### Step 4: Use Claims in Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin access
    match /admin/{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }

    // User can read own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId
        && request.resource.data.keys().hasOnly(['name', 'avatar', 'bio']);
    }
  }
}
```

### Step 5: Auth State Observer
```typescript
import { onAuthStateChanged, User } from "firebase/auth";

onAuthStateChanged(auth, (user: User | null) => {
  if (user) {
    // User is signed in
    console.log("Authenticated:", user.uid, user.email);
    // Access custom claims
    user.getIdTokenResult().then((token) => {
      if (token.claims.admin) {
        showAdminPanel();
      }
    });
  } else {
    // User is signed out
    redirectToLogin();
  }
});
```

## Best Practices
- Use onAuthStateChanged for reactive auth state management
- Set custom claims via Cloud Functions (never from client)
- Validate claims in both Security Rules AND client code
- Enable email verification for email/password signups
- Configure authorized domains in Firebase Console
- Use ID tokens for server-side verification (getIdToken())

## Common Mistakes
- Setting custom claims from client code (impossible and insecure)
- Not handling auth state changes reactively
- Trusting client-side role checks without Security Rules enforcement
- Not enabling email verification
- Storing roles in Firestore instead of custom claims (requires extra reads)
