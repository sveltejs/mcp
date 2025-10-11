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

	let summary_title = $derived(
		data.type === 'use_cases' ? 'Use Cases Summary' : 'Distilled Version',
	);
	let is_distilled = $derived(data.type === 'distilled');

	function select_section(slug: string) {
		selected_slug = selected_slug === slug ? null : slug;
	}
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>

<div class="container">
	<header>
		<h1>{data.title}</h1>
		<div class="metadata">
			<span>Generated: {new Date(data.metadata.generated_at).toLocaleString()}</span>
			<span>Model: {data.metadata.model}</span>
			<span>Sections: {data.metadata.successful_summaries}/{data.metadata.total_sections}</span>
			<span
				>Space Savings: {data.metadata.total_distilled_length.toLocaleString()}/{data.metadata.total_original_length.toLocaleString()}
				chars ({data.metadata.total_space_savings.toFixed(1)}% reduction)</span
			>
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
								{is_distilled
									? section.summary.slice(0, 100) + (section.summary.length > 100 ? '...' : '')
									: section.summary}
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
						<h2>
							Original Content
							<span class="char-count"
								>{selected_section.original_length.toLocaleString()} chars</span
							>
						</h2>
						<div class="content-box">
							<pre>{selected_section.content}</pre>
						</div>
					</div>
					<div class="comparison-column">
						<h2>
							{summary_title}
							<span class="char-count"
								>{selected_section.distilled_length.toLocaleString()} chars ({selected_section.space_savings.toFixed(
									1,
								)}% savings)</span
							>
						</h2>
						<div class="content-box">
							<pre>{selected_section.summary}</pre>
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
		font-size: 1.875rem;
		font-weight: 600;
		color: #1a1a1a;
	}

	.metadata {
		display: flex;
		gap: 1.5rem;
		font-size: 0.9375rem;
		color: #666;
		flex-wrap: wrap;
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
		font-size: 0.9375rem;
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
		font-size: 0.9375rem;
		font-weight: 500;
		color: #1a1a1a;
		margin-bottom: 0.25rem;
	}

	.section-preview {
		font-size: 0.8125rem;
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
		font-size: 1.125rem;
		font-weight: 600;
		color: #1a1a1a;
		border-bottom: 1px solid #e0e0e0;
		background: #fafafa;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.char-count {
		font-size: 0.8125rem;
		font-weight: 400;
		color: #666;
		white-space: nowrap;
	}

	.content-box {
		padding: 1rem;
		overflow: auto;
		flex: 1;
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	.content-box pre {
		margin: 0;
		white-space: pre-wrap;
		word-wrap: break-word;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
		font-size: 0.875rem;
		color: #333;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #666;
		font-size: 0.9375rem;
	}

	@media (max-width: 768px) {
		.comparison-grid {
			grid-template-columns: 1fr;
		}

		.sidebar {
			width: 100%;
			max-height: 25vh;
		}

		.main-content {
			flex-direction: column;
		}

		.comparison-column h2 {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.char-count {
			font-size: 0.75rem;
		}
	}
</style>
