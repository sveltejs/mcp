# Legacy Slots

In Svelte 5, use [snippets](snippet) and [render tags](@render). In legacy mode, use `<slot>` elements.

## Basic Usage

```svelte
<!--- file: App.svelte --->
<script>
	import Modal from './Modal.svelte';
</script>

<Modal>This is some slotted content</Modal>
```

```svelte
<!--- file: Modal.svelte --->
<div class="modal">
	<slot></slot>
</div>
```

> To render an actual `<slot>` element: `<svelte:element this={'slot'} />`

## Named Slots

Parent uses `slot="..."` attribute:

```svelte
<!--- file: App.svelte --->
<Modal>
	This is some slotted content

	<div slot="buttons">
		<button on:click={() => open = false}>
			close
		</button>
	</div>
</Modal>
```

Child uses `<slot name="...">`:

```svelte
<!--- file: Modal.svelte --->
<div class="modal">
	<slot></slot>
	<hr>
	<slot name="buttons"></slot>
</div>
```

## Fallback Content

```svelte
<slot>
	This will be rendered if no slotted content is provided
</slot>
```

## Passing Data to Slots

Slots pass values back to parent using props. Parent uses `let:` directive:

```svelte
<!--- file: FancyList.svelte --->
<ul>
	{#each items as data}
		<li class="fancy">
			<slot item={process(data)} />
		</li>
	{/each}
</ul>
```

```svelte
<!--- file: App.svelte --->
<FancyList {items} let:item={processed}>
	<div>{processed.text}</div>
</FancyList>
```

Shorthand: `let:item` = `let:item={item}`, `<slot {item}>` = `<slot item={item}>`

**Named slots with data:** `let:` goes on element with `slot` attribute:

```svelte
<!--- file: FancyList.svelte --->
<ul>
	{#each items as item}
		<li class="fancy">
			<slot name="item" item={process(data)} />
		</li>
	{/each}
</ul>

<slot name="footer" />
```

```svelte
<!--- file: App.svelte --->
<FancyList {items}>
	<div slot="item" let:item>{item.text}</div>
	<p slot="footer">Copyright (c) 2019 Svelte Industries</p>
</FancyList>
```