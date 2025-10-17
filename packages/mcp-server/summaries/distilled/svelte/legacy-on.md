# Event Handlers

## Runes Mode vs Legacy Mode

**Runes mode**: Event handlers are just attributes/props.

**Legacy mode**: Use `on:` directive.

## Basic Usage

```svelte
<!--- file: App.svelte --->
<script>
	let count = 0;

	/** @param {MouseEvent} event */
	function handleClick(event) {
		count += 1;
	}
</script>

<button on:click={handleClick}>
	count: {count}
</button>
```

Inline handlers (no performance penalty):

```svelte
<button on:click={() => (count += 1)}>
	count: {count}
</button>
```

## Event Modifiers

Add modifiers with `|` character:

```svelte
<form on:submit|preventDefault={handleSubmit}>
	<!-- the `submit` event's default is prevented,
	     so the page won't reload -->
</form>
```

**Available modifiers:**
- `preventDefault` — calls `event.preventDefault()`
- `stopPropagation` — prevents event reaching next element
- `stopImmediatePropagation` — prevents other listeners of same event
- `passive` — improves scrolling performance (auto-added when safe)
- `nonpassive` — explicitly set `passive: false`
- `capture` — fires during capture phase
- `once` — remove handler after first run
- `self` — only trigger if `event.target` is the element itself
- `trusted` — only trigger if `event.isTrusted` is `true`

Chain modifiers: `on:click|once|capture={...}`

## Event Forwarding

Empty `on:` directive forwards the event:

```svelte
<button on:click>
	The component itself will emit the click event
</button>
```

## Multiple Listeners

```svelte
<!--- file: App.svelte --->
<script>
	let count = 0;

	function increment() {
		count += 1;
	}

	/** @param {MouseEvent} event */
	function log(event) {
		console.log(event);
	}
</script>

<button on:click={increment} on:click={log}>
	clicks: {count}
</button>
```

## Component Events (Legacy - Deprecated)

**Note**: Use callback props instead for Svelte 5. `createEventDispatcher` is deprecated.

**Callback props approach (recommended):**

```svelte
<!--- file: Stepper.svelte --->
<script>
	export let decrement;
	export let increment;
</script>

<button on:click={decrement}>decrement</button>
<button on:click={increment}>increment</button>
```

**Key points:**
- Component events don't bubble (only immediate children)
- Only `once` modifier valid on component events