<script lang="ts">
	const comparisons = [
		{
			title: 'Use Cases Comparison',
			description:
				'View and compare the use case summaries generated from the documentation. These summaries describe when each documentation section would be useful.',
			path: '/compare/use_cases',
		},
		{
			title: 'Distilled Documentation',
			description:
				'View and compare the distilled/condensed versions of the documentation. These are optimized for context size while preserving key information.',
			path: '/compare/distilled',
		},
	];
</script>

<svelte:head>
	<title>Documentation Comparison Tools</title>
</svelte:head>

<div class="container">
	<header>
		<h1>Documentation Comparison Tools</h1>
		<p class="subtitle">Compare before and after versions of documentation processing</p>
	</header>

	<main>
		<div class="card-grid">
			{#each comparisons as comparison}
				<a href={comparison.path} class="card">
					<h2>{comparison.title}</h2>
					<p>{comparison.description}</p>
					<span class="arrow">→</span>
				</a>
			{/each}
		</div>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
			sans-serif;
		background: #f5f5f5;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2.5rem;
		font-weight: 600;
		color: #1a1a1a;
	}

	.subtitle {
		margin: 0;
		font-size: 1.125rem;
		color: #666;
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.card {
		position: relative;
		display: block;
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 2rem;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s;
	}

	.card:hover {
		border-color: #3b82f6;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
		transform: translateY(-2px);
	}

	.card h2 {
		margin: 0 0 0.75rem 0;
		font-size: 1.375rem;
		font-weight: 600;
		color: #1a1a1a;
	}

	.card p {
		margin: 0;
		font-size: 0.9375rem;
		line-height: 1.6;
		color: #666;
	}

	.arrow {
		position: absolute;
		bottom: 1.5rem;
		right: 1.5rem;
		font-size: 1.5rem;
		color: #3b82f6;
		transition: transform 0.2s;
	}

	.card:hover .arrow {
		transform: translateX(4px);
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.card-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
