# Common Pitfalls

## 1. Using $effect Instead of $derived

**❌ Wrong:**

```svelte
<script lang="ts">
	let count = $state(0);
	let doubled = $state(0);

	$effect(() => {
		doubled = count * 2; // Synchronizing state = bad!
	});
</script>
```

**✅ Correct:**

```svelte
<script lang="ts">
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>
```

## 2. Mutating Non-Bindable Props

**❌ Wrong:**

```svelte
<script lang="ts">
	let { count } = $props();

	function increment() {
		count++; // Warning: ownership_invalid_mutation
	}
</script>
```

**✅ Correct Option 1 - Callback:**

```svelte
<script lang="ts">
	let { count, onIncrement } = $props();
</script>

<button onclick={onIncrement}>+</button>
```

**✅ Correct Option 2 - $bindable:**

```svelte
<script lang="ts">
	let { count = $bindable(0) } = $props();
</script>

<button onclick={() => count++}>+</button>

<!-- Parent must bind: -->
<Child bind:count={value} />
```

## 3. Accessing Undefined DOM References

**❌ Wrong:**

```svelte
<script lang="ts">
	let canvas: HTMLCanvasElement;

	// canvas is undefined during initialization!
	const ctx = canvas.getContext('2d');
</script>

<canvas bind:this={canvas}></canvas>
```

**✅ Correct:**

```svelte
<script lang="ts">
	let canvas: HTMLCanvasElement;

	$effect(() => {
		if (canvas) {
			const ctx = canvas.getContext('2d');
			// Use ctx...
		}
	});
</script>

<canvas bind:this={canvas}></canvas>
```

## 4. Missing Keys in Lists

**❌ Wrong:**

```svelte
{#each items as item}
	<div>{item.name}</div>
{/each}
```

**✅ Correct:**

```svelte
{#each items as item (item.id)}
	<div>{item.name}</div>
{/each}
```

## 5. Using on: Event Directive

**❌ Wrong (Svelte 4 syntax):**

```svelte
<button on:click={handler}>Click</button>
<button on:click|preventDefault={handler}>Click</button>
```

**✅ Correct:**

```svelte
<button onclick={handler}>Click</button>
<button
	onclick={(e) => {
		e.preventDefault();
		handler(e);
	}}>Click</button
>
```

## 6. Using export let for Props

**❌ Wrong (Svelte 4 syntax):**

```svelte
<script lang="ts">
	export let name: string;
	export let age = 18;
</script>
```

**✅ Correct:**

```svelte
<script lang="ts">
	let { name, age = 18 }: { name: string; age?: number } = $props();
</script>
```

## 7. Using <slot> Instead of Snippets

**❌ Wrong (deprecated):**

```svelte
<!-- Child -->
<slot name="header" />
<slot />
```

**✅ Correct:**

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
```

## 8. Using createEventDispatcher

**❌ Wrong (deprecated):**

```svelte
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('click', { value: 42 });
	}
</script>
```

**✅ Correct:**

```svelte
<script lang="ts">
	let { onclick } = $props();

	function handleClick() {
		onclick?.({ value: 42 });
	}
</script>
```

## 9. Not Handling Undefined Snippets

**❌ Wrong:**

```svelte
<script lang="ts">
	let { header } = $props();
</script>

{@render header()} <!-- Error if not provided! -->
```

**✅ Correct:**

```svelte
<script lang="ts">
	let { header } = $props();
</script>

{@render header?.()}
<!-- Optional chaining -->

<!-- Or with fallback: -->
{#if header}
	{@render header()}
{:else}
	<h1>Default Header</h1>
{/if}
```

## 10. Destructuring Props Without Types

**❌ Wrong:**

```svelte
<script lang="ts">
	let { name, age } = $props(); // No type safety!
</script>
```

**✅ Correct:**

```svelte
<script lang="ts">
	interface Props {
		name: string;
		age: number;
	}

	let { name, age }: Props = $props();
</script>
```

## 11. Making Everything Bindable

**❌ Wrong:**

```svelte
<script lang="ts">
	let { name = $bindable(), age = $bindable(), email = $bindable() } = $props();
</script>
```

Only use `$bindable()` when truly needed for two-way binding.

**✅ Correct:**

```svelte
<script lang="ts">
	let {
		name, // Read-only props
		age,
		email,
		value = $bindable(), // Only this needs binding
	} = $props();
</script>
```

## 12. Using Plain let for Reactive Values

**❌ Wrong:**

```svelte
<script lang="ts">
	let count = 0; // Not reactive in Svelte 5!
</script>

<button onclick={() => count++}>
	{count}
	<!-- Won't update -->
</button>
```

**✅ Correct:**

```svelte
<script lang="ts">
	let count = $state(0);
</script>

<button onclick={() => count++}>
	{count}
</button>
```

## 13. Infinite Effect Loops

**❌ Wrong:**

```svelte
<script lang="ts">
	let count = $state(0);

	$effect(() => {
		count = count + 1; // Infinite loop!
	});
</script>
```

Use `untrack` if you must read without tracking:

```svelte
<script lang="ts">
	import { untrack } from 'svelte';

	let count = $state(0);

	$effect(() => {
		const current = untrack(() => count);
		if (current < 10) {
			count = current + 1; // Won't cause infinite loop
		}
	});
</script>
```

## 14. Forgetting Cleanup in Effects

**❌ Wrong:**

```svelte
<script lang="ts">
	$effect(() => {
		const interval = setInterval(() => console.log('tick'), 1000);
		// No cleanup! Memory leak!
	});
</script>
```

**✅ Correct:**

```svelte
<script lang="ts">
	$effect(() => {
		const interval = setInterval(() => console.log('tick'), 1000);
		return () => clearInterval(interval);
	});
</script>
```

## 15. Using <svelte:component>

**❌ Wrong (unnecessary):**

```svelte
<script lang="ts">
	let Component = $state(ComponentA);
</script>

<svelte:component this={Component} />
```

**✅ Correct:**

```svelte
<script lang="ts">
	let Component = $state(ComponentA);
</script>

<Component /> <!-- Reactive in Svelte 5! -->
```
