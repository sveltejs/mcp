# Effects

Effects run when state updates. They only run in the browser, not during SSR.

**Don't update state inside effects** — use alternatives like `$derived` instead.

## `$effect`

Creates an effect that tracks reactive dependencies and re-runs when they change.

```svelte
<script>
	let size = $state(50);
	let color = $state('#ff3e00');

	let canvas;

	$effect(() => {
		const context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);

		// this will re-run whenever `color` or `size` change
		context.fillStyle = color;
		context.fillRect(0, 0, size, size);
	});
</script>

<canvas bind:this={canvas} width="100" height="100"></canvas>
```

### Lifecycle

- Runs after component mounts to DOM
- Re-runs in a microtask after state changes
- Re-runs are batched
- Can be used anywhere, not just top level (must be called while parent effect is running)

### Teardown

Return a function to clean up before re-run or component destruction:

```svelte
<script>
	let count = $state(0);
	let milliseconds = $state(1000);

	$effect(() => {
		const interval = setInterval(() => {
			count += 1;
		}, milliseconds);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<h1>{count}</h1>

<button onclick={() => (milliseconds *= 2)}>slower</button>
<button onclick={() => (milliseconds /= 2)}>faster</button>
```

### Dependencies

- Auto-tracks `$state`, `$derived`, `$props` read **synchronously**
- Values read after `await` or in `setTimeout` are **not tracked**
- Reading object doesn't track properties inside it (only reassignment)
- Conditional code affects dependencies — only tracks what was read in last run

```ts
$effect(() => {
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);

	// this will re-run whenever `color` changes...
	context.fillStyle = color;

	setTimeout(() => {
		// ...but not when `size` changes
		context.fillRect(0, 0, size, size);
	}, 0);
});
```

```svelte
<script>
	let state = $state({ value: 0 });
	let derived = $derived({ value: state.value * 2 });

	// this will run once, because `state` is never reassigned (only mutated)
	$effect(() => {
		state;
	});

	// this will run whenever `state.value` changes...
	$effect(() => {
		state.value;
	});

	// ...and so will this, because `derived` is a new object each time
	$effect(() => {
		derived;
	});
</script>
```

## `$effect.pre`

Runs **before** DOM updates (vs `$effect` which runs after):

```svelte
<script>
	import { tick } from 'svelte';

	let div = $state();
	let messages = $state([]);

	$effect.pre(() => {
		if (!div) return; // not yet mounted

		messages.length;

		// autoscroll when new messages are added
		if (div.offsetHeight + div.scrollTop > div.scrollHeight - 20) {
			tick().then(() => {
				div.scrollTo(0, div.scrollHeight);
			});
		}
	});
</script>

<div bind:this={div}>
	{#each messages as message}
		<p>{message}</p>
	{/each}
</div>
```

## `$effect.tracking`

Returns `true` if code is running inside a tracking context (effect or template):

```svelte
<script>
	console.log('in component setup:', $effect.tracking()); // false

	$effect(() => {
		console.log('in effect:', $effect.tracking()); // true
	});
</script>

<p>in template: {$effect.tracking()}</p> <!-- true -->
```

## `$effect.pending`

Returns count of pending promises in current boundary (not including child boundaries):

```svelte
<button onclick={() => a++}>a++</button>
<button onclick={() => b++}>b++</button>

<p>{a} + {b} = {await add(a, b)}</p>

{#if $effect.pending()}
	<p>pending promises: {$effect.pending()}</p>
{/if}
```

## `$effect.root`

Creates non-tracked scope that doesn't auto-cleanup. For manual control of effects:

```js
const destroy = $effect.root(() => {
	$effect(() => {
		// setup
	});

	return () => {
		// cleanup
	};
});

// later...
destroy();
```

## When NOT to use `$effect`

### ❌ Don't synchronize state

```svelte
<script>
	let count = $state(0);
	let doubled = $state();

	// don't do this!
	$effect(() => {
		doubled = count * 2;
	});
</script>
```

### ✅ Use `$derived` instead

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>
```

### ❌ Don't link values with effects

```svelte
<script>
	const total = 100;
	let spent = $state(0);
	let left = $state(total);

	$effect(() => {
		left = total - spent;
	});

	$effect(() => {
		spent = total - left;
	});
</script>

<label>
	<input type="range" bind:value={spent} max={total} />
	{spent}/{total} spent
</label>

<label>
	<input type="range" bind:value={left} max={total} />
	{left}/{total} left
</label>
```

### ✅ Use function bindings

```svelte
<script>
	const total = 100;
	let spent = $state(0);
	let left = $derived(total - spent);

	function updateLeft(left) {
		spent = total - left;
	}
</script>

<label>
	<input type="range" bind:value={spent} max={total} />
	{spent}/{total} spent
</label>

<label>
	<input type="range" bind:value={() => left, updateLeft} max={total} />
	{left}/{total} left
</label>
```

**Note:** As of Svelte 5.25, deriveds can be directly overridden for optimistic UI patterns.

**Gotcha:** If you must update `$state` in an effect and hit infinite loops, use `untrack()`.