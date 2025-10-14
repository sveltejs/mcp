# Shallow Routing

Navigate without triggering `load` functions or replacing page components. Useful for modals that users can dismiss by navigating back.

## Basic Usage

Use `pushState` and `replaceState` to associate state with history entries:

```svelte
<!--- file: +page.svelte --->
<script>
	import { pushState } from '$app/navigation';
	import { page } from '$app/state';
	import Modal from './Modal.svelte';

	function showModal() {
		pushState('', {
			showModal: true
		});
	}
</script>

{#if page.state.showModal}
	<Modal close={() => history.back()} />
{/if}
```

Modal dismisses via back button or `history.back()` call.

## API

- **`pushState(url, state)`**: Creates new history entry
  - First arg: URL relative to current (use `''` to stay on current URL)
  - Second arg: page state accessible via `page.state`
- **`replaceState(url, state)`**: Sets state without creating history entry
- Type-safe state: declare `App.PageState` interface in `src/app.d.ts`

## Loading Data for Routes

Render another `+page.svelte` inside current page using `preloadData`:

```svelte
<!--- file: src/routes/photos/+page.svelte --->
<script>
	import { preloadData, pushState, goto } from '$app/navigation';
	import { page } from '$app/state';
	import Modal from './Modal.svelte';
	import PhotoPage from './[id]/+page.svelte';

	let { data } = $props();
</script>

{#each data.thumbnails as thumbnail}
	<a
		href="/photos/{thumbnail.id}"
		onclick={async (e) => {
			if (innerWidth < 640        // bail if the screen is too small
				|| e.shiftKey             // or the link is opened in a new window
				|| e.metaKey || e.ctrlKey // or a new tab (mac: metaKey, win/linux: ctrlKey)
				// should also consider clicking with a mouse scroll wheel
			) return;

			// prevent navigation
			e.preventDefault();

			const { href } = e.currentTarget;

			// run `load` functions (or rather, get the result of the `load` functions
			// that are already running because of `data-sveltekit-preload-data`)
			const result = await preloadData(href);

			if (result.type === 'loaded' && result.status === 200) {
				pushState(href, { selected: result.data });
			} else {
				// something bad happened! try navigating
				goto(href);
			}
		}}
	>
		<img alt={thumbnail.alt} src={thumbnail.src} />
	</a>
{/each}

{#if page.state.selected}
	<Modal onclose={() => history.back()}>
		<!-- pass page data to the +page.svelte component,
		     just like SvelteKit would on navigation -->
		<PhotoPage data={page.state.selected} />
	</Modal>
{/if}
```

`preloadData` reuses requests from `data-sveltekit-preload-data`.

## Caveats

- `page.state` is empty object during SSR and on first page load
- State not applied on page reload/return from another document
- Requires JavaScript - provide fallback behavior