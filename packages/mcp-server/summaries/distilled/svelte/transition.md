# Transitions

Transitions trigger when elements enter/leave the DOM due to state changes. Use `transition:` directive for bidirectional transitions.

```svelte
<script>
	import { fade } from 'svelte/transition';

	let visible = $state(false);
</script>

<button onclick={() => visible = !visible}>toggle</button>

{#if visible}
	<div transition:fade>fades in and out</div>
{/if}
```

**Key behavior:** When a block transitions out, all elements inside remain in DOM until all transitions complete.

## Local vs Global

**Local (default):** Transitions play only when their own block is created/destroyed.

**Global:** Transitions play when any parent block changes.

```svelte
{#if x}
	{#if y}
		<p transition:fade>fades in and out only when y changes</p>

		<p transition:fade|global>fades in and out when x or y change</p>
	{/if}
{/if}
```

## Built-in Transitions

Import from `svelte/transition` module.

## Parameters

Pass parameters using object literal:

```svelte
{#if visible}
	<div transition:fade={{ duration: 2000 }}>fades in and out over two seconds</div>
{/if}
```

## Custom Transition Functions

```js
transition = (node: HTMLElement, params: any, options: { direction: 'in' | 'out' | 'both' }) => {
	delay?: number,
	duration?: number,
	easing?: (t: number) => number,
	css?: (t: number, u: number) => string,
	tick?: (t: number, u: number) => void
}
```

**`css` function:** Generates web animation keyframes. `t` = `0` to `1` (after easing), `u` = `1 - t`. For _in_ transitions: `0`→`1`. For _out_: `1`→`0`. Value `1` = element's natural state.

```svelte
<!--- file: App.svelte --->
<script>
	import { elasticOut } from 'svelte/easing';

	/** @type {boolean} */
	export let visible;

	/**
	 * @param {HTMLElement} node
	 * @param {{ delay?: number, duration?: number, easing?: (t: number) => number }} params
	 */
	function whoosh(node, params) {
		const existingTransform = getComputedStyle(node).transform.replace('none', '');

		return {
			delay: params.delay || 0,
			duration: params.duration || 400,
			easing: params.easing || elasticOut,
			css: (t, u) => `transform: ${existingTransform} scale(${t})`
		};
	}
</script>

{#if visible}
	<div in:whoosh>whooshes in</div>
{/if}
```

**`tick` function:** Called during transition with same `t`/`u` arguments. Prefer `css` over `tick` - web animations run off main thread.

```svelte
<!--- file: App.svelte --->
<script>
	export let visible = false;

	/**
	 * @param {HTMLElement} node
	 * @param {{ speed?: number }} params
	 */
	function typewriter(node, { speed = 1 }) {
		const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

		if (!valid) {
			throw new Error(`This transition only works on elements with a single text node child`);
		}

		const text = node.textContent;
		const duration = text.length / (speed * 0.01);

		return {
			duration,
			tick: (t) => {
				const i = ~~(text.length * t);
				node.textContent = text.slice(0, i);
			}
		};
	}
</script>

{#if visible}
	<p in:typewriter={{ speed: 1 }}>The quick brown fox jumps over the lazy dog</p>
{/if}
```

**Returning a function:** Enables crossfade effects by coordinating multiple transitions (called in next microtask).

**`options` parameter:** Contains `direction` (`'in'`, `'out'`, or `'both'`).

## Transition Events

Elements with transitions dispatch:
- `introstart`
- `introend`
- `outrostart`
- `outroend`

```svelte
{#if visible}
	<p
		transition:fly={{ y: 200, duration: 2000 }}
		onintrostart={() => (status = 'intro started')}
		onoutrostart={() => (status = 'outro started')}
		onintroend={() => (status = 'intro ended')}
		onoutroend={() => (status = 'outro ended')}
	>
		Flies in and out
	</p>
{/if}
```