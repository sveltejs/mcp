# Client Errors

## async_derived_orphan
Cannot create `$derived(...)` with `await` outside an effect tree.

`$derived` runs lazily and can be garbage collected. `$effect` runs eagerly until destroyed. Async deriveds use an effect internally, so they must be created inside another effect or effect root (like component initialization).

## bind_invalid_checkbox_value
Use `bind:checked` instead of `bind:value` with checkbox inputs.

## bind_invalid_export
Cannot use `bind:key` on component exports. Use `bind:this` instead:
```svelte
<Component bind:this={component} />
<!-- then access: component.key -->
```

## bind_not_bindable
To make a property bindable: `let { key = $bindable() } = $props()`

## component_api_changed / component_api_invalid_new
Components are no longer classes in Svelte 5. Cannot call methods or use `new` on component instances. See migration guide.

## derived_references_self
A derived value cannot reference itself recursively.

## each_key_duplicate
Keyed each block has duplicate keys.

## effect_in_teardown
`%rune%` cannot be used inside effect cleanup functions.

## effect_in_unowned_derived
Effect cannot be created inside a `$derived` that wasn't itself created inside an effect.

## effect_orphan
`%rune%` can only be used inside an effect (e.g. during component initialization).

## effect_pending_outside_reaction
`$effect.pending()` can only be called inside an effect or derived.

## effect_update_depth_exceeded
Effect reads and writes the same state, causing infinite loop:

```js
let count = $state(0);

$effect(() => {
	// reads and writes count - infinite loop
	count += 1;
});
```

```js
let array = $state(['hello']);

$effect(() => {
	array.push('goodbye'); // mutates array it depends on
});
});
```

**Fix:** Use non-reactive values or `untrack()` to read without adding dependency. Effects that settle are fine:

```js
$effect(() => {
	array.sort(); // OK if already sorted
});
```

## flush_sync_in_effect
Cannot use `flushSync()` inside an effect. Call it after state changes, not during effect execution. (Applies with `experimental.async` option)

## get_abort_signal_outside_reaction
`getAbortSignal()` can only be called inside an effect or derived.

## hydration_failed
Failed to hydrate the application.

## invalid_snippet
Use optional chaining for nullable snippets: `{@render snippet?.()}`

## lifecycle_legacy_only
`%name%(...)` cannot be used in runes mode.

## props_invalid_value
Cannot do `bind:key={undefined}` when `key` has a fallback value.

## props_rest_readonly
Rest element properties of `$props()` are readonly.

## rune_outside_svelte
Runes only available inside `.svelte` and `.svelte.js/ts` files.

## set_context_after_init
`setContext` must be called during component initialization, not in effects or after `await`. (Applies with `experimental.async` option)

## state_descriptors_fixed
Property descriptors on `$state` objects must contain `value` and be `enumerable`, `configurable`, and `writable`.

## state_prototype_fixed
Cannot set prototype of `$state` object.

## state_unsafe_mutation
Cannot update state inside `$derived(...)`, `$inspect(...)`, or template expressions.

**Wrong:**
```js
let count = $state(0);
let even = $state(true);

let odd = $derived.by(() => {
	even = count % 2 === 0; // mutation in derived
	return !even;
});
```

**Fix:** Make everything derived:
```js
let even = $derived(count % 2 === 0);
let odd = $derived(!even);
```

Use `$effect` if side-effects are unavoidable.

## svelte_boundary_reset_onerror
Cannot call `reset()` synchronously in `<svelte:boundary>` `onerror`. Wait for boundary to settle:

```svelte
<svelte:boundary onerror={async (error, reset) => {
	fixTheError();
	await tick();
	reset();
}}>
</svelte:boundary>
```

# Server Errors

## await_invalid
Encountered async work while rendering synchronously. Either `await` the result of `render()` or wrap `await` in `<svelte:boundary>` with `pending` snippet.

## html_deprecated
Use `body` instead of `html` property in server render results.

## lifecycle_function_unavailable
Methods like `mount()` unavailable on server. Don't call them during render.

# Shared Errors

## invalid_default_snippet
Cannot use `{@render children(...)}` if parent uses `let:` directives. Use named snippets instead.

## invalid_snippet_arguments
Snippets should only be instantiated via `{@render ...}`.

## lifecycle_outside_component
Lifecycle methods only work during component initialization at top level:

```svelte
<script>
    import { onMount } from 'svelte';

    function handleClick() {
        onMount(() => {}) // Wrong
    }

    onMount(() => {}) // Correct
</script>
```

## snippet_without_render_tag
Use `{@render snippet()}` instead of `{snippet}` to render snippet content.

## store_invalid_shape
`%name%` is not a store with a `subscribe` method.

## svelte_element_invalid_this_value
The `this` prop on `<svelte:element>` must be a string, if defined.