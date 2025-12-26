---
description: Main coding workflows that should follows
---

## Workflow
- Always use MCP Sequentialthinking. Research → Plan → Implement (don’t jump straight to coding).
- Ask for clarification when requirements are ambiguous
- Use multiple agents for parallel investigation when tasks split cleanly
- Prefer simple, obvious solutions over clever abstractions
- Always use `pnpm` as the package manager instead of `npm`, `yarn`, `bun`, etc.

## Checks
- Run: `pnpm run lint:fix && pnpm test && pnpm run lint`
- If anything fails: stop, fix everything, re-run, then continue
