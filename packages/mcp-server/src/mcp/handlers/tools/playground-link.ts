import type { SvelteMcp } from '../../index.js';
import * as v from 'valibot';
import { icons } from '../../icons/index.js';
import { createUIResource } from '@mcp-ui/server';
import { tool } from 'tmcp/utils';

async function compress_and_encode_text(input: string) {
	const reader = new Blob([input]).stream().pipeThrough(new CompressionStream('gzip')).getReader();
	let buffer = '';
	for (;;) {
		const { done, value } = await reader.read();
		if (done) {
			reader.releaseLock();
			// Some sites like discord don't like it when links end with =
			return btoa(buffer).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
		} else {
			for (let i = 0; i < value.length; i++) {
				// decoding as utf-8 will make btoa reject the string
				buffer += String.fromCharCode(value[i]!);
			}
		}
	}
}

type File = {
	type: 'file';
	name: string;
	basename: string;
	contents: string;
	text: boolean;
};

const playground_link_schema = v.object({
	name: v.pipe(
		v.string(),
		v.description('The name of the Playground, it should reflect the user task'),
	),
	tailwind: v.pipe(
		v.boolean(),
		v.description(
			"If the code requires Tailwind CSS to work...only send true if it it's using tailwind classes in the code",
		),
	),
	files: v.pipe(
		v.record(v.string(), v.string()),
		v.description(
			"An object where all the keys are the filenames (with extensions) and the values are the file content. For example: { 'Component.svelte': '<script>...</script>', 'utils.js': 'export function ...' }. The playground accept multiple files so if are importing from other files just include them all at the root level.",
		),
	),
});

const playground_link_output_schema = v.object({
	url: v.string(),
});

export async function playground_link_handler({
	files,
	name,
	tailwind,
}: v.InferInput<typeof playground_link_schema>) {
	const playground_base = new URL('https://svelte.dev/playground');
	const playground_files: File[] = [];

	let has_app_svelte = false;

	for (const [filename, contents] of Object.entries(files)) {
		if (filename === 'App.svelte') has_app_svelte = true;
		playground_files.push({
			type: 'file',
			name: filename,
			basename: filename.replace(/^.*[\\/]/, ''),
			contents,
			text: true,
		});
	}

	if (!has_app_svelte) {
		throw new Error('The files must contain an App.svelte file as the entry point');
	}

	const playground_config = {
		name,
		tailwind: tailwind ?? false,
		files: playground_files,
	};

	playground_base.hash = await compress_and_encode_text(JSON.stringify(playground_config));

	const url = playground_base.toString();

	// use the embed path to have a cleaner UI for mcp-ui
	playground_base.pathname = '/playground/embed';

	return {
		url,
		iframe_url: playground_base.toString(),
	};
}

export function playground_link(server: SvelteMcp) {
	server.tool(
		{
			name: 'playground-link',
			description:
				'Generates a Playground link given a Svelte code snippet. Once you have the final version of the code you want to send to the user, ALWAYS ask the user if it wants a playground link to allow it to quickly check the code in the playground before calling this tool. NEVER use this tool if you have written the component to a file in the user project. The playground accept multiple files so if are importing from other files just include them all at the root level.',
			schema: playground_link_schema,
			outputSchema: playground_link_output_schema,
			annotations: {
				title: 'Playground Link',
				destructiveHint: false,
				readOnlyHint: true,
				openWorldHint: false,
			},
			icons,
		},
		async ({ files, name, tailwind }) => {
			if (server.ctx.sessionId && server.ctx.custom?.track) {
				await server.ctx.custom?.track?.(server.ctx.sessionId, 'playground-link');
			}
			try {
				const result = await playground_link_handler({ files, name, tailwind });
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({ url: result.url }),
						},
						createUIResource({
							uri: 'ui://svelte/playground-link',
							content: {
								type: 'externalUrl',
								iframeUrl: result.iframe_url,
							},
							uiMetadata: {
								'preferred-frame-size': ['100%', '1200px'],
							},
							encoding: 'text',
						}),
					],
					structuredContent: { url: result.url },
				};
			} catch (e) {
				const error = e as Error;
				if (server.ctx.sessionId && server.ctx.custom?.track) {
					await server.ctx.custom?.track?.(
						server.ctx.sessionId,
						'playground-link-error',
						error.message,
					);
				}
				return tool.error(error.message);
			}
		},
	);
}
