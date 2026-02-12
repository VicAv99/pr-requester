# Claude Code Guidelines

Project-specific instructions for Claude Code.

## Project Overview

Next.js App Router + Tailwind/shadcn stack following [Bulletproof React](https://github.com/alan2207/bulletproof-react) patterns.

## Directory Guidelines

- @AGENTS.md
- @app/AGENTS.md
- @components/AGENTS.md
- @features/AGENTS.md
- @lib/AGENTS.md
- @utils/AGENTS.md

## Branch Management

When the user requests a new feature, bug fix, refactoring, or any implementation task:

1. **Check the current branch** (injected by the `UserPromptSubmit` hook — no tool call needed).
2. **If on `main`**: Before starting work, suggest creating a feature branch. Propose a name based on the request (e.g., `feat/dark-mode`, `fix/login-redirect`). Ask the user before creating it.
3. **If on a branch that relates to the request**: Proceed normally — no branch action needed.
4. **If on an unrelated branch**: Mention it and ask the user whether to switch, create a new branch, or continue on the current one.

This does NOT apply to questions, research, explanations, or non-implementation requests.

## Key Principles

1. **Unidirectional flow**: shared → features → app (no cross-feature imports)
2. **No barrel files**: Import directly from source files
3. **Server Components by default**: Client Components only when needed
4. **Colocate code**: Feature-specific code in features/, shared code in components/

## Commands

Use `/command-name` to invoke:

- `/commit` - Conventional commit with approval flow

## Skills

Loaded automatically when relevant:

- `/shadcn` - shadcn/ui component docs
- `/frontend-design` - Distinctive UI design

## Documentation

Fetch docs when using unfamiliar APIs:

- Next.js: `https://nextjs.org/docs/llms.txt`
- shadcn/ui: `https://ui.shadcn.com/llms.txt`
- nuqs: `https://nuqs.47ng.com/llms.txt`
- Zod: `https://zod.dev/llms.txt`
