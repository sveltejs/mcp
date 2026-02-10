Styles are generally scoped in Svelte components and if possible they should remain so...in the rare case where you might want to style a child from the parent there are a few possibilities:

### Use `:global`

`:global` allows you to prevent css pruning in svelte...however using global at the "top level" of a stylesheet will make it truly global. A nice trick to prevent completely global styles is to nest the `global` selector inside a scoped element

```svelte
<div>
	<Component />
</div>

<style>
	div :global(span){
		color: red;
	}
</style>
```

### Use style props

If a component uses CSS variables in his styling you can automatically pass them using a style prop.

```svelte
<Slider
	--track-color="black"
	--thumb-color="rgb({r} {g} {b})"
/>
```