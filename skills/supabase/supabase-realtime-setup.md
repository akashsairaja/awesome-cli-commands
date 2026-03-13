---
id: supabase-realtime-setup
stackId: supabase
type: skill
name: Build Real-Time Features with Supabase Realtime
description: >-
  Implement real-time subscriptions with Supabase — database changes, presence
  tracking, broadcast messaging, and optimistic UI updates for collaborative
  applications.
difficulty: intermediate
tags:
  - supabase
  - build
  - real-time
  - features
  - realtime
  - security
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Build Real-Time Features with Supabase Realtime skill?"
    answer: >-
      Implement real-time subscriptions with Supabase — database changes,
      presence tracking, broadcast messaging, and optimistic UI updates for
      collaborative applications. This skill provides a structured workflow
      for auth configuration, database migrations, real-time subscriptions,
      and edge functions.
  - question: "What tools and setup does Build Real-Time Features with Supabase Realtime require?"
    answer: >-
      Works with standard Supabase tooling (Supabase CLI, Supabase Dashboard).
      No special setup required beyond a working Supabase platform
      environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Build Real-Time Features with Supabase Realtime

## Overview
Supabase Realtime provides three real-time primitives: database change listeners (Postgres Changes), presence tracking, and broadcast messaging. Build collaborative apps, live dashboards, and chat features without managing WebSocket infrastructure.

## Why This Matters
- **Live updates** — see database changes instantly across clients
- **Presence** — track who is online and their state
- **Broadcast** — send messages between clients without database writes
- **RLS integration** — real-time subscriptions respect Row Level Security

## How It Works

### Step 1: Subscribe to Database Changes
```typescript
import { supabase } from '@/lib/supabase';

// Listen for new posts
const channel = supabase
  .channel('posts-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'posts',
      filter: 'published=eq.true',
    },
    (payload) => {
      console.log('New post:', payload.new);
      setPosts((prev) => [payload.new, ...prev]);
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'posts',
    },
    (payload) => {
      setPosts((prev) =>
        prev.map((p) => (p.id === payload.new.id ? payload.new : p))
      );
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

### Step 2: Presence Tracking
```typescript
const channel = supabase.channel('room-1');

// Track presence
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    setOnlineUsers(Object.values(state).flat());
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', newPresences);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', leftPresences);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: user.id,
        username: user.name,
        online_at: new Date().toISOString(),
      });
    }
  });
```

### Step 3: Broadcast Messaging
```typescript
const channel = supabase.channel('chat-room');

// Send message (no database write)
channel.send({
  type: 'broadcast',
  event: 'message',
  payload: { text: 'Hello!', userId: user.id },
});

// Receive messages
channel
  .on('broadcast', { event: 'message' }, (payload) => {
    setMessages((prev) => [...prev, payload.payload]);
  })
  .subscribe();
```

### Step 4: React Hook for Real-Time
```typescript
function useRealtimePosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Initial fetch
    supabase.from('posts').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setPosts(data || []));

    // Real-time subscription
    const channel = supabase
      .channel('posts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts((prev) => [payload.new as Post, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPosts((prev) => prev.map((p) => p.id === payload.new.id ? payload.new as Post : p));
          } else if (payload.eventType === 'DELETE') {
            setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return posts;
}
```

## Best Practices
- Always clean up subscriptions when components unmount
- Use filters to reduce the volume of real-time events
- Combine initial fetch with real-time subscription for complete data
- Use presence for collaborative features (cursors, typing indicators)
- Use broadcast for ephemeral messages that do not need persistence
- Enable Realtime on specific tables in Supabase dashboard

## Common Mistakes
- Not cleaning up channels (memory leaks, duplicate events)
- Subscribing without filters (receiving all table changes)
- Forgetting to enable Realtime on the table in Supabase dashboard
- Using database changes when broadcast would suffice (unnecessary writes)
- Not handling reconnection scenarios gracefully
