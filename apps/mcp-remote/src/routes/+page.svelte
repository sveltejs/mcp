<script lang="ts">
	const links = [
		{
			title: 'Documentation',
			description: 'Get started with the official Svelte MCP',
			url: 'https://svelte.dev/docs/mcp/overview',
		},
		{
			title: 'Use cases',
			description: 'Compare LLM-generated use case summaries with original documentation',
			url: '/compare/use_cases',
		},
		{
			title: 'Distilled documentation',
			description: 'Compare LLM-generated condensed documentation with original documentation',
			url: '/compare/distilled',
		},
	];
</script>

<svelte:head>
	<title>Official Svelte MCP</title>
</svelte:head>

<div class="container">
	<h1>Official Svelte MCP</h1>
	<p class="description">
		The Model Context Protocol server for Svelte development. Provides documentation, autofixing
		tools, and code examples.
	</p>

	<div class="links">
		{#each links as link}
			<a href={link.url} class="link-card">
				<h2>{link.title}</h2>
				<p>{link.description}</p>
			</a>
		{/each}
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 3rem 1rem;
	}

	h1 {
		margin: 0 0 1rem 0;
		font-size: 2.5rem;
		font-weight: 600;
		color: #1a1a1a;
	}

	.description {
		margin: 0 0 2rem 0;
		font-size: 1.125rem;
		color: #666;
		line-height: 1.6;
	}

	.links {
		display: grid;
		gap: 1rem;
	}

	.link-card {
		display: block;
		padding: 1.5rem;
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s;
	}

	.link-card:hover {
		border-color: #3b82f6;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.link-card h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #1a1a1a;
	}

	.link-card p {
		margin: 0;
		font-size: 0.9375rem;
		color: #666;
	}
</style>
