# $app/navigation

```js
import {
	afterNavigate,
	beforeNavigate,
	disableScrollHandling,
	goto,
	invalidate,
	invalidateAll,
	onNavigate,
	preloadCode,
	preloadData,
	pushState,
	refreshAll,
	replaceState
} from '$app/navigation';
```

## afterNavigate

Runs callback when component mounts and on every navigation. Must be called during component initialization. Active while component is mounted.

```dts
function afterNavigate(
	callback: (navigation: import('@sveltejs/kit').AfterNavigate) => void
): void;
```

## beforeNavigate

Intercepts navigation before it happens (links, `goto()`, browser back/forward). Call `cancel()` to prevent navigation. For `'leave'` navigations (closing tab/navigating away), `cancel()` triggers native browser confirmation dialog.

- `navigation.to.route.id` is `null` for non-SvelteKit routes
- `navigation.willUnload` is `true` for `'leave'` navigations and `'link'` navigations where `navigation.to.route === null`

Must be called during component initialization. Active while component is mounted.

```dts
function beforeNavigate(
	callback: (navigation: import('@sveltejs/kit').BeforeNavigate) => void
): void;
```

## disableScrollHandling

Disables SvelteKit's built-in scroll handling when called during page update (in `onMount`, `afterNavigate`, or actions). Discouraged as it breaks user expectations.

```dts
function disableScrollHandling(): void;
```

## goto

Navigate programmatically. Returns Promise that resolves on navigation completion. For external URLs, use `window.location = url` instead.

```dts
function goto(
	url: string | URL,
	opts?: {
		replaceState?: boolean | undefined;
		noScroll?: boolean | undefined;
		keepFocus?: boolean | undefined;
		invalidateAll?: boolean | undefined;
		invalidate?: (string | URL | ((url: URL) => boolean))[] | undefined;
		state?: App.PageState | undefined;
	}
): Promise<void>;
```

## invalidate

Re-runs `load` functions that depend on the URL (via `fetch` or `depends`). Returns Promise that resolves when page updates.

- String/URL must match exactly what was passed to `fetch`/`depends` (including query params)
- Custom identifiers: use format `[a-z]+:` (e.g. `custom:state`)
- Function predicate receives full URL, re-runs if returns `true`

```ts
// Match '/path' regardless of query parameters
import { invalidate } from '$app/navigation';

invalidate((url) => url.pathname === '/path');
```

```dts
function invalidate(
	resource: string | URL | ((url: URL) => boolean)
): Promise<void>;
```

## invalidateAll

Re-runs all `load` functions for current page. Returns Promise that resolves when page updates.

```dts
function invalidateAll(): Promise<void>;
```

## onNavigate

Runs callback immediately before navigation (except full-page navigations). Return Promise to delay navigation completion (useful for `document.startViewTransition`). Avoid slow promises as navigation appears stalled.

Returning a function (or Promise resolving to function) calls it after DOM updates.

Must be called during component initialization. Active while component is mounted.

```dts
function onNavigate(
	callback: (navigation: import('@sveltejs/kit').OnNavigate) => 
		MaybePromise<(() => void) | void>
): void;
```

## preloadCode

Imports code for routes not yet fetched. Specify routes by pathname: `/about` or `/blog/*`. Doesn't call `load` functions. Returns Promise resolving when modules imported.

```dts
function preloadCode(pathname: string): Promise<void>;
```

## preloadData

Preloads page: imports code and calls `load` functions. Same as hovering/tapping `<a>` with `data-sveltekit-preload-data`. Makes navigation instantaneous if next navigation is to `href`. Returns Promise with `load` results.

```dts
function preloadData(href: string): Promise<
	| { type: 'loaded'; status: number; data: Record<string, any>; }
	| { type: 'redirect'; location: string; }
>;
```

## pushState

Creates new history entry with given `page.state`. Pass `''` for current URL. Used for shallow routing.

```dts
function pushState(url: string | URL, state: App.PageState): void;
```

## refreshAll

Refreshes all active remote functions and re-runs `load` functions (unless disabled). Returns Promise resolving when page updates.

```dts
function refreshAll({
	includeLoadFunctions
}?: {
	includeLoadFunctions?: boolean;
}): Promise<void>;
```

## replaceState

Replaces current history entry with given `page.state`. Pass `''` for current URL. Used for shallow routing.

```dts
function replaceState(url: string | URL, state: App.PageState): void;
```