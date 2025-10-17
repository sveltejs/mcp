# Svelte 5 Migration Guide

Svelte 5 supports Svelte 4 syntax - you can mix old and new components. A migration script helps automate upgrades: `npx sv migrate svelte-5`.

## Reactivity Syntax Changes

### `let` → `$state`

```svelte
<script>
	let count = $state(0);
</script>
```

`$state` makes reactivity explicit. The variable is still the value itself, no wrapper needed.

### `$:` → `$derived`/`$effect`

**Derivations:**
```svelte
<script>
	let count = $state(0);
	const double = $derived(count * 2);
</script>
```

**Side effects:**
```svelte
<script>
	let count = $state(0);

	$effect(() => {
		if (count > 5) {
			alert('Count is too high!');
		}
	});
</script>
```

Note: `$effect` runs differently than `$:`.

### `export let` → `$props`

```svelte
<script>
	let { optional = 'unset', required } = $props();
</script>
```

**Renaming, rest props, all props:**
```svelte
<script>
	let { class: klass, ...rest } = $props();
</script>
<button class={klass} {...rest}>click me</button>
```

## Event Changes

### Event handlers are properties

```svelte
<script>
	let count = $state(0);
</script>

<button onclick={() => count++}>
	clicks: {count}
</button>
```

Shorthand works:
```svelte
<script>
	let count = $state(0);

	function onclick() {
		count++;
	}
</script>

<button {onclick}>
	clicks: {count}
</button>
```

### Component events

Replace `createEventDispatcher` with callback props:

```svelte
<!--- file: App.svelte --->
<script>
	import Pump from './Pump.svelte';

	let size = $state(15);
	let burst = $state(false);

	function reset() {
		size = 15;
		burst = false;
	}
</script>

<Pump
	inflate={(power) => {
		size += power;
		if (size > 75) burst = true;
	}}
	deflate={(power) => {
		if (size > 0) size -= power;
	}}
/>

{#if burst}
	<button onclick={reset}>new balloon</button>
	<span class="boom">💥</span>
{:else}
	<span class="balloon" style="scale: {0.01 * size}">
		🎈
	</span>
{/if}
```

```svelte
<!--- file: Pump.svelte --->
<script>
	let { inflate, deflate } = $props();
	let power = $state(5);
</script>

<button onclick={() => inflate(power)}>
	inflate
</button>
<button onclick={() => deflate(power)}>
	deflate
</button>
<button onclick={() => power--}>-</button>
Pump power: {power}
<button onclick={() => power++}>+</button>
```

### Bubbling events

Accept callback prop instead of forwarding:

```svelte
<script>
	let { onclick } = $props();
</script>

<button {onclick}>
	click me
</button>
```

Spread all props including handlers:
```svelte
<script>
	let props = $props();
</script>

<button {...props}>
	click me
</button>
```

### Event modifiers

No modifiers on event attributes. Add logic inside handler or create wrappers:

```svelte
<script>
	function once(fn) {
		return function (event) {
			if (fn) fn.call(this, event);
			fn = null;
		};
	}

	function preventDefault(fn) {
		return function (event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}
</script>

<button onclick={once(preventDefault(handler))}>...</button>
```

For `capture`, add to event name:
```svelte
<button onclickcapture={...}>...</button>
```

### Multiple event handlers

```svelte
<button
	onclick={(e) => {
		one(e);
		two(e);
	}}
>
	...
</button>
```

When spreading, local handlers go after:
```svelte
<button
	{...props}
	onclick={(e) => {
		doStuff(e);
		props.onclick?.(e);
	}}
>
	...
</button>
```

## Snippets Instead of Slots

Slots are deprecated. Snippets work with components using slots, but not vice versa.

### Default content

```svelte
<script>
	let { children } = $props();
</script>

{@render children?.()}
```

### Multiple placeholders

```svelte
<script>
	let { header, main, footer } = $props();
</script>

<header>
	{@render header()}
</header>

<main>
	{@render main()}
</main>

<footer>
	{@render footer()}
</footer>
```

### Passing data back

```svelte
<!--- file: App.svelte --->
<script>
	import List from './List.svelte';
</script>

<List items={['one', 'two', 'three']}>
	{#snippet item(text)}
		<span>{text}</span>
	{/snippet}
	{#snippet empty()}
		<span>No items yet</span>
	{/snippet}
</List>
```

