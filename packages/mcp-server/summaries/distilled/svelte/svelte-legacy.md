# svelte/legacy

Migration utilities for Svelte 4 to 5 transition. All imports are deprecated - migrate away over time.

```js
import {
	asClassComponent,
	createBubbler,
	createClassComponent,
	handlers,
	nonpassive,
	once,
	passive,
	preventDefault,
	run,
	self,
	stopImmediatePropagation,
	stopPropagation,
	trusted
} from 'svelte/legacy';
```

## Component Class Compatibility

### asClassComponent
Converts component function to Svelte 4 compatible constructor.

```dts
function asClassComponent<Props, Exports, Events, Slots>(
	component: SvelteComponent<Props, Events, Slots> | Component<Props>
): ComponentType<SvelteComponent<Props, Events, Slots> & Exports>;
```

### createClassComponent
Creates Svelte 4 compatible component from options + component function.

```dts
function createClassComponent<Props, Exports, Events, Slots>(
	options: ComponentConstructorOptions<Props> & {
		component: ComponentType<SvelteComponent<Props, Events, Slots>> | Component<Props>;
	}
): SvelteComponent<Props, Events, Slots> & Exports;
```

## Event Handling

### createBubbler
Mimics `on:click` (no handler) behavior from Svelte 4.

```dts
function createBubbler(): (type: string) => (event: Event) => boolean;
```

### handlers
Allows multiple event listeners (Svelte 4 behavior).

```dts
function handlers(...handlers: EventListener[]): EventListener;
```

## Event Modifiers (as functions/actions)

### once
```dts
function once(fn: (event: Event, ...args: Array<unknown>) => void): (event: Event, ...args: unknown[]) => void;
```

### preventDefault
```dts
function preventDefault(fn: (event: Event, ...args: Array<unknown>) => void): (event: Event, ...args: unknown[]) => void;
```

### stopPropagation
```dts
function stopPropagation(fn: (event: Event, ...args: Array<unknown>) => void): (event: Event, ...args: unknown[]) => void;
```

### stopImmediatePropagation
```dts
function stopImmediatePropagation(fn: (event: Event, ...args: Array<unknown>) => void): (event: Event, ...args: unknown[]) => void;
```

### self
```dts
function self(fn: (event: Event, ...args: Array<unknown>) => void): (event: Event, ...args: unknown[]) => void;
```

### trusted
```dts
function trusted(fn: (event: Event, ...args: Array<unknown>) => void): (event: Event, ...args: unknown[]) => void;
```

### passive (action)
```dts
function passive(node: HTMLElement, [event, handler]: [event: string, handler: () => EventListener]): void;
```

### nonpassive (action)
```dts
function nonpassive(node: HTMLElement, [event, handler]: [event: string, handler: () => EventListener]): void;
```

## Other

### run
Runs once immediately on server, like `$effect.pre` on client.

```dts
function run(fn: () => void | (() => void)): void;
```

### LegacyComponentType
Type for components usable as both class and function during transition.

```dts
type LegacyComponentType = {
	new (o: ComponentConstructorOptions): SvelteComponent;
	(...args: Parameters<Component<Record<string, any>>>): ReturnType<Component<Record<string, any>, Record<string, any>>>;
};
```