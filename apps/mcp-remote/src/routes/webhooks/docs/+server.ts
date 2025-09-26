import { github_content_schema, github_webhook_schema } from '$lib/schemas/index.js';
import * as v from 'valibot';

export async function POST({ request, fetch }) {
	const body = await request.json();
	// TODO add secret validation
	const validated_pull_request = v.safeParse(github_webhook_schema, body);
	if (!validated_pull_request.success) {
		return new Response('Invalid payload', { status: 400 });
	}

	const { pull_request } = validated_pull_request.output;

	if (!pull_request.merged) {
		return new Response(null, { status: 204 });
	}

	const patch = await fetch(pull_request.patch_url);
	if (!patch.ok) {
		return new Response('Failed to fetch patch', { status: 500 });
	}

	const patch_text = await patch.text();
	const files = [
		...patch_text.matchAll(
			/^diff --git\sa\/(?<file>.+?)\sb\/\1\n(?:(?<action>deleted|new)\sfile mode)?/gm,
		),
	].map((res) => ({ file: res.groups!.file, action: res.groups?.action ?? 'modified' }));

	for (const file of files) {
		if (file.action === 'deleted') {
			// delete path from db
			continue;
		}
		const new_file_content = await fetch(
			`https://api.github.com/repos/sveltejs/svelte.dev/contents/${file.file}`,
		);
		if (!new_file_content.ok) {
			// push file in queue and try again later?
			continue;
		}
		const new_file_json = await new_file_content.json();
		const validated_content = v.safeParse(github_content_schema, new_file_json);
		if (!validated_content.success) {
			// push file in queue and try again later?
			continue;
		}
		const content = Buffer.from(validated_content.output.content, 'base64').toString('utf-8');
		// save content and distilled content in the db
		console.log({ content, file: file.file });
	}

	return new Response(null, { status: 204 });
}
