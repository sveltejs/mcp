# svelte/server

## render

Server-only function (requires `server` compiler option). Renders a component and returns `body` and `head` properties for populating HTML during SSR.

```js
import { render } from 'svelte/server';
```

**Type signature:**

```dts
function render<
	Comp extends SvelteComponent<any> | Component<any>,
	Props extends ComponentProps<Comp> = ComponentProps<Comp>
>(
	component: Comp,
	options?: {
		props?: Omit<Props, '$$slots' | '$$events'>;
		context?: Map<any, any>;
		idPrefix?: string;
	}
): RenderOutput;
```

**Usage:** Pass component and optional `props`, `context`, or `idPrefix` to generate server-rendered output.