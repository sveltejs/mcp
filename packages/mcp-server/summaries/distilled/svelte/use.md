# Actions

> **Note:** Svelte 5.29+ recommends using [attachments](@attach) instead for better flexibility and composability.

Actions are functions called when an element mounts. Added with `use:` directive. Typically use `$effect` for cleanup on unmount:

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {import('svelte/action').Action} */
	function myaction(node) {
		// node mounted in DOM

		$effect(() => {
			// setup goes here

			return () => {
				// teardown goes here
			};
		});
	}
</script>

<div use:myaction>...</div>
```

## With Arguments

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {import('svelte/action').Action} */
	function myaction(node, data) {
		// ...
	}
</script>

<div use:myaction={data}>...</div>
```

**Key:** Action called once on mount (not SSR). Does NOT re-run if argument changes.

## Typing

`Action<NodeType, Parameter, CustomEvents>`:

```svelte
<!--- file: App.svelte --->
<script>
	/**
	 * @type {import('svelte/action').Action<
	 * 	HTMLDivElement,
	 * 	undefined,
	 * 	{
	 * 		onswiperight: (e: CustomEvent) => void;
	 * 		onswipeleft: (e: CustomEvent) => void;
	 * 		// ...
	 * 	}
	 * >}
	 */
	function gestures(node) {
		$effect(() => {
			// ...
			node.dispatchEvent(new CustomEvent('swipeleft'));

			// ...
			node.dispatchEvent(new CustomEvent('swiperight'));
		});
	}
</script>

<div
	use:gestures
	onswipeleft={next}
	onswiperight={prev}
>...</div>
```