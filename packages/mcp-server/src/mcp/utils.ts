export async function fetch_with_timeout(
	url: string,
	timeout_ms: number = 10000,
): Promise<Response> {
	const controller = new AbortController();
	const timeout_id = setTimeout(() => controller.abort(), timeout_ms);

	try {
		const response = await fetch(url, { signal: controller.signal });
		clearTimeout(timeout_id);
		return response;
	} catch (error) {
		clearTimeout(timeout_id);
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error(`Request timed out after ${timeout_ms}ms`);
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
