---
trigger: always_on
---

## TypeScript
- Strict mode enabled with `noUnusedLocals` and `noUnusedParameters`
- Prefer types over interfaces (except when extending external types)
- Only create an abstraction if it's actually needed
- Prefer clear function/variable names over inline comments
- Avoid helper functions when a simple inline expression would suffice
- Prefer early returns to reduce nesting
- Prefer `function` declarations over `const` arrow functions
- Don't unnecessarily add `try`/`catch`
- Don't cast to `any` (and don't use `any`)
- Don't use `setTimeout()` for synchronization
- Don't use `console.log` in production code (use proper logging)
- Don't leave TODOs in final code
- Don't use emojis

## React
- Functional components with hooks only
- React 19 with JSX: `react-jsx`
- Avoid massive JSX blocks and compose smaller components
- Colocate code that changes together
- Avoid `useEffect` unless absolutely needed
- Use shadcn/ui pattern: primitives in `src/components/ui/`, composed in parent components
- Server functions with `createServerFn()` from `@tanstack/react-start`

## Imports & Formatting
- Use `@/` alias for `src/` imports
- Double quotes for strings
- 2-space indentation
- Auto-organize imports enabled (runs on `lint:fix`)

## Naming Conventions
- Components: PascalCase (`Button.tsx`, `AvatarDialog.tsx`)
- Functions/hooks: camelCase with `use` prefix for hooks (`useLinks`, `getProfile`)
- Actions: camelCase with `Action` suffix (`addLinkAction`, `updateLinkAction`)
- Server functions: `handler` callback inside `createServerFn()`
- Types: PascalCase, export type declarations (`export type SocialPlatform`)

## Tailwind
- Tailwind 4 (via `@tailwindcss/vite`)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow shadcn/ui component patterns with `cva` for variants
- Mostly use built-in values; occasionally allow dynamic values; rarely globals
- Always use Tailwind v4 + global CSS file format + shadcn/ui patterns

## Error Handling
- Server functions: use `.inputValidator()` for validation, throw `Error` on failure
- Non-critical errors: use `.catch()` with empty handler to ignore
- Avoid unnecessary try/catch blocks
- No `console.log` in production code

## Form Validation
- react-hook-form + zod for schemas
- Custom validators in `@/lib/validation.ts` (e.g., `isValidHttpUrl`)

## Testing
- Vitest with jsdom environment
- Test files in `src/__tests__/` with `.test.ts` extension
- Use `describe`, `it`, `expect` from vitest
