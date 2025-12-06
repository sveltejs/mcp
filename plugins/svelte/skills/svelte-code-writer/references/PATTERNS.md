# Component Patterns and Best Practices

## TypeScript Integration

### Always Use TypeScript

```svelte
<script lang="ts">
	interface Props {
		items: Item[];
		onSelect: (item: Item) => void;
	}

	let { items, onSelect }: Props = $props();
</script>
```

### Generic Components

```svelte
<script lang="ts" generics="T extends { id: number }">
	interface Props {
		items: T[];
		renderItem: Snippet<[T]>;
	}

	let { items, renderItem }: Props = $props();
</script>

{#each items as item (item.id)}
	{@render renderItem(item)}
{/each}
```

## State Management Patterns

### Minimize State, Maximize Derived

**❌ Avoid:**

```svelte
<script lang="ts">
	let items = $state([]);
	let count = $state(0);
	let isEmpty = $state(true);

	$effect(() => {
		count = items.length;
		isEmpty = items.length === 0;
	});
</script>
```

**✅ Better:**

```svelte
<script lang="ts">
	let items = $state([]);
	let count = $derived(items.length);
	let isEmpty = $derived(items.length === 0);
</script>
```

### Extract Reusable Reactive Logic

Use `.svelte.js` or `.svelte.ts` files for shared state:

```ts
// counter.svelte.ts
export function createCounter(initial = 0) {
	let count = $state(initial);
	let doubled = $derived(count * 2);

	return {
		get count() {
			return count;
		},
		get doubled() {
			return doubled;
		},
		increment: () => count++,
		decrement: () => count--,
	};
}
```

```svelte
<!-- Component.svelte -->
<script lang="ts">
	import { createCounter } from './counter.svelte.ts';

	const counter = createCounter(0);
</script>

<button onclick={counter.increment}>
	{counter.count} (doubled: {counter.doubled})
</button>
```

### Class-Based Reactive State

```svelte
<script lang="ts">
	class TodoList {
		items = $state<Todo[]>([]);

		get completed() {
			return this.items.filter((t) => t.done);
		}

		get remaining() {
			return this.items.filter((t) => !t.done);
		}

		add(text: string) {
			this.items.push({ id: Date.now(), text, done: false });
		}

		toggle(id: number) {
			const todo = this.items.find((t) => t.id === id);
			if (todo) todo.done = !todo.done;
		}
	}

	const todos = new TodoList();
</script>
```

## Component Composition

### Snippet-Based Composition

```svelte
<!-- Table.svelte -->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	interface Props {
		data: T[];
		header?: Snippet;
		row: Snippet<[T]>;
		footer?: Snippet;
	}

	let { data, header, row, footer }: Props = $props();
</script>

<table>
	{#if header}
		<thead>{@render header()}</thead>
	{/if}

	<tbody>
		{#each data as item}
			<tr>{@render row(item)}</tr>
		{/each}
	</tbody>

	{#if footer}
		<tfoot>{@render footer()}</tfoot>
	{/if}
</table>
```

Usage:

```svelte
<Table {data}>
	{#snippet header()}
		<tr>
			<th>Name</th>
			<th>Age</th>
		</tr>
	{/snippet}

	{#snippet row(person)}
		<td>{person.name}</td>
		<td>{person.age}</td>
	{/snippet}

	{#snippet footer()}
		<tr><td colspan="2">Total: {data.length}</td></tr>
	{/snippet}
</Table>
```

### Higher-Order Components Pattern

```svelte
<!-- WithAuth.svelte -->
<script lang="ts">
	import type { Component } from 'svelte';

	let {
		component,
		...props
	}: {
		component: Component;
		[key: string]: any;
	} = $props();

	let isAuthenticated = $state(false);

	$effect(() => {
		checkAuth().then((result) => (isAuthenticated = result));
	});
</script>

{#if isAuthenticated}
	<svelte:component this={component} {...props} />
{:else}
	<p>Please log in</p>
{/if}
```

## Event Handling Patterns

### Named Event Handlers

```svelte
<script lang="ts">
	let count = $state(0);

	function handleIncrement() {
		count++;
	}

	function handleDecrement() {
		count--;
	}

	function handleReset() {
		count = 0;
	}
</script>

<button onclick={handleIncrement}>+</button>
<button onclick={handleDecrement}>-</button>
<button onclick={handleReset}>Reset</button>
```

### Event Delegation Pattern

For many similar elements:

```svelte
<script lang="ts">
	let items = $state(['a', 'b', 'c']);

	function handleClick(event: MouseEvent) {
		const button = (event.target as HTMLElement).closest('button');
		if (button) {
			const value = button.dataset.value;
			console.log('Clicked:', value);
		}
	}
</script>

<div onclick={handleClick}>
	{#each items as item}
		<button data-value={item}>{item}</button>
	{/each}
</div>
```

### Custom Event Handlers (Callbacks)

