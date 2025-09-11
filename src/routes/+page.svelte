<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
</script>

<h1>Official Svelte MCP</h1>

<form method="POST" use:enhance>
	<textarea name="text" rows="4" cols="50" placeholder="Enter text to store in the vector database"
	></textarea>
	<br />
	<button>Submit</button>
</form>

Comparing with
<pre>{data.sentence}</pre>

{#each data.top as item (item.id)}
	<p>{item.text} - {item.distance}</p>
{/each}
