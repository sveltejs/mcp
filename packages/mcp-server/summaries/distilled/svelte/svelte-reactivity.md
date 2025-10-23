# svelte/reactivity

Reactive versions of built-ins (`Map`, `Set`, `URL`, etc.) and reactivity utilities.

```js
import {
	MediaQuery,
	SvelteDate,
	SvelteMap,
	SvelteSet,
	SvelteURL,
	SvelteURLSearchParams,
	createSubscriber
} from 'svelte/reactivity';
```

## MediaQuery

Creates a reactive media query with a `current` property.

**Warning:** No way to know correct value during SSR, may cause hydration mismatch. Use CSS media queries when possible.

```svelte
<script>
	import { MediaQuery } from 'svelte/reactivity';

	const large = new MediaQuery('min-width: 800px');
</script>

<h1>{large.current ? 'large screen' : 'small screen'}</h1>
```

```dts
constructor(query: string, fallback?: boolean | undefined);
```

## SvelteDate

Reactive `Date` object. Reading in `$effect` or `$derived` re-evaluates when date changes.

```svelte
<script>
	import { SvelteDate } from 'svelte/reactivity';

	const date = new SvelteDate();

	const formatter = new Intl.DateTimeFormat(undefined, {
	  hour: 'numeric',
	  minute: 'numeric',
	  second: 'numeric'
	});

	$effect(() => {
		const interval = setInterval(() => {
			date.setTime(Date.now());
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<p>The time is {formatter.format(date)}</p>
```

## SvelteMap

Reactive `Map`. Reading contents (iterating, `.size`, `.get()`, `.has()`) in `$effect` or `$derived` re-evaluates when updated.

**Note:** Values are NOT deeply reactive.

```svelte
<script>
	import { SvelteMap } from 'svelte/reactivity';
	import { result } from './game.js';

	let board = new SvelteMap();
	let player = $state('x');
	let winner = $derived(result(board));

	function reset() {
		player = 'x';
		board.clear();
	}
</script>

<div class="board">
	{#each Array(9), i}
		<button
			disabled={board.has(i) || winner}
			onclick={() => {
				board.set(i, player);
				player = player === 'x' ? 'o' : 'x';
			}}
		>{board.get(i)}</button>
	{/each}
</div>

{#if winner}
	<p>{winner} wins!</p>
	<button onclick={reset}>reset</button>
{:else}
	<p>{player} is next</p>
{/if}
```

## SvelteSet

Reactive `Set`. Reading contents (iterating, `.size`, `.has()`) in `$effect` or `$derived` re-evaluates when updated.

**Note:** Values are NOT deeply reactive.

```svelte
<script>
	import { SvelteSet } from 'svelte/reactivity';
	let monkeys = new SvelteSet();

	function toggle(monkey) {
		if (monkeys.has(monkey)) {
			monkeys.delete(monkey);
		} else {
			monkeys.add(monkey);
		}
	}
</script>

{#each ['🙈', '🙉', '🙊'] as monkey}
	<button onclick={() => toggle(monkey)}>{monkey}</button>
{/each}

<button onclick={() => monkeys.clear()}>clear</button>

{#if monkeys.has('🙈')}<p>see no evil</p>{/if}
{#if monkeys.has('🙉')}<p>hear no evil</p>{/if}
{#if monkeys.has('🙊')}<p>speak no evil</p>{/if}
```

## SvelteURL

Reactive `URL`. Reading properties (`.href`, `.pathname`, etc.) in `$effect` or `$derived` re-evaluates when changed.

`.searchParams` is a `SvelteURLSearchParams` instance.

```svelte
<script>
	import { SvelteURL } from 'svelte/reactivity';

	const url = new SvelteURL('https://example.com/path');
</script>

<!-- changes to these... -->
<input bind:value={url.protocol} />
<input bind:value={url.hostname} />
<input bind:value={url.pathname} />

<hr />

<!-- will update `href` and vice versa -->
<input bind:value={url.href} size="65" />
```

## SvelteURLSearchParams

Reactive `URLSearchParams`. Reading contents (iterating, `.get()`, `.getAll()`) in `$effect` or `$derived` re-evaluates when updated.

```svelte
<script>
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	const params = new SvelteURLSearchParams('message=hello');

	let key = $state('key');
	let value = $state('value');
</script>

<input bind:value={key} />
<input bind:value={value} />
<button onclick={() => params.append(key, value)}>append</button>

<p>?{params.toString()}</p>

{#each params as [key, value]}
	<p>{key}: {value}</p>
{/each}
```

## createSubscriber

Integrates external event-based systems with Svelte reactivity. Returns a `subscribe` function.

When called inside `$effect`, the `start` callback receives an `update` function. Calling `update` re-runs the effect. `start` can return cleanup function.

Multiple effects share one `start` call; cleanup runs when all effects destroyed.

Example `MediaQuery` implementation:

```js
// @errors: 7031
import { createSubscriber } from 'svelte/reactivity';
import { on } from 'svelte/events';

export class MediaQuery {
	#query;
	#subscribe;

	constructor(query) {
		this.#query = window.matchMedia(`(${query})`);

		this.#subscribe = createSubscriber((update) => {
			// when the `change` event occurs, re-run any effects that read `this.current`
			const off = on(this.#query, 'change', update);

			// stop listening when all the effects are destroyed
			return () => off();
		});
	}

	get current() {
		// This makes the getter reactive, if read in an effect
		this.#subscribe();

		// Return the current state of the query, whether or not we're in an effect
		return this.#query.matches;
	}
}
```

```dts
function createSubscriber(
	start: (update: () => void) => (() => void) | void
): () => void;
```