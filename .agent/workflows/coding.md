---
description: Main coding workflows that should follows
---

- Always use MCP Sequentialthinking. Research → Plan → Implement (don't jump straight to coding).
- Ask for clarification when requirements are ambiguous
- Use multiple agents for parallel investigation when tasks split cleanly
- Prefer simple, obvious solutions over clever abstractions
- Always use `pnpm` as the package manager
- After completing changes: run `pnpm lint:fix && pnpm test && pnpm lint`
- If anything fails: stop, investigate, fix, and re-run checks
- Don't proceed with further implementation until current implementation passes all checks
