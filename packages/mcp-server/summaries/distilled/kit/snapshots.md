# Snapshots

Preserve ephemeral DOM state (scroll positions, input values, etc.) across navigation.

## Usage

Export a `snapshot` object with `capture` and `restore` methods from `+page.svelte` or `+layout.svelte`:

```svelte
<!--- file: +page.svelte --->
<script>
	let comment = $state('');

	/** @type {import('./$types').Snapshot<string>} */
	export const snapshot = {
		capture: () => comment,
		restore: (value) => comment = value
	};
</script>

<form method="POST">
	<label for="comment">Comment</label>
	<textarea id="comment" bind:value={comment} />
	<button>Post comment</button>
</form>
```

- `capture` - called before page updates, returns value stored in browser history
- `restore` - called when navigating back, receives stored value

## Constraints

- Data must be JSON serializable (persisted to `sessionStorage`)
- Avoid large objects - retained in memory for session duration