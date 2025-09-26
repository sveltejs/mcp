export async function getSections() {
	return [
		{
			title: 'Overview',
			url: 'https://svelte.dev/docs/svelte/overview/llms.txt',
			use_cases: 'Useful when a beginner learns about Svelte',
		},
		{
			title: 'Getting Started',
			url: 'https://svelte.dev/docs/svelte/getting-started/llms.txt',
			use_cases: 'Useful when a beginner is starting a new Svelte project',
		},
		{
			title: 'Svelte Files',
			url: 'https://svelte.dev/docs/svelte/svelte-files/llms.txt',
			use_cases: 'Useful when a beginner is learning about Svelte files',
		},
	];
}
