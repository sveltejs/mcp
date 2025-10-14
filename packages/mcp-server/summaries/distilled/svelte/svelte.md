# Svelte 5 API Reference

## Component Lifecycle

### onMount
Runs once after component mounts to DOM. Returns cleanup function if provided synchronously. Does not run during SSR.

```ts
function onMount<T>(fn: () => NotFunction<T> | Promise<NotFunction<T>> | (() => any)): void;
```

### onDestroy
Runs before component unmounts. Only lifecycle function that runs server-side.

```ts
function onDestroy(fn: () => any): void;
```

### ~~afterUpdate~~ → Use `$effect`
### ~~beforeUpdate~~ → Use `$effect.pre`

## Component Instantiation

### mount
Mounts component to target, returns exports. Transitions play by default unless `intro: false`.

```ts
function mount<Props, Exports>(
  component: Component<Props, Exports, any>,
  options: MountOptions<Props>
): Exports;
```

**MountOptions:**
- `target`: Document | Element | ShadowRoot (required)
- `anchor?`: Node - renders before this node
- `props?`: Props (required if Props not empty)
- `events?`: Record<string, (e: any) => any> (deprecated)
- `context?`: Map<any, any>
- `intro?`: boolean (default: true)

### hydrate
Hydrates server-rendered component. Same signature as `mount`.

### unmount
Unmounts component. Returns Promise if `outro: true` (plays transitions).

```js
import { mount, unmount } from 'svelte';
import App from './App.svelte';

const app = mount(App, { target: document.body });
unmount(app, { outro: true });
```

## Context API

Must be called during component initialization.

```ts
function setContext<T>(key: any, context: T): T;
function getContext<T>(key: any): T;
function hasContext(key: any): boolean;
function getAllContexts<T extends Map<any, any>>(): T;
```

## Timing & Updates

### tick
Returns promise that resolves after pending state changes applied.

```ts
function tick(): Promise<void>;
```

### settled
Returns promise that resolves after state changes, async work, and DOM updates complete. (Since 5.36)

```ts
function settled(): Promise<void>;
```

### flushSync
Synchronously flush pending updates. Returns callback result if provided.

```ts
function flushSync<T = void>(fn?: () => T): T;
```

## Utilities

### untrack
Reads state inside `$derived` or `$effect` without creating dependency.

```ts
$effect(() => {
  // runs when `data` changes, not when `time` changes
  save(data, {
    timestamp: untrack(() => time)
  });
});
```

```ts
function untrack<T>(fn: () => T): T;
```

### getAbortSignal
Returns AbortSignal that aborts when current derived/effect re-runs or destroys. Must be called inside derived/effect.

```svelte
<script>
import { getAbortSignal } from 'svelte';

let { id } = $props();

async function getData(id) {
  const response = await fetch(`/items/${id}`, {
    signal: getAbortSignal()
  });
  return await response.json();
}

const data = $derived(await getData(id));
</script>
```

### createRawSnippet
Create snippet programmatically.

```ts
function createRawSnippet<Params extends unknown[]>(
  fn: (...params: Getters<Params>) => {
    render: () => string;
    setup?: (element: Element) => void | (() => void);
  }
): Snippet<Params>;
```

## TypeScript Types

### Component
Type for Svelte 5 components (functions, not classes).

```ts
interface Component<
  Props extends Record<string, any> = {},
  Exports extends Record<string, any> = {},
  Bindings extends keyof Props | '' = string
> {
  (internals: ComponentInternals, props: Props): Exports;
  element?: typeof HTMLElement; // if compiled with customElement
}
```

**Example:**
```ts
import type { Component } from 'svelte';
export declare const MyComponent: Component<{ foo: string }> {}
```

### ComponentProps
Get props type from component.

```ts
import type { ComponentProps } from 'svelte';
import MyComponent from './MyComponent.svelte';

const props: ComponentProps<typeof MyComponent> = { foo: 'bar' };

// Generic function
function withProps<TComponent extends Component<any>>(
  component: TComponent,
  props: ComponentProps<TComponent>
) {}
```

### Snippet
Type for `#snippet` blocks.

```ts
interface Snippet<Parameters extends unknown[] = []> {
  (...args: Parameters): typeof SnippetReturn;
}

// Usage
let { banner }: { banner: Snippet<[{ text: string }]> } = $props();
```

Call snippets with `{@render ...}` tag only.

## Deprecated (Svelte 4 Legacy)

- ~~`SvelteComponent`~~ → Use `Component` type and `mount()` function
- ~~`SvelteComponentTyped`~~ → Use `Component`
- ~~`createEventDispatcher`~~ → Use callback props or `$host()` rune
- ~~`ComponentConstructorOptions`~~ → Use `mount()`
- ~~`ComponentType`~~ → Obsolete with new `Component` type