```svelte
<!--- file: List.svelte --->
<script>
	let { items, item, empty } = $props();
</script>

{#if items.length}
	<ul>
		{#each items as entry}
			<li>
				{@render item(entry)}
			</li>
		{/each}
	</ul>
{:else}
	{@render empty?.()}
{/if}
```

## Migration Script

Run `npx sv migrate svelte-5` to automatically:
- Bump dependencies
- Migrate to runes
- Migrate to event attributes
- Migrate slots to render tags
- Migrate slot usages to snippets
- Migrate component instantiation

### `run` function

Migration script may convert `$:` to `run` (from `svelte/legacy`) when it can't determine if it's a derivation or side effect. Usually should be changed to `$derived` or `$effect`:

```svelte
<script>
	$effect(() => {
		// some side effect code
	})
</script>
```

### Event modifiers

Imported from `svelte/legacy`, should be replaced with manual logic:

```svelte
<script>
</script>

<button
	onclick={(event) => {
		event.preventDefault();
		// ...
	}}
>
	click me
</button>
```

### Not auto-migrated

- `createEventDispatcher` - too risky, manual migration needed
- `beforeUpdate/afterUpdate` - use `$effect.pre` and `tick` instead

## Components Are No Longer Classes

Use `mount` or `hydrate` instead of `new Component()`:

```js
import { mount } from 'svelte';
import App from './App.svelte'

const app = mount(App, { target: document.getElementById("app") });

export default app;
```

### Replacements for class methods

**`$on` → `events` option:**
```js
import { mount } from 'svelte';
import App from './App.svelte'

const app = mount(App, { target: document.getElementById("app"), events: { event: callback } });
```

**`$set` → `$state`:**
```js
import { mount } from 'svelte';
import App from './App.svelte'

const props = $state({ foo: 'bar' });
const app = mount(App, { target: document.getElementById("app"), props });
props.foo = 'baz';
```

**`$destroy` → `unmount`:**
```js
import { mount, unmount } from 'svelte';
import App from './App.svelte'

const app = mount(App, { target: document.getElementById("app") });
unmount(app);
```

**Stop-gap:** Use `createClassComponent` or `asClassComponent` from `svelte/legacy`, or set `compatibility.componentApi: 4` compiler option.

**Note:** `mount`/`hydrate` are not synchronous. Call `flushSync()` after if you need guarantees.

### Server API

```js
import { render } from 'svelte/server';
import App from './App.svelte';

const { html, head } = render(App, { props: { message: 'hello' }});
```

CSS no longer returned by default. Set `css: 'injected'` compiler option if needed.

### Component typing

```ts
import type { Component } from 'svelte';
export declare const MyComponent: Component<{
	foo: string;
}>;
```

```js
import { ComponentA, ComponentB } from 'component-library';
import type { Component } from 'svelte';

let C: Component<{ foo: string }> = $state(
	Math.random() ? ComponentA : ComponentB
);
```

`ComponentEvents` and `ComponentType` are deprecated.

### `bind:this` changes

No longer returns `$set`, `$on`, `$destroy`. Only returns instance exports and accessors (if `accessors: true`).

## `<svelte:component>` No Longer Necessary

Components are now dynamic by default:

```svelte
<script>
	import A from './A.svelte';
	import B from './B.svelte';

	let Thing = $state();
</script>

<select bind:value={Thing}>
	<option value={A}>A</option>
	<option value={B}>B</option>
</select>

<!-- these are equivalent -->
<Thing />
<svelte:component this={Thing} />
```

Component names should be capitalized or use dot notation.

### Dot notation indicates component

```svelte
{#each items as item}
	<item.component {...item.props} />
{/each}
```

## Whitespace Handling Changed

Rules:
- Whitespace between nodes collapses to one
- Whitespace at start/end of tags removed
- Exceptions like `<pre>` tags apply

Use `preserveWhitespace` option to disable trimming.

## Modern Browser Required

Svelte 5 requires:
- `Proxy` support
- `ResizeObserver` for dimension bindings
- `input` event for range inputs

No IE support. `legacy` compiler option repurposed.

## Compiler Options Changes

