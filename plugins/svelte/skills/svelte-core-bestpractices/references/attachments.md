Attachments are useful when you need to interact with the DOM api. An attachment is a simple function that receives a node as input and eventually returns a cleanup function. This function will be invoked whenever the element is attached to will be mounted to the DOM (and the cleanup function whenever it's unmounted).

Attachments are generally preferred to the pattern of `bind:this` and `$effect`.

An attachment runs in a reactive context meaning that every stateful variable you access will trigger the attachment again when it changes.

```
<script lang="ts">
	import tippy from 'tippy.js';
	import type { Attachment } from 'svelte/attachments';

	let content = $state('Hello!');

	function tooltip(content: string): Attachment {
		return (element) => {
			const tooltip = tippy(element, { content });
			return tooltip.destroy;
		};
	}
</script>

<input bind:value={content} />

<button {@attach tooltip(content)}>
	Hover me
</button>
```

If you need to access some stateful variable but you don't want to trigger the whole attachment you can pass in a function and read that within an `$effect`.

```ts
function foo(getBar) {
	return (node) => {
		veryExpensiveSetupWork(node);

		$effect(() => {
			update(node, getBar());
		});
	};
}
```
