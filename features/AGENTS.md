# features/ - Feature-Based Modules

This directory contains feature-based modules. Each feature is a self-contained unit with its own components, hooks, types, and utilities.

## Structure

```txt
features/
└── [feature-name]/
    ├── components/     # Feature-specific components
    ├── hooks/          # Feature-specific hooks
    ├── queries.ts      # TanStack Query option factories
    ├── types/          # Feature-specific TypeScript types
    └── utils/          # Feature-specific utilities
```

## Rules

### Self-Contained Features

Each feature should be independent and contain everything it needs:

```txt
features/projects/
├── components/
│   ├── project-card.tsx
│   ├── project-list.tsx
│   ├── project-form.tsx
│   └── project-filters.tsx
├── hooks/
│   └── use-project-filters.ts
├── queries.ts
├── types/
│   └── project.ts
└── utils/
    └── project-helpers.ts
```

### Query Option Factories

Each feature that fetches data has a `queries.ts` file containing a query factory object. See `AGENTS.md` → "Server State with TanStack Query" for the full pattern.

```tsx
// features/projects/queries.ts
import { queryOptions } from "@tanstack/react-query";

export const projectQueries = {
  all: () => ["projects"],
  list: (filters: ProjectFilters) =>
    queryOptions({
      queryKey: [...projectQueries.all(), "list", filters],
      queryFn: () => fetchProjects(filters),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...projectQueries.all(), "detail", id],
      queryFn: () => fetchProject(id),
      staleTime: 5 * 60 * 1000,
    }),
};
```

**Rules:**

- One `queries.ts` per feature (not a directory, a single file)
- Every entry is a function — even zero-param entries
- Use `queryOptions()` for entries with a `queryFn`; return plain arrays for key-only entries
- Components consume factories directly: `useQuery(projectQueries.detail(id))`
- Do NOT wrap `useQuery` in custom hooks — pass query options directly

### No Cross-Feature Imports

Features MUST NOT import from other features:

```tsx
// ❌ Forbidden: Cross-feature import
// features/dashboard/components/overview.tsx
import { ProjectCard } from "@/features/projects/components/project-card";

// ✅ Good: Use shared component or compose at app level
import { Card } from "@/components/ui/card";
```

## Imports

Features CAN import from:

- `@/components/*` - Shared UI components
- `@/hooks/*` - Shared hooks
- `@/lib/*` - Utilities
- `@/types/*` - Shared types

Features CANNOT import from:

- `@/features/*` - Other features
- `@/app/*` - App routes

## Styling

Feature components follow the same styling conventions as shared components.
See `src/components/AGENTS.md` for full details.

Key rules:

- **Always use `cn()` for conditional classes** - never template literals
- Use `size-*` for icon dimensions, not `h-* w-*`
- Import Lucide icons with `Icon` suffix

## When to Create a Feature

Create a new feature when:

- It has multiple related components
- It has its own data model
- It represents a distinct domain concept

Keep it simple - not everything needs to be a feature. Small, one-off components can live in `components/`.
