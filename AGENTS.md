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

## Coding Guidelines

- FOLLOW any [RULES](.agent/rules) provided in the repository
- FOLLOW any [WORKFLOWS](.agent/workflows) provided in the repository
- ASK FOR CLARIFICATION if requirements are ambiguous before proceeding
- Use any available tools (MCP, CLI, etc.) installed to gather additional context as needed to help you understand the project and complete your tasks.
- Always write clean, well-documented code IN ENGLISH
- Adhere to established architecture and coding conventions
- Follow existing naming conventions and file structures
- Prefer types over interfaces (except when extending external types)
- Prefer functions over classes (classes only for errors/adapters)
- Validate changes with existing tests or add new tests as needed
- RUN ESSENTIAL COMMANDS to verify functionality after changes

## Merge/Pull Request Guidelines

- FOLLOW THE PR TEMPLATE provided in the repository, or PR template in `.github` repository
- Write descriptive title and summaries BASED ON THE ACTUAL CHANGES made
- WRITE IN ENGLISH only
- DO NOT INCLUDE lists of commit logs or changed files in PR description, unless specifically requested
- REMOVE ANY PLACEHOLDER from the template
- MERGE TO main branch, unless otherwise specified

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
