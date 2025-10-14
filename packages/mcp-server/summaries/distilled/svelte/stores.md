# Stores

A store is an object that allows reactive access to a value via a store contract. The `svelte/store` module provides minimal store implementations.

## `$` Prefix Syntax

Access store values in components by prefixing with `$`. Svelte auto-subscribes/unsubscribes.

- Store must be declared at top level (not inside `if` blocks or functions)
- Assignments to `$`-prefixed variables call the store's `.set` method
- Local variables must NOT have `$` prefix

```svelte
<script>
	import { writable } from 'svelte/store';

	const count = writable(0);
	console.log($count); // logs 0

	count.set(1);
	console.log($count); // logs 1

	$count = 2;
	console.log($count); // logs 2
</script>
```

## When to Use Stores

In Svelte 5, runes replace most store use cases:

**Use runes instead:**
- Extract logic using runes in `.svelte.js`/`.svelte.ts` files
- Create shared state with `$state` objects

```ts
/// file: state.svelte.js
export const userState = $state({
	name: 'name',
	/* ... */
});
```

```svelte
<!--- file: App.svelte --->
<script>
	import { userState } from './state.svelte.js';
</script>

<p>User name: {userState.name}</p>
<button onclick={() => {
	userState.name = 'new name';
}}>
	change name
</button>
```

**Still use stores for:**
- Complex asynchronous data streams
- Manual control over updates/subscriptions
- RxJS integration

## svelte/store API

### `writable`

Store with `set` and `update` methods for external updates.

```js
import { writable } from 'svelte/store';

const count = writable(0);

count.subscribe((value) => {
	console.log(value);
}); // logs '0'

count.set(1); // logs '1'
count.update((n) => n + 1); // logs '2'
```

**Optional second argument:** Function called when subscribers go from 0→1. Must return cleanup function called when subscribers go 1→0.

```js
const count = writable(0, () => {
	console.log('got a subscriber');
	return () => console.log('no more subscribers');
});

count.set(1); // does nothing

const unsubscribe = count.subscribe((value) => {
	console.log(value);
}); // logs 'got a subscriber', then '1'

unsubscribe(); // logs 'no more subscribers'
```

### `readable`

Store that cannot be set from outside. Takes initial value and setup function (same as `writable` second argument).

```ts
import { readable } from 'svelte/store';

const time = readable(new Date(), (set) => {
	set(new Date());

	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return () => clearInterval(interval);
});

const ticktock = readable('tick', (set, update) => {
	const interval = setInterval(() => {
		update((sound) => (sound === 'tick' ? 'tock' : 'tick'));
	}, 1000);

	return () => clearInterval(interval);
});
```

### `derived`

Derives store from one or more stores. Runs on first subscription and when dependencies change.

**Synchronous:**
```ts
import { derived } from 'svelte/store';

const doubled = derived(a, ($a) => $a * 2);
```

**Asynchronous:** Use `set`/`update` arguments. Third argument is initial value (defaults to `undefined`).

```ts
const delayed = derived(
	a,
	($a, set) => {
		setTimeout(() => set($a), 1000);
	},
	2000
);

const delayedIncrement = derived(a, ($a, set, update) => {
	set($a);
	setTimeout(() => update((x) => x + 1), 1000);
});
```

**Cleanup:** Return function for cleanup on re-run or unsubscribe.

```ts
const tick = derived(
	frequency,
	($frequency, set) => {
		const interval = setInterval(() => {
			set(Date.now());
		}, 1000 / $frequency);

		return () => {
			clearInterval(interval);
		};
	},
	2000
);
```

**Multiple stores:** Pass array as first argument.

```ts
const summed = derived([a, b], ([$a, $b]) => $a + $b);

const delayed = derived([a, b], ([$a, $b], set) => {
	setTimeout(() => set($a + $b), 1000);
});
```

### `readonly`

Makes a store readonly while allowing subscriptions.

```js
import { readonly, writable } from 'svelte/store';

const writableStore = writable(1);
const readableStore = readonly(writableStore);

readableStore.subscribe(console.log);

writableStore.set(2); // console: 2
readableStore.set(2); // ERROR
```

### `get`

Retrieves current value without subscribing. Not recommended in hot code paths.

```ts
import { get } from 'svelte/store';

const value = get(store);
```

## Store Contract

```ts
store = { subscribe: (subscription: (value: any) => void) => (() => void), set?: (value: any) => void }
```

Custom stores must implement:

1. `.subscribe(fn)` - Immediately calls `fn` with current value synchronously. Returns unsubscribe function.
2. Unsubscribe function stops subscription and prevents future calls.
3. Optional `.set(value)` - Synchronously calls all active subscriptions (makes it a writable store).

**RxJS compatibility:** `.subscribe` can return object with `.unsubscribe` method.