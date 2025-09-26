export async function fetch_with_timeout(
	url: string,
	timeout_ms: number = 10000,
): Promise<Response> {
	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
		return response;
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error(`Request timed out after ${timeoutMs}ms`);
		}
		throw error;
	}
}

export async function get_sections() {
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