- `css` option: removed `false`/`true`/`"none"` values
- `legacy` repurposed
- `hydratable` removed (always hydratable)
- `enableSourcemap` removed (always generated)
- `tag` removed (use `<svelte:options customElement="tag-name" />`)
- `loopGuardTimeout`, `format`, `sveltePath`, `errorMode`, `varsReport` removed

## Reserved Props

`children` prop is reserved for content snippets.

## Breaking Changes in Runes Mode

### No binding to component exports

Can't do `<A bind:foo />` on exports. Use `bind:this` instead:

```svelte
<A bind:this={a} />
<!-- access as a.foo -->
```

### Bindings need `$bindable()`

Props not bindable by default. Use `$bindable` rune:

```svelte
<script>
	let { foo = $bindable('bar') } = $props();
</script>
```

Must pass non-`undefined` value when binding to props with defaults.

### `accessors` option ignored

Properties never accessible on instance. Use component exports:

```svelte
<script>
	let { name } = $props();
	export const getName = () => name;
</script>
```

Or use `$state` in `.svelte.js`/`.svelte.ts` files:

```js
import { mount } from 'svelte';
import App from './App.svelte'

const props = $state({ foo: 'bar' });
const app = mount(App, { target: document.getElementById("app"), props });
props.foo = 'baz';
```

### `immutable` option ignored

Replaced by `$state` behavior.

### Classes not auto-reactive

Define reactive fields with `$state` inside class. Wrapping `new Foo()` with `$state(...)` has no effect.

### Touch/wheel events passive

`onwheel`, `onmousewheel`, `ontouchstart`, `ontouchmove` are passive by default. Use `on` from `svelte/events` for non-passive.

### Stricter attribute/prop syntax

Must quote concatenated values:

```svelte
<Component prop="this{is}valid" />
```

### Stricter HTML structure

Browser-repaired HTML now causes compiler errors. Write valid HTML.

## Other Breaking Changes

### Stricter `@const` validation

Can't assign to destructured parts of `@const`.

### `:is()`, `:has()`, `:where()` scoped

Now analyzed in component context. Use `:global(...)` inside if needed:

```css
main :global {
	@apply bg-blue-100 dark:bg-blue-900;
}
```

### CSS hash position non-deterministic

Hash no longer guaranteed to be last.

### Scoped CSS uses `:where(...)`

Selectors now use `:where(.svelte-xyz123)` alongside `.svelte-xyz123`.

For ancient browsers:
```js
// @errors: 2552
css = css.replace(/:where\((.+?)\)/, '$1');
```

### Error/warning codes renamed

Dashes replaced with underscores (e.g., `foo-bar` → `foo_bar`).

### Reduced namespaces

Valid namespaces: `html` (default), `mathml`, `svg`. `foreign` removed.

### `beforeUpdate`/`afterUpdate` changes

- `beforeUpdate` no longer runs twice on initial render
- `afterUpdate` in parent runs after child's
- Don't run when `<slot>` content updates
- Disallowed in runes mode (use `$effect.pre`/`$effect`)

### `contenteditable` behavior

Binding takes full control - reactive values inside won't update.

### `oneventname` no string values

Can't use `<button onclick="alert('hello')">` anymore.

### `null`/`undefined` become empty string

No longer printed as strings.

### `bind:files` values restricted

Must be `null`, `undefined`, or `FileList`.

### Bindings react to form resets

Now properly sync with DOM on form reset.

### `walk` no longer exported

Import from `estree-walker` directly.

### Content inside `<svelte:options>` forbidden

Compiler error if content present.

### `<slot>` preserved in shadow roots

Preserved when child of `<template shadowrootmode="...">`.

### `<svelte:element>` needs expression

```svelte
<svelte:element this={"div"}>
```

### `mount` plays transitions by default

Set `intro: false` to disable.

### Hydration mismatches not repaired

`<img src>` and `{@html}` mismatches warn in dev but don't auto-repair. Force update manually if needed.

### Hydration uses comments

Don't remove comments from SSR HTML. Manually authored HTML needs adjustment.

### `onevent` attributes delegated

Some events delegated - don't stop propagation manually.

### `--style-props` uses different element

Uses `<svelte-css-wrapper>` instead of `<div>`.