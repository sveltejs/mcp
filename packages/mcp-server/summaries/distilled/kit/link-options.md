# Link Options

SvelteKit uses native `<a>` elements for navigation. Customize behavior with `data-sveltekit-*` attributes on links or parent elements. Also applies to `<form method="GET">`.

## data-sveltekit-preload-data

Preload page data on hover/touch before click happens.

**Values:**
- `"hover"` - preload on mouse rest over link (desktop) or `touchstart` (mobile)
- `"tap"` - preload on `touchstart` or `mousedown` only

**Default template:**
```html
<body data-sveltekit-preload-data="hover">
	<div style="display: contents">%sveltekit.body%</div>
</body>
```

**Override for specific links:**
```html
<a data-sveltekit-preload-data="tap" href="/stonks">
	Get current stonk values
</a>
```

> Ignored if user has `navigator.connection.saveData` enabled.

## data-sveltekit-preload-code

Preload route code without data.

**Values (decreasing eagerness):**
- `"eager"` - preload immediately
- `"viewport"` - preload when link enters viewport
- `"hover"` - preload on hover (code only)
- `"tap"` - preload on tap (code only)

> `viewport` and `eager` only work for links present immediately after navigation, not dynamically added links.
> Only takes effect if more eager than `data-sveltekit-preload-data`.
> Ignored if user has reduced data usage enabled.

## data-sveltekit-reload

Force full-page navigation instead of client-side routing.

```html
<a data-sveltekit-reload href="/path">Path</a>
```

> Links with `rel="external"` get same treatment and are ignored during prerendering.

## data-sveltekit-replacestate

Replace current history entry instead of creating new one.

```html
<a data-sveltekit-replacestate href="/path">Path</a>
```

## data-sveltekit-keepfocus

Prevent focus reset after navigation.

```html
<form data-sveltekit-keepfocus>
	<input type="text" name="query">
</form>
```

> Avoid on links. Only use on elements that persist after navigation.

## data-sveltekit-noscroll

Prevent scroll to top (or `#hash`) after navigation.

```html
<a href="path" data-sveltekit-noscroll>Path</a>
```

## Disabling Options

Use `"false"` value to disable inherited attributes:

```html
<div data-sveltekit-preload-data>
	<!-- these links will be preloaded -->
	<a href="/a">a</a>
	<a href="/b">b</a>
	<a href="/c">c</a>

	<div data-sveltekit-preload-data="false">
		<!-- these links will NOT be preloaded -->
		<a href="/d">d</a>
		<a href="/e">e</a>
		<a href="/f">f</a>
	</div>
</div>
```

**Conditional attributes:**
```svelte
<div data-sveltekit-preload-data={condition ? 'hover' : false}>
```