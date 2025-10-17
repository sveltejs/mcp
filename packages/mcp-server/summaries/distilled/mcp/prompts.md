# MCP Server Prompts

## svelte-task

Use this prompt for any Svelte-related task. It instructs the LLM on available documentation, tools, and workflows.

### Key Instructions

**Documentation Access:**
- Use `get_documentation` tool with paths from the available docs list (CLI, Kit, Svelte core, etc.)
- Paths cover: project setup, routing, data loading, forms, deployment, testing, styling, authentication, etc.

**Code Validation Workflow:**
1. Write Svelte component/module
2. **MUST** invoke `svelte-autofixer` tool with the code
3. Fix any issues/suggestions returned
4. Repeat steps 2-3 until no issues remain
5. Only then return code to user

**Playground Links:**
- After final code version, ask user if they want a playground link
- If yes, call `playground-link` tool
- Must include `App.svelte` as entry point
- Can include multiple files at root

### Available Documentation Categories

- **CLI**: `sv create`, `sv add`, `sv check`, `sv migrate`, integrations (Drizzle, ESLint, Lucia, Playwright, Tailwind, Vitest, etc.)
- **SvelteKit**: routing, loading data, form actions, adapters, hooks, errors, state management, remote functions, deployment
- **Svelte**: runes (`$state`, `$derived`, `$effect`, `$props`, `$bindable`), markup, transitions, stores, context, TypeScript, custom elements
- **Legacy**: migration guides, deprecated APIs, Svelte 3/4 patterns

### Syntax Rules (Svelte 5)

- No colon in event modifiers: `onclick` not `on:click`
- Runes are globals (no import needed)
- `$state()` uses `let`, never `const`
- `$derived` with function: `$derived.by(() => ...)`
- Error boundaries: catch render errors and top-level `$effect` errors only (not event handlers)