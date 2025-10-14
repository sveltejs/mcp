# `<svelte:boundary>`

```svelte
<svelte:boundary onerror={handler}>...</svelte:boundary>
```

**Added in 5.3.0**

Boundaries isolate parts of your app to:
- Show UI while `await` expressions resolve
- Catch rendering/effect errors and show fallback UI

**Key limitation:** Only catches errors during rendering and at top level of `$effect` inside the boundary. Does NOT catch errors in event handlers or async callbacks.

When a boundary handles an error, existing content is removed.

## Properties

### `pending`

Shows while `await` expressions first resolve:

```svelte
<svelte:boundary>
	<p>{await delayed('hello!')}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
```

Only shows on initial load. For subsequent updates, use `$effect.pending()`.

### `failed`

Renders when error occurs. Receives `error` and `reset` function:

```svelte
<svelte:boundary>
	<FlakyComponent />

	{#snippet failed(error, reset)}
		<button onclick={reset}>oops! try again</button>
	{/snippet}
</svelte:boundary>
```

Can be passed explicitly as property or declared inline.

### `onerror`

Function called with `error` and `reset` arguments. Useful for error tracking or managing error state externally:

```svelte
<script>
	let error = $state(null);
	let reset = $state(() => {});

	function onerror(e, r) {
		error = e;
		reset = r;
	}
</script>

<svelte:boundary {onerror}>
	<FlakyComponent />
</svelte:boundary>

{#if error}
	<button onclick={() => {
		error = null;
		reset();
	}}>
		oops! try again
	</button>
{/if}
```

Errors in `onerror` bubble to parent boundary if it exists.