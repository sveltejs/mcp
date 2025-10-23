# $lib Import Alias

SvelteKit provides `$lib` alias for importing from `src/lib`. Configure via [config file](configuration#files).

```svelte
<!--- file: src/lib/Component.svelte --->
A reusable component
```

```svelte
<!--- file: src/routes/+page.svelte --->
<script>
    import Component from '$lib/Component.svelte';
</script>

<Component />
```