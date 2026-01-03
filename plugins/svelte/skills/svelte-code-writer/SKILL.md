---
name: svelte-code-writer
description: Expert guidance for writing proper Svelte 5 code with runes-based reactivity. Use when writing Svelte 5 components, migrating from Svelte 4, or troubleshooting Svelte 5 syntax. Covers $state, $derived, $effect, $props, $bindable, event handling, snippets, TypeScript integration, and common pitfalls. Includes CLI tools for documentation lookup and code analysis.
---

# Svelte 5 Code Writer

## CLI Tools

You have access to `@sveltejs/mcp` CLI for Svelte-specific assistance. Use these commands via `npx`:

### List Documentation Sections

```bash
npx @sveltejs/mcp list-sections
```

Lists all available Svelte 5 and SvelteKit documentation sections with titles and paths.

### Get Documentation

```bash
npx @sveltejs/mcp get-documentation "<section1>,<section2>,..."
```

Retrieves full documentation for specified sections. Use after `list-sections` to fetch relevant docs.

**Example:**

```bash
npx @sveltejs/mcp get-documentation "$state,$derived,$effect"
```

### Svelte Autofixer

```bash
npx @sveltejs/mcp svelte-autofixer "<code_or_path>" [options]
```

Analyzes Svelte code and suggests fixes for common issues.

**Options:**

- `--async` - Enable async Svelte mode (default: false)
- `--svelte-version` - Target version: 4 or 5 (default: 5)

**Examples:**

```bash
# Analyze inline code (escape $ as \$)
npx @sveltejs/mcp svelte-autofixer '<script>let count = \$state(0);</script>'

# Analyze a file
npx @sveltejs/mcp svelte-autofixer ./src/lib/Component.svelte

# Target Svelte 4
npx @sveltejs/mcp svelte-autofixer ./Component.svelte --svelte-version 4
```

**Important:** When passing code with runes (`$state`, `$derived`, etc.) via the terminal, escape the `$` character as `\$` to prevent shell variable substitution.

## Workflow

1. **Uncertain about syntax?** Run `list-sections` then `get-documentation` for relevant topics
2. **Writing new code?** Apply patterns from Quick Reference below
3. **Reviewing/debugging?** Run `svelte-autofixer` on the code to detect issues
4. **Always validate** - Run `svelte-autofixer` before finalizing any Svelte component

## Quick Reference

Svelte 5 uses **runes** (functions starting with `$`) for explicit reactivity:

```svelte
<script lang="ts">
	let count = $state(0); // Reactive state
	let doubled = $derived(count * 2); // Computed value
	let { name, age } = $props(); // Component props

	$effect(() => {
		// Side effects
		console.log(`Count is ${count}`);
		return () => console.log('cleanup');
	});
</script>

<button onclick={() => count++}>
	<!-- Event attributes -->
	{count} x 2 = {doubled}
</button>
```

## Rune Selection Guide

| Need                               | Rune         | Notes                       |
| ---------------------------------- | ------------ | --------------------------- |
| Reactive value                     | `$state`     | Primitives, objects, arrays |
| Computed from other state          | `$derived`   | 90% of "effect" use cases   |
| Side effects (DOM, network, timer) | `$effect`    | Use sparingly               |
| Component inputs                   | `$props`     | Always type with interface  |
| Two-way binding                    | `$bindable`  | Only when truly needed      |
| Large non-reactive data            | `$state.raw` | Skip deep proxy overhead    |

## Key Patterns

### State: $state

```svelte
<script lang="ts">
	let count = $state(0); // Primitive
	let user = $state({ name: 'Alice' }); // Object (deeply reactive)
	let data = $state.raw(largeDataset); // Non-deeply-reactive (performance)
</script>
```

### Computed Values: $derived

**Use `$derived` for values computed from other state** (90% of cases):

```svelte
<script lang="ts">
	let count = $state(0);
	let doubled = $derived(count * 2); // Simple

	let total = $derived.by(() => {
		// Complex
		return items.reduce((sum, item) => sum + item.value, 0);
	});
</script>
```

### Side Effects: $effect

**Use `$effect` only for side effects, not derivations. Avoid reassigning state in it:**

```svelte
<script lang="ts">
	$effect(() => {
		// DOM manipulation, network calls, subscriptions
		const interval = setInterval(() => console.log(count), 1000);
		return () => clearInterval(interval); // Cleanup
	});
</script>
```

### Props: $props

```svelte
<script lang="ts">
	interface Props {
		required: string;
		optional?: number;
		callback: (value: string) => void;
	}

	let { required, optional = 42, callback }: Props = $props();
</script>
```

### Two-Way Binding: $bindable

```svelte
<script lang="ts">
	let { value = $bindable('') } = $props();
</script>

<input bind:value />
```

## Event Handling

**Events are properties** (not directives):

```svelte
<button onclick={() => count++}>Click</button>
<button onclick={handleClick}>Click</button>

<!-- Component callbacks -->
<Child onsubmit={(data) => console.log(data)} />
```

## Snippets (Replacing Slots)

```svelte
<!-- Child -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		header,
		children,
	}: {
		header?: Snippet;
		children?: Snippet;
	} = $props();
</script>

{@render header?.()}
{@render children?.()}

<!-- Parent -->
<Child>
	{#snippet header()}
		<h1>Title</h1>
	{/snippet}

	Default content here
</Child>
```

## Common Pitfalls

### Don't synchronize state with $effect

```svelte
<!-- WRONG -->
let doubled = $state(0);
$effect(() => { doubled = count * 2; });

<!-- CORRECT -->
let doubled = $derived(count * 2);
```

### Don't mutate non-bindable props

```svelte
<!-- WRONG -->
let {count} = $props(); count++; // Warning!

<!-- CORRECT: Use callbacks -->
let {(count, onIncrement)} = $props(); onIncrement();

<!-- CORRECT: Use $bindable -->
let {(count = $bindable(0))} = $props(); count++;
```

### Don't use Svelte 4 syntax

| Svelte 4 (Wrong)         | Svelte 5 (Correct)                  |
| ------------------------ | ----------------------------------- |
| `let count = 0`          | `let count = $state(0)`             |
| `$: doubled = count * 2` | `let doubled = $derived(count * 2)` |
| `$: console.log(count)`  | `$effect(() => console.log(count))` |
| `export let prop`        | `let { prop } = $props()`           |
| `on:click={handler}`     | `onclick={handler}`                 |
| `<slot />`               | `{@render children?.()}`            |

### Always clean up effects

```svelte
$effect(() => {
	const interval = setInterval(() => console.log('tick'), 1000);
	return () => clearInterval(interval); // Required!
});
```

### Always use keys in lists

```svelte
{#each items as item (item.id)}
	<Item {item} />
{/each}
```

## Detailed References

For comprehensive details, see:

- **[RUNES.md](references/RUNES.md)** - Complete runes reference with examples
- **[PATTERNS.md](references/PATTERNS.md)** - Component patterns and best practices
- **[PITFALLS.md](references/PITFALLS.md)** - Common mistakes and how to fix them
- **[MIGRATION.md](references/MIGRATION.md)** - Detailed migration guide from Svelte 4
- **[TYPESCRIPT.md](references/TYPESCRIPT.md)** - TypeScript patterns and typing

Load these references only when you need detailed information beyond the quick reference above.
