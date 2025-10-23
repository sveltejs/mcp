# $app/state

Three read-only state objects for SvelteKit apps. Added in 2.12 (use `$app/stores` for earlier versions).

```js
import { navigating, page, updated } from '$app/state';
```

## navigating

Read-only object representing in-progress navigation. `null` when no navigation occurring or during SSR.

```dts
const navigating:
	| import('@sveltejs/kit').Navigation
	| {
			from: null;
			to: null;
			type: null;
			willUnload: null;
			delta: null;
			complete: null;
	  };
```

Properties: `from`, `to`, `type`, and `delta` (if `type === 'popstate'`).

## page

Read-only reactive object with current page info:
- Combined `data` from all pages/layouts
- Current `form` prop value
- Page state from `goto`, `pushState`, `replaceState`
- Metadata: URL, route, params, error status

```svelte
<!--- file: +layout.svelte --->
<script>
	import { page } from '$app/state';
</script>

<p>Currently at {page.url.pathname}</p>

{#if page.error}
	<span class="red">Problem detected</span>
{:else}
	<span class="small">All systems operational</span>
{/if}
```

**Important:** Changes only work with runes, not legacy reactivity:

```svelte
<!--- file: +page.svelte --->
<script>
	import { page } from '$app/state';
	const id = $derived(page.params.id); // ✓ Updates correctly
	$: badId = page.params.id; // ✗ Never updates after initial load
</script>
```

Server: read only during rendering (not in `load` functions).  
Browser: read anytime.

```dts
const page: import('@sveltejs/kit').Page;
```

## updated

Read-only reactive value, initially `false`. Becomes `true` when new app version detected (if `version.pollInterval` configured). `updated.check()` forces immediate check.

```dts
const updated: {
	get current(): boolean;
	check(): Promise<boolean>;
};
```