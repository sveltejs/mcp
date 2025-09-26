export async function fetchWithTimeout(url: string, timeoutMs: number = 10000): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, { signal: controller.signal });
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error(`Request timed out after ${timeoutMs}ms`);
		}
		throw error;
	}
}

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
