# $inspect

**Development only** - becomes noop in production.

Re-runs `console.log` whenever arguments change. Tracks reactive state deeply.

```svelte
<script>
	let count = $state(0);
	let message = $state('hello');

	$inspect(count, message); // logs when count or message change
</script>

<button onclick={() => count++}>Increment</button>
<input bind:value={message} />
```

## $inspect(...).with

Custom callback instead of `console.log`. First arg is `"init"` or `"update"`, rest are inspected values.

```svelte
<script>
	let count = $state(0);

	$inspect(count).with((type, count) => {
		if (type === 'update') {
			debugger; // or console.trace, etc
		}
	});
</script>

<button onclick={() => count++}>Increment</button>
```

**Tip:** Pass `console.trace` to find change origin:

```js
// @errors: 2304
$inspect(stuff).with(console.trace);
```

## $inspect.trace(...)

Added in 5.14. Traces function re-runs in [$effect]($effect) or [$derived]($derived), logging which reactive state caused the update.

**Must be first statement in function body.**

```svelte
<script>
	import { doSomeWork } from './elsewhere';

	$effect(() => {
		// $inspect.trace must be the first statement of a function body
		$inspect.trace();
		doSomeWork();
	});
</script>
```

Takes optional label as first argument.