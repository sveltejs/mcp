# on

Attaches event handlers and returns a cleanup function. Preserves correct order relative to declarative handlers (like `onclick`) which use event delegation.

```js
import { on } from 'svelte/events';
```

## API

```dts
function on(
	element: EventTarget, // Window, Document, HTMLElement, MediaQueryList, etc.
	type: string,
	handler: EventListener,
	options?: AddEventListenerOptions
): () => void;
```

**Key benefit:** Maintains proper event ordering with Svelte's declarative event handlers.

**Returns:** Cleanup function to remove the handler.