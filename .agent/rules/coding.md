---
trigger: always_on
---

## TypeScript
- Only create an abstraction if it’s actually needed
- Prefer clear function/variable names over inline comments
- Avoid helper functions when a simple inline expression would suffice
- Prefer early returns to reduce nesting
- Prefer `function` declarations over `const` arrow functions
- Don't unnecessarily add `try`/`catch`
- Don't cast to `any` (and don’t use `any`)
- Don't use `setTimeout()` for synchronization
- Don't use `console.log` in production code (use proper logging)
- Don't leave TODOs in final code
- Don't use emojis

## React
- Avoid massive JSX blocks and compose smaller components
- Colocate code that changes together
- Avoid `useEffect` unless absolutely needed

## Tailwind
- Mostly use built-in values; occasionally allow dynamic values; rarely globals
- Always use Tailwind v4 + global CSS file format + shadcn/ui patterns
