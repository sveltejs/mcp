# `<svelte:window>`

Add event listeners to `window` without cleanup or SSR checks.

**Syntax:**
```svelte
<svelte:window onevent={handler} />
<svelte:window bind:prop={value} />
```

**Rules:**
- Must be at top level (not inside blocks/elements)

## Event Listeners

```svelte
<script>
	function handleKeydown(event) {
		alert(`pressed the ${event.key} key`);
	}
</script>

<svelte:window onkeydown={handleKeydown} />
```

## Bindable Properties

**Readonly:**
- `innerWidth`, `innerHeight`
- `outerWidth`, `outerHeight`
- `online` (alias for `window.navigator.onLine`)
- `devicePixelRatio`

**Writable:**
- `scrollX`, `scrollY`

```svelte
<svelte:window bind:scrollY={y} />
```

**Gotcha:** Initial binding values don't trigger scrolling (accessibility). Only subsequent changes scroll. To scroll on render, use `scrollTo()` in `$effect`.