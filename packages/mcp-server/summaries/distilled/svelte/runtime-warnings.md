# Client Warnings

## assignment_value_stale

Assignment to a property will evaluate to the right-hand side, not the resulting value after assignment.

```svelte
<script>
	let object = $state({ array: null });

	function add() {
		(object.array ??= []).push(object.array.length);
	}
</script>

<button onclick={add}>add</button>
<p>items: {JSON.stringify(object.items)}</p>
```

The array being pushed to is `[]` on the right-hand side, but `object.array` becomes an empty state proxy. The pushed value is discarded.

**Fix:** Separate into two statements:

```js
function add() {
	object.array ??= [];
	object.array.push(object.array.length);
}
```

## await_reactivity_loss

State read after `await` in async functions isn't tracked.

```js
async function sum() {
	return await a + b;
}

let total = $derived(await sum());
```

`total` depends on `a` but not `b`. **Fix:** Pass values as arguments:

```js
async function sum(a, b) {
	return await a + b;
}

let total = $derived(await sum(a, b));
```

## await_waterfall

Async deriveds not read immediately after resolving create unnecessary waterfalls.

```js
let a = $derived(await one());
let b = $derived(await two());
```

`b` waits for `a` unnecessarily. **Fix:** Create promises first:

```js
let aPromise = $derived(one());
let bPromise = $derived(two());

let a = $derived(await aPromise);
let b = $derived(await bPromise);
```

## console_log_state

Logging `$state` proxies shows the proxy, not the value.

**Fix:** Use [`$inspect(...)`](/docs/svelte/$inspect) or [`$state.snapshot(...)`](/docs/svelte/$state#$state.snapshot).

## hydration_attribute_changed

Certain attributes (like `src` on `<img>`) keep server values during hydration to avoid refetching.

**Fix:** Ensure values match between server/client, or force update:

```svelte
<script>
	let { src } = $props();

	if (typeof window !== 'undefined') {
		const initial = src;
		src = undefined;
		$effect(() => {
			src = initial;
		});
	}
</script>

<img {src} />
```

## hydration_html_changed

`{@html ...}` values aren't repaired during hydration.

**Fix:** Same pattern as `hydration_attribute_changed` above.

## hydration_mismatch

Initial UI doesn't match server-rendered HTML. Often caused by invalid HTML structure.

## ownership_invalid_binding

When passing bound props through components, all intermediate components must use `bind:`.

```svelte
<!-- GrandParent.svelte -->
<Parent bind:value />  <!-- Not just {value} -->

<!-- Parent.svelte -->
<Child bind:value />
```

## ownership_invalid_mutation

Mutating unbound props is discouraged.

```svelte
<!--- file: Child.svelte --->
<script>
	let { person } = $props();
</script>

<input bind:value={person.name}>
```

**Fix:** Use callbacks or mark prop as [`$bindable`]($bindable).

## select_multiple_invalid_value

`<select multiple value={...}>` expects an array. Use `null`/`undefined` to keep selection as-is.

## state_proxy_equality_mismatch

`$state(...)` creates a proxy with different identity than the original value:

```svelte
<script>
	let value = { foo: 'bar' };
	let proxy = $state(value);

	value === proxy; // always false
</script>
```

**Fix:** Compare values that are both proxies or both non-proxies. Use `$state.raw(...)` to avoid proxies.

## state_proxy_unmount

Don't pass `$state` values to `unmount()`. Use `$state.raw()` if reactivity is needed.

## svelte_boundary_reset_noop

`<svelte:boundary>` `reset` function only works on first call.

## transition_slide_display

`slide` transition requires `display: block/flex/grid`. Doesn't work with `inline`, `table`, or `contents`.

# Shared Warnings

## dynamic_void_element_content

Void elements like `<input>` cannot have content in `<svelte:element>`.

## state_snapshot_uncloneable

`$state.snapshot()` returns original value for uncloneable objects (like DOM elements):

```js
const object = $state({ property: 'this is cloneable', window })
const snapshot = $state.snapshot(object);
```

`property` is cloned, `window` is not.