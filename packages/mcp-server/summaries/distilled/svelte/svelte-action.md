# Actions (Legacy - superseded by attachments)

Actions are functions called when an element is created. Use `use:` directive to apply them.

## Action Type

Type actions with `Action<Element, Parameter, Attributes>`:

```ts
export const myAction: Action<HTMLDivElement, { someProperty: boolean } | undefined> = (node, param = { someProperty: true }) => {
	// ...
}
```

- `Action<HTMLDivElement>` or `Action<HTMLDivElement, undefined>` = no parameters accepted
- Can return object with `update` and `destroy` methods
- Can specify additional attributes/events (TypeScript only)

```dts
interface Action<
	Element = HTMLElement,
	Parameter = undefined,
	Attributes extends Record<string, any> = Record<
		never,
		any
	>
> {
	<Node extends Element>(
		...args: undefined extends Parameter
			? [node: Node, parameter?: Parameter]
			: [node: Node, parameter: Parameter]
	): void | ActionReturn<Parameter, Attributes>;
}
```

## ActionReturn Type

Optional return object from actions:

- `update`: Called when parameter changes after markup updates
- `destroy`: Called after element unmounts
- `Attributes`: Type additional attributes/events (TypeScript only)

```ts
interface Attributes {
	newprop?: string;
	'on:event': (e: CustomEvent<boolean>) => void;
}

export function myAction(node: HTMLElement, parameter: Parameter): ActionReturn<Parameter, Attributes> {
	// ...
	return {
		update: (updatedParameter) => {...},
		destroy: () => {...}
	};
}
```

```dts
interface ActionReturn<
	Parameter = undefined,
	Attributes extends Record<string, any> = Record<
		never,
		any
	>
> {
	update?: (parameter: Parameter) => void;
	destroy?: () => void;
}
```