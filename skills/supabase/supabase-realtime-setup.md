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
  - realtime
  - websocket
  - presence
  - broadcast
  - live-updates
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Supabase project with Realtime enabled
  - React/Next.js application
faq:
  - question: What are the three real-time primitives in Supabase?
    answer: >-
      Supabase Realtime provides three primitives: (1) Postgres Changes — listen
      for INSERT, UPDATE, DELETE events on database tables. (2) Presence — track
      online users and their state. (3) Broadcast — send messages between
      clients without database writes. All three use WebSocket connections
      managed by Supabase.
  - question: Does Supabase Realtime respect Row Level Security?
    answer: >-
      Yes. Real-time subscriptions to Postgres Changes are filtered by RLS
      policies. Users only receive events for rows they have permission to read.
      This means you can safely subscribe to table changes without worrying
      about unauthorized data leaking through real-time events.
  - question: When should I use broadcast vs database changes in Supabase?
    answer: >-
      Use broadcast for ephemeral data that does not need persistence — typing
      indicators, cursor positions, temporary notifications. Use database
      changes when the data must be stored permanently — new messages, updated
      records, deleted items. Broadcast is faster since it skips the database
      entirely.
relatedItems:
  - supabase-auth-setup
  - supabase-rls-architect
version: 1.0.0
lastUpdated: '2026-03-11'
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
