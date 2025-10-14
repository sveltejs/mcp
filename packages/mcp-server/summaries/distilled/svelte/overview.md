# Svelte Overview

Svelte is a compiler-based UI framework that transforms declarative components (HTML, CSS, JavaScript) into optimized JavaScript.

## Basic Component Structure

```svelte
<!--- file: App.svelte --->
<script>
	function greet() {
		alert('Welcome to Svelte!');
	}
</script>

<button onclick={greet}>click me</button>

<style>
	button {
		font-size: 2em;
	}
</style>
```

**Key Points:**
- Components contain `<script>`, markup, and `<style>` blocks
- Event handlers use `onclick` (no colon)
- Use standalone or with SvelteKit for full-stack apps