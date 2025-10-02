export async function fetch_with_timeout(
	url: string,
	timeout_ms: number = 10000,
): Promise<Response> {
	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(timeout_ms) });
		return response;
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error(`Request timed out after ${timeout_ms}ms`);
		}
		throw error;
	}
}

export async function get_sections() {
	const sections = await fetch_with_timeout('https://svelte.dev/docs/experimental/sections.json');
	return Object.entries(sections).map(([, section]) => ({
		title: section.metadata.title,
		use_cases: '',
		slug: section.slug,
		url: `https://svelte.dev/${section.slug}/llms.txt`,
	}));
}
