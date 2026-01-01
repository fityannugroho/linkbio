# AI Agent Instructions for LinkBio

A Linktree-like service built with TanStack Start, React, Drizzle ORM, and Better Auth.

## Architecture Overview

**Stack**: TanStack Start (SSR), React 19, Vite, Drizzle ORM (PostgreSQL), Better Auth, Tailwind 4, Biome, Umami Analytics
**Pattern**: File-based routing, server-side data fetching, client-side mutations

### Key Directories
- `src/routes/` - TanStack Router file-based routes (auto-generates `routeTree.gen.ts`)
- `src/server/` - Server functions using `createServerFn()` from `@tanstack/react-start`
- `src/data/` - Database queries (Drizzle ORM)
- `src/components/` - React components (shadcn/ui based)
- `src/db/` - Database schema and connection
- `drizzle/` - Migration files
- `src/lib/` - Utilities (auth, umami, cn, etc.)

## Development Workflow

### Commands
```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm test         # Run Vitest tests
pnpm test -- <file>  # Run specific test file
pnpm test:cov     # Run tests with coverage
pnpm lint         # Biome check
pnpm lint:fix     # Biome fix + organize imports
```

### Database Migrations
```bash
pnpm drizzle-kit generate  # Generate migration from schema changes
pnpm drizzle-kit migrate   # Run migrations
```

## Project Conventions

- **Imports**: Use `@/` alias for `src/`
- **Linting**: Biome with double quotes, 2-space indent, auto-organize imports
- **Components**: shadcn/ui pattern - `src/components/ui/` for primitives, composed in parent components
- **Styling**: Tailwind 4 (via `@tailwindcss/vite`), (`cn` for classnames)
- **Forms**: react-hook-form + zod validation
- **Toast**: Sonner library

## Guidelines

- FOLLOW any [RULES](.agent/rules) and [WORKFLOWS](.agent/workflows) provided in the repository
- ASK FOR CLARIFICATION if requirements are ambiguous before proceeding
- Use available tools to gather context as needed
- Write clean, well-documented code IN ENGLISH
- Validate changes with tests

## Common Pitfalls

- Don't call server functions directly in components - import and invoke them (they return promises)
- `routeTree.gen.ts` is auto-generated - never edit manually
- Database queries in `src/data/` have NO auth - always wrap in server functions
- Better Auth requires both server config (`src/lib/auth.ts`) AND client config (`src/lib/auth-client.ts`)
- Vite config uses Nitro plugin for SSR - don't remove from [vite.config.ts](vite.config.ts)

## Resources

- [TanStack Docs](https://tanstack.com/llms.txt)
- [Better Auth Docs](https://www.better-auth.com/llms.txt)
- [Drizzle ORM Docs](https://orm.drizzle.team/llms.txt)
- [Shadcn/ui Docs](https://ui.shadcn.com/llms.txt)
