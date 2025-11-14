# Runes Reference

## $state

Create reactive state that updates the UI when changed.

### Basic Usage

```svelte
<script lang="ts">
	let count = $state(0);
	let user = $state({ name: 'Alice', age: 30 });
</script>
```

### Deep Reactivity

Objects and arrays become deeply reactive proxies:

```svelte
<script lang="ts">
	let todos = $state([{ done: false, text: 'Learn Svelte 5' }]);

	// These trigger reactivity:
	todos[0].done = true;
	todos.push({ done: false, text: 'Build app' });
</script>
```

### In Classes

```svelte
<script lang="ts">
	class Todo {
		done = $state(false);
		text = $state('');

		constructor(text: string) {
			this.text = $state(text); // Or initialize here
		}
	}
</script>
```

### $state.raw

Skip deep reactivity for performance:

```svelte
<script lang="ts">
	let bigData = $state.raw(hugeDataset); // Not deeply reactive

	// Must reassign to update:
	bigData = { ...bigData, newProp: 'value' };
</script>
```

### $state.snapshot

Get non-reactive snapshot:

```svelte
<script lang="ts">
	let data = $state({ count: 0 });
	console.log($state.snapshot(data)); // Plain object
</script>
```

## $derived

Compute values from other state. **Always prefer $derived over $effect for computations.**

### Basic Usage

```svelte
<script lang="ts">
	let count = $state(0);
	let doubled = $derived(count * 2);
	let squared = $derived(count ** 2);
</script>
```

### $derived.by

For complex computations:

```svelte
<script lang="ts">
	let items = $state([
		/* ... */
	]);

	let total = $derived.by(() => {
		let sum = 0;
		for (const item of items) {
			sum += item.price * item.quantity;
		}
		return sum;
	});
</script>
```

### Dependency Tracking

Dependencies are tracked at runtime:

```svelte
<script lang="ts">
	let condition = $state(true);
	let a = $state(1);
	let b = $state(2);

	// Only depends on what's actually read
	let result = $derived(condition ? a : b);
	// Changes to `a` only update when condition is true
</script>
```

### Overriding Derived Values

Since Svelte 5.25, deriveds can be reassigned temporarily:

```svelte
<script lang="ts">
	let { post } = $props();
	let likes = $derived(post.likes);

	async function optimisticLike() {
		likes += 1; // Override temporarily
		try {
			await apiCall();
		} catch {
			likes -= 1; // Roll back
		}
	}
</script>
```

## $effect

Run side effects when dependencies change. **Use sparingly - most "effects" should be $derived.**

### Basic Pattern

```svelte
<script lang="ts">
	let count = $state(0);

	$effect(() => {
		// Side effect code
		console.log(`Count: ${count}`);

		// Optional cleanup
		return () => console.log('Cleaning up');
	});
</script>
```

### Timing

Effects run:

- After component mounts
- After state changes (in microtask)
- After DOM updates

### Common Use Cases

**Canvas drawing:**

```svelte
<script lang="ts">
	let canvas: HTMLCanvasElement;
	let color = $state('#ff3e00');

	$effect(() => {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, 100, 100);
	});
</script>

<canvas bind:this={canvas}></canvas>
```

**Intervals/timers:**

```svelte
<script lang="ts">
	let count = $state(0);
	let running = $state(true);

	$effect(() => {
		if (!running) return;

		const interval = setInterval(() => count++, 1000);
		return () => clearInterval(interval);
	});
</script>
```

**Network requests:**

```svelte
<script lang="ts">
	let userId = $state(1);
	let userData = $state(null);

	$effect(() => {
		fetch(`/api/users/${userId}`)
			.then((r) => r.json())
			.then((data) => (userData = data));
	});
</script>
```

### $effect.pre

Run before DOM updates:

```svelte
<script lang="ts">
	import { tick } from 'svelte';

	let div: HTMLDivElement;
	let messages = $state<string[]>([]);

	$effect.pre(() => {
		if (!div) return;
		messages.length; // Track dependency

		// Auto-scroll if near bottom
		if (div.offsetHeight + div.scrollTop > div.scrollHeight - 20) {
			tick().then(() => div.scrollTo(0, div.scrollHeight));
		}
	});
</script>
```

### Dependency Management

Dependencies are tracked automatically:

```svelte
<script lang="ts">
	let a = $state(1);
	let b = $state(2);
	let condition = $state(true);

	$effect(() => {
		if (condition) {
			console.log(a); // Only `a` and `condition` are dependencies
		} else {
			console.log(b); // Only `b` and `condition` are dependencies
		}
	});
</script>
```

To exempt something from tracking, use `untrack`:

```svelte
<script lang="ts">
	import { untrack } from 'svelte';

	let count = $state(0);
	let other = $state(0);

	$effect(() => {
		console.log(count); // Tracked
		console.log(untrack(() => other)); // Not tracked
	});
</script>
```

## $props

Receive data from parent components.

### Basic Pattern

```svelte
<script lang="ts">
	interface Props {
		required: string;
		optional?: number;
		callback?: (value: string) => void;
	}

	let { required, optional = 42, callback }: Props = $props();
</script>
```

### Rest Props

```svelte
<script lang="ts">
	let { name, ...rest } = $props();
</script>

<div {...rest}>{name}</div>
```

### Renaming

```svelte
<script lang="ts">
	let { class: className, for: htmlFor } = $props();
</script>
```

### Generic Props

```svelte
<script lang="ts" generics="T extends { id: number }">
	interface Props {
		items: T[];
		onSelect: (item: T) => void;
	}

	let { items, onSelect }: Props = $props();
</script>
```

## $bindable

Make props two-way bindable.

### Basic Pattern

```svelte
<script lang="ts">
	let { value = $bindable(''), disabled = false } = $props();
</script>

<input bind:value {disabled} />
```

### With Fallback

Fallback is used when prop is not bound:

```svelte
<script lang="ts">
	let { value = $bindable('default') } = $props();
</script>

<!-- Parent can use or not use bind: -->
<Child value="static" />
<!-- Uses 'static' -->
<Child bind:value={parentValue} />
<!-- Binds to parent -->
<Child />
<!-- Uses 'default' -->
```

### Function Bindings

```svelte
<script lang="ts">
	let { value = $bindable() } = $props();
</script>

<!-- Parent can use function binding -->
<Child bind:value={() => value, (v) => (value = v.toUpperCase())} />
```
