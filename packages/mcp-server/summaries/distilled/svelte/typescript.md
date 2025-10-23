# TypeScript in Svelte

## `<script lang="ts">`

Add `lang="ts"` to use TypeScript:

```svelte
<script lang="ts">
	let name: string = 'world';

	function greet(name: string) {
		alert(`Hello, ${name}!`);
	}
</script>

<button onclick={(e: Event) => greet(e.target.innerText)}>
	{name as string}
</button>
```

**Limitation**: Only _type-only_ features supported (types, interfaces). Not supported:
- Enums
- `private`/`protected`/`public` with initializers
- Non-stage-4 ECMAScript features

For these, use a preprocessor.

## Preprocessor Setup

```ts
/// file: svelte.config.js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess({ script: true })
};

export default config;
```

**Recommended**: Use `npx sv create` (SvelteKit) or `npm create vite@latest` (Vite with `svelte-ts`).

## tsconfig.json

Required settings:
- `target`: `ES2015` minimum
- `verbatimModuleSyntax`: `true`
- `isolatedModules`: `true`

## Typing `$props`

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		requiredProperty: number;
		optionalProperty?: boolean;
		snippetWithStringArgument: Snippet<[string]>;
		eventHandler: (arg: string) => void;
		[key: string]: unknown;
	}

	let {
		requiredProperty,
		optionalProperty,
		snippetWithStringArgument,
		eventHandler,
		...everythingElse
	}: Props = $props();
</script>

<button onclick={() => eventHandler('clicked button')}>
	{@render snippetWithStringArgument('hello')}
</button>
```

## Generic `$props`

Use `generics` attribute for type relationships:

```svelte
<script lang="ts" generics="Item extends { text: string }">
	interface Props {
		items: Item[];
		select(item: Item): void;
	}

	let { items, select }: Props = $props();
</script>

{#each items as item}
	<button onclick={() => select(item)}>
		{item.text}
	</button>
{/each}
```

## Typing Wrapper Components

Use `svelte/elements` types:

```svelte
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let { children, ...rest }: HTMLButtonAttributes = $props();
</script>

<button {...rest}>
	{@render children?.()}
</button>
```

For elements without dedicated types:

```svelte
<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	let { children, ...rest }: SvelteHTMLElements['div'] = $props();
</script>

<div {...rest}>
	{@render children?.()}
</div>
```

## Typing `$state`

```ts
let count: number = $state(0);
```

Without initial value, type includes `undefined`. Use `as` casting if you know it will be defined:

```ts
class Counter {
	count = $state() as number;
	constructor(initial: number) {
		this.count = initial;
	}
}
```

## The `Component` Type

Constrain dynamic components:

```svelte
<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		DynamicComponent: Component<{ prop: string }>;
	}

	let { DynamicComponent }: Props = $props();
</script>

<DynamicComponent prop="foo" />
```

Extract props with `ComponentProps`:

```ts
import type { Component, ComponentProps } from 'svelte';
import MyComponent from './MyComponent.svelte';

function withProps<TComponent extends Component<any>>(
	component: TComponent,
	props: ComponentProps<TComponent>
) {}

withProps(MyComponent, { foo: 'bar' });
```

Constructor/instance types:

```svelte
<script lang="ts">
	import MyComponent from './MyComponent.svelte';

	let componentConstructor: typeof MyComponent = MyComponent;
	let componentInstance: MyComponent;
</script>

<MyComponent bind:this={componentInstance} />
```

## Enhancing DOM Types

Augment `svelte/elements` for custom/experimental attributes:

```ts
/// file: additional-svelte-typings.d.ts
import { HTMLButtonAttributes } from 'svelte/elements';

declare module 'svelte/elements' {
	export interface SvelteHTMLElements {
		'custom-button': HTMLButtonAttributes;
	}

	export interface HTMLAttributes<T> {
		globalattribute?: string;
	}

	export interface HTMLButtonAttributes {
		veryexperimentalattribute?: string;
	}
}

export {};
```

Ensure file is in `tsconfig.json` `include` path.