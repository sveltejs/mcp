# Async `await` in Components

**Experimental feature (Svelte 5.36+)** - opt in via config:

```js
/// file: svelte.config.js
export default {
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};
```

Flag removed in Svelte 6.

## Usage

Use `await` in three places:
- Top level of `<script>`
- Inside `$derived(...)` declarations
- Inside markup

## Synchronized Updates

State changes wait for async work to complete before UI updates, preventing inconsistent states:

```svelte
<script>
	let a = $state(1);
	let b = $state(2);

	async function add(a, b) {
		await new Promise((f) => setTimeout(f, 500)); // artificial delay
		return a + b;
	}
</script>

<input type="number" bind:value={a}>
<input type="number" bind:value={b}>

<p>{a} + {b} = {await add(a, b)}</p>
```

Incrementing `a` won't show `2 + 2 = 3`, waits to show `2 + 2 = 4`. Fast updates can overtake slow ones.

## Concurrency

Independent `await` expressions run in parallel:

```svelte
<p>{await one()}</p>
<p>{await two()}</p>
```

Both functions run simultaneously. Sequential `await` in `<script>` runs normally. Independent `$derived` expressions update independently:

```js
// these will run sequentially the first time,
// but will update independently
let a = $derived(await one());
let b = $derived(await two());
```

> **Note:** Expect [`await_waterfall`](runtime-warnings#Client-warnings-await_waterfall) warning

## Loading States

**Initial loading:** Use `<svelte:boundary>` with `pending` snippet (shown only on first load, not updates).

**Subsequent updates:** Use `$effect.pending()` for spinners/indicators.

**Wait for completion:** Use `settled()`:

```js
import { tick, settled } from 'svelte';

async function onclick() {
	updating = true;

	// without this, the change to `updating` will be
	// grouped with the other changes, meaning it
	// won't be reflected in the UI
	await tick();

	color = 'octarine';
	answer = 42;

	await settled();

	// any updates affected by `color` or `answer`
	// have now been applied
	updating = false;
}
```

## Error Handling

Errors bubble to nearest [error boundary](svelte-boundary).

## SSR

Await `render()` for async SSR:

```js
/// file: server.js
import { render } from 'svelte/server';
import App from './App.svelte';

const { head, body } = await render(App);
```

Boundaries with `pending` snippets render that snippet during SSR. Other `await` expressions resolve before `render()` returns.

## Caveats

- Experimental: breaking changes possible outside semver major
- Effect order changes: block effects (`{#if}`, `{#each}`) now run before `$effect.pre`/`beforeUpdate` in same component