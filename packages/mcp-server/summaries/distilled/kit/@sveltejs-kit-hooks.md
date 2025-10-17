# sequence

Helper for chaining multiple `handle` functions in middleware-like manner.

```js
import { sequence } from '@sveltejs/kit/hooks';
```

## Behavior

- `transformPageChunk`: applied in **reverse order**, merged
- `preload`: applied in **forward order**, first wins (subsequent calls skipped)
- `filterSerializedResponseHeaders`: same as `preload` (first wins)

## Example

```js
/// file: src/hooks.server.js
import { sequence } from '@sveltejs/kit/hooks';

/** @type {import('@sveltejs/kit').Handle} */
async function first({ event, resolve }) {
	console.log('first pre-processing');
	const result = await resolve(event, {
		transformPageChunk: ({ html }) => {
			// transforms are applied in reverse order
			console.log('first transform');
			return html;
		},
		preload: () => {
			// this one wins as it's the first defined in the chain
			console.log('first preload');
			return true;
		}
	});
	console.log('first post-processing');
	return result;
}

/** @type {import('@sveltejs/kit').Handle} */
async function second({ event, resolve }) {
	console.log('second pre-processing');
	const result = await resolve(event, {
		transformPageChunk: ({ html }) => {
			console.log('second transform');
			return html;
		},
		preload: () => {
			console.log('second preload');
			return true;
		},
		filterSerializedResponseHeaders: () => {
			// this one wins as it's the first defined in the chain
			console.log('second filterSerializedResponseHeaders');
			return true;
		}
	});
	console.log('second post-processing');
	return result;
}

export const handle = sequence(first, second);
```

**Output:**
```
first pre-processing
first preload
second pre-processing
second filterSerializedResponseHeaders
second transform
first transform
second post-processing
first post-processing
```

## Type

```dts
function sequence(...handlers: Handle[]): Handle;
```