# svelte/reactivity/window

Reactive versions of `window` values. Each has a `.current` property usable in templates, `$derived`, and `$effect` without manual event listeners.

```svelte
<script>
	import { innerWidth, innerHeight } from 'svelte/reactivity/window';
</script>

<p>{innerWidth.current}x{innerHeight.current}</p>
```

## Available Exports

```js
import {
	devicePixelRatio,
	innerHeight,
	innerWidth,
	online,
	outerHeight,
	outerWidth,
	screenLeft,
	screenTop,
	scrollX,
	scrollY
} from 'svelte/reactivity/window';
```

All values are `undefined` on the server.

## API Reference

| Export | Maps to | Notes |
|--------|---------|-------|
| `devicePixelRatio.current` | `window.devicePixelRatio` | Chrome: responds to zoom; Firefox/Safari: doesn't |
| `innerHeight.current` | `window.innerHeight` | |
| `innerWidth.current` | `window.innerWidth` | |
| `online.current` | `navigator.onLine` | Returns `boolean \| undefined` |
| `outerHeight.current` | `window.outerHeight` | |
| `outerWidth.current` | `window.outerWidth` | |
| `screenLeft.current` | `window.screenLeft` | Updated in `requestAnimationFrame` |
| `screenTop.current` | `window.screenTop` | Updated in `requestAnimationFrame` |
| `scrollX.current` | `window.scrollX` | |
| `scrollY.current` | `window.scrollY` | |