```svelte
<!-- Child.svelte -->
<script lang="ts">
	interface Props {
		onSuccess?: (data: Data) => void;
		onError?: (error: Error) => void;
	}

	let { onSuccess, onError }: Props = $props();

	async function submit() {
		try {
			const data = await api.submit();
			onSuccess?.(data);
		} catch (error) {
			onError?.(error as Error);
		}
	}
</script>
```

## Form Patterns

### Two-Way Form Binding

```svelte
<script lang="ts">
	interface FormData {
		name: string;
		email: string;
		age: number;
	}

	let form = $state<FormData>({
		name: '',
		email: '',
		age: 18,
	});

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		console.log(form);
	}
</script>

<form onsubmit={handleSubmit}>
	<input bind:value={form.name} placeholder="Name" />
	<input bind:value={form.email} type="email" placeholder="Email" />
	<input bind:value={form.age} type="number" />
	<button type="submit">Submit</button>
</form>
```

### Custom Form Components

```svelte
<!-- Input.svelte -->
<script lang="ts">
	let {
		value = $bindable(''),
		label,
		type = 'text',
		error,
		...rest
	}: {
		value?: string;
		label: string;
		type?: string;
		error?: string;
		[key: string]: any;
	} = $props();
</script>

<label>
	<span>{label}</span>
	<input {type} bind:value {...rest} />
	{#if error}
		<span class="error">{error}</span>
	{/if}
</label>
```

## Async Patterns

### Loading States

```svelte
<script lang="ts">
	let promise = $state<Promise<Data>>(fetchData());
</script>

{#await promise}
	<p>Loading...</p>
{:then data}
	<DataView {data} />
{:catch error}
	<p>Error: {error.message}</p>
{/await}
```

### Manual Loading State

```svelte
<script lang="ts">
	let data = $state<Data | null>(null);
	let loading = $state(false);
	let error = $state<Error | null>(null);

	async function load() {
		loading = true;
		error = null;
		try {
			data = await fetchData();
		} catch (e) {
			error = e as Error;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		load();
	});
</script>

{#if loading}
	<p>Loading...</p>
{:else if error}
	<p>Error: {error.message}</p>
{:else if data}
	<DataView {data} />
{/if}
```

## Styling Patterns

### Dynamic Classes

```svelte
<script lang="ts">
	let active = $state(true);
	let large = $state(false);
	let disabled = $state(false);
</script>

<!-- Object syntax (5.16+) -->
<div class={{ active, large, disabled }}>Content</div>

<!-- Array syntax -->
<div class={['base-class', active && 'active', large && 'large', disabled && 'disabled']}>
	Content
</div>

<!-- Combined -->
<div class={['base', { active, large }]}>Content</div>
```

### Component Style Props

```svelte
<!-- Button.svelte -->
<script lang="ts">
	let {
		variant = 'primary',
		size = 'medium',
		children,
	}: {
		variant?: 'primary' | 'secondary' | 'danger';
		size?: 'small' | 'medium' | 'large';
		children: Snippet;
	} = $props();
</script>

<button class={{ [variant]: true, [size]: true }}>
	{@render children()}
</button>

<style>
	button {
		padding: 0.5rem 1rem;
	}

	.primary {
		background: blue;
	}
	.secondary {
		background: gray;
	}
	.danger {
		background: red;
	}

	.small {
		font-size: 0.875rem;
	}
	.medium {
		font-size: 1rem;
	}
	.large {
		font-size: 1.125rem;
	}
</style>
```

## Performance Patterns

### Use Keys in Lists

```svelte
{#each items as item (item.id)}
	<Item {item} />
{/each}
```

### Use $state.raw for Large Non-Reactive Data

```svelte
<script lang="ts">
	// Large read-only dataset
	let bigData = $state.raw(loadHugeDataset());
</script>
```

### Lazy Loading Components

```svelte
<script lang="ts">
	let HeavyComponent = $state<Component | null>(null);
	let show = $state(false);

	$effect(() => {
		if (show && !HeavyComponent) {
			import('./HeavyComponent.svelte').then((m) => {
				HeavyComponent = m.default;
			});
		}
	});
</script>

{#if show && HeavyComponent}
	<HeavyComponent />
{/if}
```

## Testing Patterns

```typescript
import { mount } from 'svelte';
import { expect, test } from 'vitest';
import Component from './Component.svelte';

test('increments counter', async () => {
	const target = document.createElement('div');
	const instance = mount(Component, { target });

	const button = target.querySelector('button');
	button?.click();

	await new Promise((resolve) => setTimeout(resolve, 0));

	expect(target.textContent).toContain('1');
});
```

## Accessibility Patterns

```svelte
<script lang="ts">
	let menuOpen = $state(false);
	let buttonId = $props.id();
</script>

<button
	id={buttonId}
	onclick={() => (menuOpen = !menuOpen)}
	aria-expanded={menuOpen}
	aria-controls="menu-{buttonId}"
>
	Menu
</button>

<nav id="menu-{buttonId}" hidden={!menuOpen} aria-labelledby={buttonId}>
	<a href="/home">Home</a>
	<a href="/about">About</a>
</nav>
```
