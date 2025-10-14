# Custom Elements (Web Components)

Compile Svelte components to custom elements using `customElement: true` compiler option. Specify tag name with `<svelte:options>`. Access host element via `$host` rune.

```svelte
<svelte:options customElement="my-element" />

<script>
	let { name = 'world' } = $props();
</script>

<h1>Hello {name}!</h1>
<slot />
```

## Defining Elements

Omit tag name for inner components. Define later using static `element` property:

```js
// @noErrors
import MyElement from './MyElement.svelte';

customElements.define('my-element', MyElement.element);
```

## Usage

Use as regular DOM elements. Props exposed as DOM properties and attributes:

```js
// @noErrors
const el = document.querySelector('my-element');
console.log(el.name);
el.name = 'everybody';
```

**Important:** Must explicitly list all props. `let props = $props()` without declaring props in component options won't expose them on DOM element.

## Lifecycle

- Component created in next tick after `connectedCallback`
- Properties assigned before insertion are saved and applied on creation
- Exported functions only available after mount (workaround: use `extend` option)
- Shadow DOM updates in next tick (batched)
- Component destroyed in next tick after `disconnectedCallback`

## Component Options

Configure via object in `<svelte:options customElement={{...}}>`:

- **`tag`**: Custom element name
- **`shadow`**: Set to `"none"` to skip shadow root (no style encapsulation, no slots)
- **`props`**: Configure prop behavior:
  - `attribute`: Custom attribute name (default: lowercase prop name)
  - `reflect`: Reflect prop changes to DOM (default: false)
  - `type`: `'String' | 'Boolean' | 'Number' | 'Array' | 'Object'` (default: String)
- **`extend`**: Function to extend custom element class

```svelte
<svelte:options
	customElement={{
		tag: 'custom-element',
		shadow: 'none',
		props: {
			name: { reflect: true, type: 'Number', attribute: 'element-index' }
		},
		extend: (customElementConstructor) => {
			// Extend the class so we can let it participate in HTML forms
			return class extends customElementConstructor {
				static formAssociated = true;

				constructor() {
					super();
					this.attachedInternals = this.attachInternals();
				}

				// Add the function here, not below in the component so that
				// it's always available, not just when the inner Svelte component
				// is mounted
				randomIndex() {
					this.elementIndex = Math.random();
				}
			};
		}
	}}
/>

<script>
	let { elementIndex, attachedInternals } = $props();
	// ...
	function check() {
		attachedInternals.checkValidity();
	}
</script>

...
```

> **Note:** TypeScript in `extend` requires `lang="ts"` and only [erasable syntax](https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly).

## Caveats

- Styles are **encapsulated** (unless `shadow: "none"`). Global styles and `:global()` don't apply
- Styles inlined as JavaScript, not separate CSS file
- Not suitable for SSR (shadow DOM invisible until JS loads)
- Slotted content renders eagerly (always created, even in `{#if}` blocks)
- `<slot>` in `{#each}` doesn't render content multiple times
- `let:` directive has no effect
- Polyfills needed for older browsers
- Context API doesn't work across custom elements (only within)
- **Don't use props/attributes starting with `on`** - interpreted as event listeners