# lib/ - Configuration & Integrations

This directory contains configuration, client instances, and external service integrations.

## What Belongs Here

- Client instances (auth, database, API clients)
- TanStack Query client setup (`QueryClient` configuration, provider)
- Environment configuration (t3-env)
- Framework adapters and integrations
- Shared schemas for external libraries (nuqs, zod schemas)
- Service configuration

## What Does NOT Belong Here

These belong in `utils/` instead:

- Pure helper functions (string manipulation, formatting)
- Stateless transformations
- Math utilities

## Rules

### Configuration Over Implementation

Files here configure and export instances, not implement business logic:

```typescript
// ✅ Good: Configuration
import { createAuthClient } from "better-auth/client"
export const authClient = createAuthClient({ ... })

// ❌ Bad: Business logic (belongs in features/)
export async function loginUser(email: string, password: string) {
  // ... implementation
}
```

### Centralized Exports

Each integration should have a single entry point:

```typescript
// lib/auth-client.ts - Single source of truth
export const authClient = createAuthClient({ ... })

// Components import from here
import { authClient } from '@/lib/auth-client'
```

### TanStack Query Client

The `QueryClient` instance and provider live in `lib/`, not in features:

```typescript
// lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}
```

Query option factories (the `queryOptions()` objects) do NOT belong here — they live in `features/[feature]/queries.ts`. See `features/AGENTS.md`.
