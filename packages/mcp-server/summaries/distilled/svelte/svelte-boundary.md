# `<svelte:boundary>`

```svelte
<svelte:boundary onerror={handler}>...</svelte:boundary>
```

**Added in 5.3.0**

Isolates parts of your app to:
- Show UI while `await` expressions resolve
- Catch rendering/effect errors and show fallback UI

When boundary handles an error, existing content is removed.

**Important:** Only catches errors during rendering and top-level `$effect`. Does NOT catch errors in event handlers, `setTimeout`, or async work.

## Properties

### `pending`

**Added in 5.36**

Shows snippet until all `await` expressions resolve. Only shown on initial load, not subsequent updates (use `$effect.pending()` for those).

```svelte
<svelte:boundary>
	<p>{await delayed('hello!')}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
```

### `failed`

Renders when error thrown. Receives `error` and `reset` function:

```svelte
<svelte:boundary>
	<FlakyComponent />

	{#snippet failed(error, reset)}
		<button onclick={reset}>oops! try again</button>
	{/snippet}
</svelte:boundary>
```

Can pass explicitly: `<svelte:boundary {failed}>` or implicitly by declaring inside boundary.

### `onerror`

Function called with `error` and `reset` args. Useful for error tracking or managing state outside boundary:

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