import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchRepositoryTarball } from '$lib/fetchMarkdown';

export const GET: RequestHandler = async () => {
	const tarball_buffer = await fetchRepositoryTarball('sveltejs', 'svelte.dev');
	return json({ data: tarballBuffer });
};
