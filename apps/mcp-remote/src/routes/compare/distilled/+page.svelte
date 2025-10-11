<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selected_slug = $state<string | null>(null);
	let search_query = $state('');

	let filtered_sections = $derived(
		data.sections.filter(
			(section) =>
				section.slug.toLowerCase().includes(search_query.toLowerCase()) ||
				section.summary.toLowerCase().includes(search_query.toLowerCase()),
		),
	);

	let selected_section = $derived(
		selected_slug ? data.sections.find((s) => s.slug === selected_slug) : null,
	);

	function select_section(slug: string) {
		selected_slug = selected_slug === slug ? null : slug;
	}
</script>

<svelte:head>
	<title>Distilled Documentation Comparison</title>
</svelte:head>

<div class="container">
	<header>
		<h1>Distilled Documentation Comparison</h1>
		<div class="metadata">
			<span>Generated: {new Date(data.metadata.generated_at).toLocaleString()}</span>
			<span>Model: {data.metadata.model}</span>
			<span>Sections: {data.metadata.successful_summaries}/{data.metadata.total_sections}</span>
		</div>
	</header>

	<div class="main-content">
		<aside class="sidebar">
			<div class="search-box">
				<input
					type="search"
					bind:value={search_query}
					placeholder="Search sections..."
					class="search-input"
				/>
			</div>
			<ul class="section-list">
				{#each filtered_sections as section (section.slug)}
					<li>
						<button
							class="section-item"
							class:active={selected_slug === section.slug}
							onclick={() => select_section(section.slug)}
						>
							<div class="section-title">{section.slug}</div>
							<div class="section-preview">
								{section.summary.slice(0, 100)}{section.summary.length > 100 ? '...' : ''}
							</div>
						</button>
					</li>
				{/each}
			</ul>
		</aside>

		<main class="comparison-view">
			{#if selected_section}
				<div class="comparison-grid">
					<div class="comparison-column">
						<h2>Distilled Version</h2>
						<div class="content-box">
							<div class="markdown-content">{@html selected_section.summary}</div>
						</div>
					</div>
					<div class="comparison-column">
						<h2>Original Content</h2>
						<div class="content-box">
							<pre>{selected_section.content}</pre>
						</div>
					</div>
				</div>
			{:else}
				<div class="empty-state">
					<p>Select a section from the list to view the comparison</p>
				</div>
			{/if}
		</main>
	</div>
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
		max-width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		background: white;
		border-bottom: 1px solid #e0e0e0;
		padding: 1.5rem 2rem;
	}

	h1 {
		margin: 0 0 0.5rem 0;
		font-size: 1.75rem;
		font-weight: 600;
		color: #1a1a1a;
	}

	.metadata {
		display: flex;
		gap: 1.5rem;
		font-size: 0.875rem;
		color: #666;
	}

	.main-content {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.sidebar {
		width: 350px;
		background: white;
		border-right: 1px solid #e0e0e0;
		display: flex;
		flex-direction: column;
	}

	.search-box {
		padding: 1rem;
		border-bottom: 1px solid #e0e0e0;
	}

	.search-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		font-size: 0.875rem;
		font-family: inherit;
	}

	.search-input:focus {
		outline: none;
		border-color: #3b82f6;
	}

	.section-list {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		flex: 1;
	}

	.section-item {
		width: 100%;
		text-align: left;
		padding: 0.75rem 1rem;
		border: none;
		border-bottom: 1px solid #f0f0f0;
		background: white;
		cursor: pointer;
		transition: background-color 0.15s;
		font-family: inherit;
	}

	.section-item:hover {
		background: #f9fafb;
	}

	.section-item.active {
		background: #eff6ff;
		border-left: 3px solid #3b82f6;
	}

	.section-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: #1a1a1a;
		margin-bottom: 0.25rem;
	}

	.section-preview {
		font-size: 0.75rem;
		color: #666;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.comparison-view {
		flex: 1;
		overflow: auto;
		background: #fafafa;
	}

	.comparison-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		padding: 1rem;
		height: 100%;
	}

	.comparison-column {
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.comparison-column h2 {
		margin: 0;
		padding: 1rem;
		font-size: 1rem;
		font-weight: 600;
		color: #1a1a1a;
		border-bottom: 1px solid #e0e0e0;
		background: #fafafa;
	}

	.content-box {
		padding: 1rem;
		overflow: auto;
		flex: 1;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.content-box p {
		margin: 0;
		color: #1a1a1a;
	}

	.markdown-content {
		color: #1a1a1a;
	}

	.content-box pre {
		margin: 0;
		white-space: pre-wrap;
		word-wrap: break-word;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
		font-size: 0.8125rem;
		color: #333;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #666;
		font-size: 0.875rem;
	}

	@media (max-width: 768px) {
		.comparison-grid {
			grid-template-columns: 1fr;
		}

		.sidebar {
			width: 100%;
			max-height: 40vh;
		}

		.main-content {
			flex-direction: column;
		}
	}
</style>
