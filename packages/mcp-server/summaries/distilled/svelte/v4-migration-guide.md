# Svelte 3 to 4 Migration Guide

Migration script: `npx svelte-migrate@latest svelte-4`

## Minimum Requirements

- Node 16+
- SvelteKit 1.20.4+
- `vite-plugin-svelte` 2.4.1+ (Vite without SvelteKit)
- webpack 5+ and `svelte-loader` 3.1.8+
- `rollup-plugin-svelte` 7.1.5+
- TypeScript 5+

## Browser Conditions for Bundlers

Bundlers must specify `browser` condition for frontend bundles or lifecycle callbacks like `onMount` won't work.

- **Rollup**: Set `browser: true` in `@rollup/plugin-node-resolve`
- **webpack**: Add `"browser"` to `conditionNames` array

## CJS Output Removed

No more CommonJS format, `svelte/register` hook, or CJS runtime. Use a bundler to convert ESM to CJS if needed.

## Stricter Types

### `createEventDispatcher`

Now enforces optional/required/non-existent payloads:

```ts
// @errors: 2554 2345
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher<{
	optional: number | null;
	required: string;
	noArgument: null;
}>();

// Svelte version 3:
dispatch('optional');
dispatch('required'); // I can still omit the detail argument
dispatch('noArgument', 'surprise'); // I can still add a detail argument

// Svelte version 4 using TypeScript strict mode:
dispatch('optional');
dispatch('required'); // error, missing argument
dispatch('noArgument', 'surprise'); // error, cannot pass an argument
```

### `Action` and `ActionReturn`

Default parameter type is now `undefined`. Must type generic if action receives parameters:

```ts
// @noErrors
const action: Action = (node, params) => { ... } // this is now an error if you use params in any way
const action: Action<HTMLElement, string> = (node, params) => { ... } // params is of type string
```

### `onMount`

Type error if returning function asynchronously (reveals bugs where cleanup won't be called):

```js
// @noErrors
// Example where this change reveals an actual bug
onMount(
	// someCleanup() not called because function handed to onMount is async
	async () => {
		const something = await foo();
		// ...
		return () => someCleanup();
	}
);
```

## Custom Elements

`tag` option deprecated, use `customElement`:

```svelte
<svelte:options tag="my-component" />
<svelte:options customElement="my-component" />
```

## `SvelteComponentTyped` Deprecated

Replace with `SvelteComponent`:

```js
import { SvelteComponentTyped } from 'svelte';
import { SvelteComponent } from 'svelte';

export class Foo extends SvelteComponentTyped<{ aProp: string }> {}
export class Foo extends SvelteComponent<{ aProp: string }> {}
```

For component instance types, change `: typeof SvelteComponent` to `: typeof SvelteComponent<any>`:

```svelte
<script>
	import ComponentA from './ComponentA.svelte';
	import ComponentB from './ComponentB.svelte';
	import { SvelteComponent } from 'svelte';

	let component: typeof SvelteComponent<any>;

	function choseRandomly() {
		component = Math.random() > 0.5 ? ComponentA : ComponentB;
	}
</script>

<button on:click={choseRandomly}>random</button>
<svelte:element this={component} />
```

## Transitions Local by Default

Transitions only play when direct parent block is created/destroyed, not ancestor blocks:

```svelte
{#if show}
	...
	{#if success}
		<p in:slide>Success</p>
	{/each}
{/if}
```

Use `|global` modifier for old behavior. Migration script adds this automatically.

## Default Slot Bindings

Default slot bindings not exposed to named slots and vice versa:

```svelte
<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:count>
	<p>
		count in default slot - is available: {count}
	</p>
	<p slot="bar">
		count in bar slot - is not available: {count}
	</p>
</Nested>
```

## Preprocessors

Execute in order: markup → script → style within each preprocessor group:

```js
// @errors: 2304
import { preprocess } from 'svelte/compiler';

const { code } = await preprocess(
	source,
	[
		{
			markup: () => {
				console.log('markup-1');
			},
			script: () => {
				console.log('script-1');
			},
			style: () => {
				console.log('style-1');
			}
		},
		{
			markup: () => {
				console.log('markup-2');
			},
			script: () => {
				console.log('script-2');
			},
			style: () => {
				console.log('style-2');
			}
		}
	],
	{
		filename: 'App.svelte'
	}
);

// Svelte 3 logs:
// markup-1
// markup-2
// script-1
// script-2
// style-1
// style-2

// Svelte 4 logs:
// markup-1
// script-1
// style-1
// markup-2
// script-2
// style-2
```

Put MDsveX before script/style preprocessors:

```js
// @noErrors
preprocess: [
	vitePreprocess(),
	mdsvex(mdsvexConfig)
	mdsvex(mdsvexConfig),
	vitePreprocess()
]
```

Each preprocessor must have a name.

## ESLint

`eslint-plugin-svelte3` deprecated. Use [eslint-plugin-svelte](https://github.com/sveltejs/eslint-plugin-svelte).

## Other Breaking Changes

- `inert` attribute applied to outroing elements
- Runtime uses `classList.toggle(name, boolean)` (polyfill for old browsers)
- Runtime uses `CustomEvent` constructor (polyfill for old browsers)
- `StartStopNotifier` interface requires update function in addition to set function
- `derived` throws error on falsy values instead of stores
- `svelte/internal` type definitions removed
- DOM node removal batched (affects `MutationObserver` event order)
- `svelte.JSX` namespace → `svelteHTML` namespace; use types from `svelte/elements`