# Component Lifecycle

In Svelte 5, lifecycle = creation + destruction. Updates aren't component-level; only affected render effects react to state changes. No "before/after update" hooks exist.

## `onMount`

Runs callback when component mounts to DOM. Must be called during component initialization (can be in external module). **Does not run on server.**

```svelte
<script>
	import { onMount } from 'svelte';

	onMount(() => {
		console.log('the component has mounted');
	});
</script>
```

**Cleanup:** Return a function to run on unmount.

```svelte
<script>
	import { onMount } from 'svelte';

	onMount(() => {
		const interval = setInterval(() => {
			console.log('beep');
		}, 1000);

		return () => clearInterval(interval);
	});
</script>
```

> **Note:** Only works with synchronous functions. `async` functions return a `Promise`.

## `onDestroy`

Runs immediately before component unmounts. **Only lifecycle hook that runs server-side.**

```svelte
<script>
	import { onDestroy } from 'svelte';

	onDestroy(() => {
		console.log('the component is being destroyed');
	});
</script>
```

## `tick`

Returns promise that resolves after pending state changes apply (or next microtask if none).

```svelte
<script>
	import { tick } from 'svelte';

	$effect.pre(() => {
		console.log('the component is about to update');
		tick().then(() => {
				console.log('the component just updated');
		});
	});
</script>
```

## Deprecated: `beforeUpdate` / `afterUpdate`

**Svelte 4 only** (shimmed in Svelte 5, unavailable with runes).

**Use instead:**
- `$effect.pre` instead of `beforeUpdate`
- `$effect` instead of `afterUpdate`

Runes offer granular control and only react to relevant changes.

### Example: Chat autoscroll

`$effect.pre` runs before DOM updates. Explicitly reference `messages` to run only when it changes (not when `theme` changes).

```svelte
<script>
	import { tick } from 'svelte';

	let theme = $state('dark');
	let messages = $state([]);

	let viewport;

	$effect.pre(() => {
		messages;
		const autoscroll = viewport && viewport.offsetHeight + viewport.scrollTop > viewport.scrollHeight - 50;

		if (autoscroll) {
			tick().then(() => {
				viewport.scrollTo(0, viewport.scrollHeight);
			});
		}
	});

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			const text = event.target.value;
			if (!text) return;

			messages = [...messages, text];
			event.target.value = '';
		}
	}

	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
	}
</script>

<div class:dark={theme === 'dark'}>
	<div bind:this={viewport}>
		{#each messages as message}
			<p>{message}</p>
		{/each}
	</div>

	<input onkeydown={handleKeydown} />

	<button onclick={toggle}> Toggle dark mode </button>
</div>
```