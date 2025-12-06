---
name: svelte-code-writer
description: Expert guidance for writing proper Svelte 5 code with runes-based reactivity. Use when writing Svelte 5 components, migrating from Svelte 4, or troubleshooting Svelte 5 syntax. Covers $state, $derived, $effect, $props, $bindable, event handling, snippets, TypeScript integration, and common pitfalls.
---

# Svelte 5 Code Writer

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
	{count} × 2 = {doubled}
</button>
```

## Core Workflow

1. **Choose the right rune:**
   - Computing from state? → Use `$derived`
   - Managing reactive values? → Use `$state`
   - Side effects (DOM, network, etc.)? → Use `$effect`
   - Component props? → Use `$props`

2. **Apply the pattern** (see references below for details)

3. **Add TypeScript types** for props and state

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

**Use `$effect` only for side effects, not derivations, try to avoid reassign state in it:**

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

<!-- Parent -->
<Child>
	{#snippet header()}
		<h1>Title</h1>
	{/snippet}

	Default content here
</Child>

{@render header?.()}
{@render children?.()}
```

## Common Pitfalls

**❌ Don't synchronize state with $effect:**

```svelte
let doubled = $state(0);
$effect(() => { doubled = count * 2; });  // Wrong!
```

**✅ Use $derived instead:**

```svelte
let doubled = $derived(count * 2); // Correct!
```

**❌ Don't mutate non-bindable props:**

```svelte
let {count} = $props(); count++; // Warning!
```

**✅ Use callbacks or $bindable:**

```svelte
let {(count, onIncrement)} = $props(); onIncrement(); // Correct!
```

## Migration from Svelte 4

| Svelte 4                 | Svelte 5                            |
| ------------------------ | ----------------------------------- |
| `let count = 0`          | `let count = $state(0)`             |
| `$: doubled = count * 2` | `let doubled = $derived(count * 2)` |
| `$: console.log(count)`  | `$effect(() => console.log(count))` |
| `export let prop`        | `let { prop } = $props()`           |
| `on:click={handler}`     | `onclick={handler}`                 |
| `<slot />`               | `{@render children?.()}`            |

## Detailed References

For comprehensive details, see:

- **[RUNES.md](references/RUNES.md)** - Complete runes reference with examples
- **[PATTERNS.md](references/PATTERNS.md)** - Component patterns and best practices
- **[PITFALLS.md](references/PITFALLS.md)** - Common mistakes and how to fix them
- **[MIGRATION.md](references/MIGRATION.md)** - Detailed migration guide from Svelte 4
- **[TYPESCRIPT.md](references/TYPESCRIPT.md)** - TypeScript patterns and typing

Load these references only when you need detailed information beyond the quick reference above.
