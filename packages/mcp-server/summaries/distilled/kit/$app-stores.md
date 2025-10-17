# $app/stores

**DEPRECATED**: Use `$app/state` instead (SvelteKit 2.12+). Store-based equivalents for legacy support.

```js
import { getStores, navigating, page, updated } from '$app/stores';
```

## getStores

```dts
function getStores(): {
	page: typeof page;
	navigating: typeof navigating;
	updated: typeof updated;
};
```

## navigating

**Readable store** for navigation state.

- **During navigation**: `Navigation` object with `from`, `to`, `type`, and `delta` (if `type === 'popstate'`)
- **When idle**: `null`

**Server**: Subscribe only during component initialization  
**Browser**: Subscribe anytime

```dts
const navigating: import('svelte/store').Readable<
	import('@sveltejs/kit').Navigation | null
>;
```

## page

**Readable store** containing page data.

**Server**: Subscribe only during component initialization  
**Browser**: Subscribe anytime

```dts
const page: import('svelte/store').Readable<
	import('@sveltejs/kit').Page
>;
```

## updated

**Readable store** for app version updates.

- Initial value: `false`
- Becomes `true` when new version detected (if `version.pollInterval` configured)
- `updated.check()`: Force immediate version check

**Server**: Subscribe only during component initialization  
**Browser**: Subscribe anytime

```dts
const updated: import('svelte/store').Readable<boolean> & {
	check(): Promise<boolean>;
};
```