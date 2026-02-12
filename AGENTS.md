# Project Architecture

> Adapted from [Bulletproof React](https://github.com/alan2207/bulletproof-react) for Next.js App Router

## Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript (strict)

## Project Structure

```
.
├── app/                    # Next.js App Router (routes, layouts, pages)
├── components/             # Shared UI components
│   └── ui/                 # shadcn/ui components
├── features/               # Feature-based modules
│   └── [feature]/
│       ├── components/     # Feature-specific components
│       ├── hooks/          # Feature-specific hooks
│       ├── types/          # Feature-specific types
│       └── utils/          # Feature-specific utilities
├── hooks/                  # Shared hooks
├── lib/                    # Configuration & integrations
├── utils/                  # Pure helper functions
├── types/                  # Shared TypeScript types
└── public/                 # Static assets
```

### lib/ vs utils/

| `lib/`                       | `utils/`                       |
| ---------------------------- | ------------------------------ |
| Configuration & integrations | Pure helper functions          |
| Client instances (auth, db)  | String manipulation            |
| Environment setup            | Date formatting                |
| Framework adapters           | Array/object helpers           |
| Schemas (nuqs, zod)          | Formatting (currency, numbers) |

See `lib/AGENTS.md` and `utils/AGENTS.md` for details and examples.

## Core Principles

### 1. Feature-Based Organization

Organize code by feature, not by type. Each feature is self-contained.
See `features/AGENTS.md` for structure and examples.

### 2. Unidirectional Code Flow

Code flows in one direction: `shared → features → app`

```
✅ app/ can import from features/, components/, lib/, hooks/
✅ features/ can import from components/, lib/, hooks/
✅ components/ can import from lib/, hooks/
❌ features/ cannot import from app/
❌ components/ cannot import from features/
❌ features/ cannot import from other features/
```

### 3. No Cross-Feature Imports

Features should not import from each other. Compose features at the app level.
See `features/AGENTS.md` for detailed examples.

### 4. Colocate Related Code

Keep components, hooks, types close to where they're used:

- Feature-specific code → `features/[feature]/`
- Shared across features → `components/`, `hooks/`, `lib/`

### 5. No Barrel Files

Do NOT create `index.ts` barrel files for re-exporting. Import directly from the source file:

```tsx
// ❌ Bad: Barrel file re-exports
// features/auth/components/index.ts
export { LoginForm } from "./login-form";
export { UserButton } from "./user-button";

// ❌ Bad: Importing from barrel
import { UserButton } from "@/features/auth/components";

// ✅ Good: Direct imports
import { UserButton } from "@/features/auth/components/user-button";
```

### 6. Server Components by Default

Prefer Server Components in Next.js App Router. Use Client Components only when needed.
See `app/AGENTS.md` for detailed guidance.

### 7. Icon Conventions

See `components/AGENTS.md` for Lucide icon import and sizing conventions.

## State Management

### State Categories

| Type             | Where          | Example                            |
| ---------------- | -------------- | ---------------------------------- |
| **Server State** | TanStack Query | API data, GitHub PRs, team members |
| **URL State**    | nuqs           | `/projects/123`, `?filter=active`  |
| **Form State**   | TanStack Form  | Form inputs, validation            |
| **UI State**     | zustand        | Modals, sidebars, shared toggles   |

### Server State with TanStack Query

Use [TanStack Query](https://tanstack.com/query) for all server/async state. Follow [TkDodo's query options API](https://tkdodo.eu/blog/the-query-options-api) pattern.

#### Query Options over Custom Hooks

Do NOT wrap `useQuery` in custom hooks. Instead, define query option factories using `queryOptions()` and pass them directly:

```tsx
// ❌ Bad: Custom hook wrapper adds no value
function useReviewRequests() {
  return useQuery({
    queryKey: ["reviews", "assigned"],
    queryFn: fetchAssignedReviews,
  });
}

// ✅ Good: Query options factory — reusable across useQuery, prefetch, invalidation
import { queryOptions } from "@tanstack/react-query";

const assignedReviewsOptions = () =>
  queryOptions({
    queryKey: ["reviews", "assigned"],
    queryFn: fetchAssignedReviews,
    staleTime: 5 * 60 * 1000,
  });

// Usage in components
const query = useQuery(assignedReviewsOptions());

// Usage for prefetching
queryClient.prefetchQuery(assignedReviewsOptions());

// Usage for invalidation
queryClient.invalidateQueries({ queryKey: assignedReviewsOptions().queryKey });
```

#### Always Use Functions

Every query option entry MUST be a function, even if it currently takes no parameters. This keeps the API consistent and makes it easy to add parameters later without changing call sites:

```tsx
// ❌ Bad: Bare object — breaks if you need to add params later
const assignedReviewsOptions = queryOptions({
  queryKey: ["reviews", "assigned"],
  queryFn: fetchAssignedReviews,
});

// ✅ Good: Function — consistent, future-proof
const assignedReviewsOptions = () =>
  queryOptions({
    queryKey: ["reviews", "assigned"],
    queryFn: fetchAssignedReviews,
  });
```

#### Query Key Factory Pattern

Organize related queries into a factory object per feature. Every entry is a function — key-only entries return arrays, data-fetching entries return `queryOptions()`:

```tsx
// features/reviews/queries.ts
import { queryOptions } from "@tanstack/react-query";

export const reviewQueries = {
  all: () => ["reviews"],
  assigned: () =>
    queryOptions({
      queryKey: [...reviewQueries.all(), "assigned"],
      queryFn: fetchAssignedReviews,
      staleTime: 5 * 60 * 1000,
    }),
  teamPRs: (teamSlug: string) =>
    queryOptions({
      queryKey: [...reviewQueries.all(), "team-prs", teamSlug],
      queryFn: () => fetchTeamPRs(teamSlug),
      staleTime: 5 * 60 * 1000,
    }),
  needsTeamReview: (org: string, teamSlug: string) =>
    queryOptions({
      queryKey: [...reviewQueries.all(), "needs-team-review", org, teamSlug],
      queryFn: () => fetchNeedsTeamReview(org, teamSlug),
      staleTime: 5 * 60 * 1000,
    }),
};
```

```tsx
// Usage in components — clean, type-safe, composable
const query = useQuery(reviewQueries.assigned());
const teamQuery = useQuery(reviewQueries.teamPRs("my-team"));

// Invalidate all review queries at once
queryClient.invalidateQueries({ queryKey: reviewQueries.all() });
```

#### Where Query Factories Live

Query factories live in `features/[feature]/queries.ts` — colocated with the feature. See `features/AGENTS.md` for details.

#### TanStack Query Rules

- **Query options over hooks** — use `queryOptions()` factories, not `useXxx` wrappers
- **Always functions** — every factory entry is a function, even with zero params
- **One factory per feature** — `features/[feature]/queries.ts`
- **Hierarchical keys** — enables granular invalidation (`reviewQueries.all()` invalidates everything under `["reviews"]`)
- **Type-safe keys** — `queryOptions()` tags keys with return types, so `getQueryData(opts.queryKey)` is typed
- **`staleTime` in the factory** — colocate cache config with the query definition, not at the call site

### URL State with nuqs

Use [nuqs](https://nuqs.47ng.com/) for type-safe URL state management:

```tsx
"use client";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

export function ProjectFilters() {
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  return <Input value={search} onChange={(e) => setSearch(e.target.value)} />;
}
```

For multiple related params, use `useQueryStates`:

```tsx
const [filters, setFilters] = useQueryStates({
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(["active", "archived"]).withDefault("active"),
  page: parseAsInteger.withDefault(1),
});
```

### UI State with zustand

Use [zustand](https://zustand-demo.pmnd.rs/) for client-side UI state that needs to be shared across components.

Following [TkDodo's patterns](https://tkdodo.eu/blog/working-with-zustand):

```tsx
// stores/ui-store.ts
import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  // ⬇️ separate namespace for actions
  actions: {
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
  };
}

// ⬇️ not exported - no one can subscribe to entire store
const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  actions: {
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
  },
}));

// ⬇️ export atomic selectors - one hook per piece of state
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);

// ⬇️ export actions separately - they never change, so no re-renders
export const useUIActions = () => useUIStore((state) => state.actions);
```

```tsx
// Usage in components
"use client";

import { useSidebarOpen, useUIActions } from "@/stores/ui-store";

export function Sidebar() {
  const sidebarOpen = useSidebarOpen();
  const { toggleSidebar } = useUIActions();

  if (!sidebarOpen) return null;
  return <aside>...</aside>;
}
```

**Zustand rules:**

- **Don't export the store** - only export custom hooks with selectors
- **Atomic selectors** - one hook per piece of state, not `{ a, b } = useStore()`
- **Separate actions** - put in `actions` namespace, export via single `useActions` hook
- **Actions as events** - `toggleSidebar()` not `setSidebarOpen(!open)`
- **Small stores** - multiple focused stores, not one giant store

**When to use zustand vs useState:**

- `useState` - Local component state, simple toggles, counters
- `zustand` - Shared across multiple components (modals, sidebars, toasts)

**Form State Rules:**

- Use TanStack Form for form inputs and validation
- Never hook individual form fields to `useState` - use form libraries instead

### TanStack Form Pattern

#### Validation Schema at Top

Define Zod schemas at the top of the file for reusability and clarity:

```tsx
// features/events/components/event-create-form.tsx
"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const EventCreateFormSchema = z.object({
  name: z.string().trim().min(1, "Event name is required"),
  date: z.string(),
});
```

#### Global Validation

Use `validators.onSubmit` for schema-level validation instead of field-level validators:

```tsx
const form = useForm({
  defaultValues: {
    name: "",
    date: "",
  },
  validators: {
    onSubmit: EventCreateFormSchema, // ✅ Global validation on submit
  },
  onSubmit: async ({ value }) => {
    // value is type-safe and validated
    const res = await createEvent({
      name: value.name.trim(),
      date: value.date ? new Date(value.date).getTime() : undefined,
    });
    // Handle success...
  },
});
```

#### Use Field Components

Import Field components from `@/components/ui/field`:

```tsx
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

<form.Field name="name">
  {(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Event Name</FieldLabel>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
        />
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </Field>
    );
  }}
</form.Field>;
```

#### No Children Prop

Form components are self-contained—they don't accept children. Instead, they manage the entire form state and UI:

```tsx
// ✅ Good: Self-contained form component
export function EventCreateForm() {
  const form = useForm({
    /* ... */
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="name">{/* ... */}</form.Field>
      <form.Field name="date">{/* ... */}</form.Field>
      <form.Subscribe selector={(state) => [state.canSubmit]}>
        {([canSubmit]) => <button disabled={!canSubmit}>Submit</button>}
      </form.Subscribe>
    </form>
  );
}

// ❌ Bad: Don't pass children—form manages its own rendering
export function EventCreateForm({ children }) {
  // This pattern defeats the purpose of form state management
}
```

#### Subscribe for Submit Button State

Use `form.Subscribe` to react to form state changes like `canSubmit`:

```tsx
<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
  {([canSubmit, isSubmitting]) => (
    <Button type="submit" disabled={!canSubmit || isSubmitting}>
      {isSubmitting ? <Loader2Icon className="animate-spin" /> : "Submit"}
    </Button>
  )}
</form.Subscribe>
```

### Key Rules

1. **URL is state** - use nuqs for filters, pagination, search
2. **Lift state only when necessary** - start local, elevate if needed
3. **Avoid global state** unless truly global (theme, auth)

## Error Handling

1. Use Error Boundaries for recoverable UI errors
2. Prefer `@/utils/try-catch` utility for async operations (see `utils/AGENTS.md`)
3. Use `error.tsx` files for route-level error handling
4. Track errors in production with tools like Sentry

## Testing Strategy

| Type        | Tool                     | Focus                            |
| ----------- | ------------------------ | -------------------------------- |
| Unit        | Vitest                   | Utilities, hooks, pure functions |
| Integration | Vitest + Testing Library | Features, component interactions |
| E2E         | Playwright               | Critical user flows              |

## Environment Variables

Use **t3 env** for type-safe environment variable validation in `src/` code only:

```typescript
// src/lib/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SECRET_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    SECRET_KEY: process.env.SECRET_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
```

See `lib/AGENTS.md` for detailed environment variable patterns.

## Library Usage

Before using library APIs, verify current syntax to avoid deprecated patterns.

### Documentation Sources

| Library        | llms.txt                           | Context7 ID            |
| -------------- | ---------------------------------- | ---------------------- |
| Zod            | `https://zod.dev/llms.txt`         | `/websites/zod_dev_v4` |
| Next.js        | `https://nextjs.org/docs/llms.txt` | `/vercel/next.js`      |
| shadcn/ui      | `https://ui.shadcn.com/llms.txt`   | -                      |
| nuqs           | `https://nuqs.47ng.com/llms.txt`   | -                      |
| TanStack Query | -                                  | `/tanstack/query`      |
| TanStack Form  | -                                  | `/tanstack/form`       |

### When to Look Up Docs

- Using an unfamiliar API or pattern
- Getting deprecation warnings or type errors
- Library was recently updated (check package.json versions)
- Unsure about correct syntax or best practices

### How to Look Up

1. **Context7**: Query for specific API usage
2. **Fetch llms.txt**: Get documentation index
3. **Check skill**: Load project skill if available (`/shadcn`, etc.)

## References

- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [nuqs Docs](https://nuqs.47ng.com/)
- [TanStack Query Docs](https://tanstack.com/query)
- [TkDodo — The Query Options API](https://tkdodo.eu/blog/the-query-options-api)
