# app/ - Next.js App Router

This directory contains Next.js App Router routes, layouts, and pages.

## File Conventions

| File            | Purpose                                     |
| --------------- | ------------------------------------------- |
| `page.tsx`      | Route UI                                    |
| `layout.tsx`    | Shared layout (persists across navigations) |
| `loading.tsx`   | Loading UI (Suspense boundary)              |
| `error.tsx`     | Error UI (Error boundary)                   |
| `not-found.tsx` | 404 UI                                      |

## Rules

### Server Components by Default

Pages and layouts are Server Components unless they need client interactivity.

**When to use Client Components:**

- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- Hooks (useState, useEffect)

```tsx
// page.tsx - Server Component (default, no directive needed)
export default function ProjectsPage() {
  return <ProjectList />;
}

// Client Component - explicit directive required
("use client");
export function ProjectForm() {
  const [name, setName] = useState("");
  // ...
}
```

### Keep Pages Thin

Pages should be composition points, not business logic containers:

```tsx
// ✅ Good: Page composes feature components
export default function DashboardPage() {
  return (
    <div className="grid gap-4">
      <StatsOverview />
      <RecentActivity />
      <QuickActions />
    </div>
  );
}

// ❌ Bad: Page contains business logic
export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  useEffect(() => {
    /* fetch logic */
  }, []);
  return <div>{/* render logic */}</div>;
}
```

### Route Groups for Organization

Use route groups `(groupName)` to organize without affecting URL:

```
app/
├── (marketing)/
│   ├── page.tsx        # /
│   └── about/page.tsx  # /about
├── (dashboard)/
│   ├── layout.tsx      # Shared dashboard layout
│   └── projects/       # /projects
```

### Parallel Routes and Intercepting Routes

Use `@folder` for parallel routes (modals, sidebars):

```
app/
├── @modal/
│   └── (.)photo/[id]/page.tsx  # Intercepts /photo/[id]
└── photo/[id]/page.tsx         # Direct navigation
```

## Imports

This directory CAN import from:

- `@/features/*` - Feature components and hooks
- `@/components/*` - Shared UI components
- `@/lib/*` - Utilities
- `@/hooks/*` - Shared hooks
