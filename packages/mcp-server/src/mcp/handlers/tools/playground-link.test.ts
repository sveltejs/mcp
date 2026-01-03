import { InMemoryTransport } from '@tmcp/transport-in-memory';
import { beforeEach, describe, expect, it } from 'vitest';
import { server } from '../../index.js';

const transport = new InMemoryTransport(server);

let session: ReturnType<typeof transport.session>;

describe('playground-link tool', () => {
	beforeEach(async () => {
		session = transport.session();
		await session.initialize(
			'2025-06-18',
			{},
			{
				name: 'test-client',
				version: '1.0.0',
			},
		);
	});

	it('should create a playground link if App.svelte is present', async () => {
		const result = await session.callTool<{ url: string }>('playground-link', {
			name: 'My Playground',
			tailwind: false,
			files: {
				'App.svelte': `Hi there!`,
			},
		});
		expect(result.structuredContent).toBeDefined();
		expect(result.structuredContent?.url).toBeDefined();
		// Verify URL structure rather than exact match (gzip compression can vary by platform)
		expect(result.structuredContent?.url).toMatch(/^https:\/\/svelte\.dev\/playground#H4sIA/);
		expect(result.structuredContent?.url).toContain('svelte.dev/playground');
	});

	it('should have a content with the stringified version of structured content and an ui resource', async () => {
		const result = await session.callTool<{ url: string }>('playground-link', {
			name: 'My Playground',
			tailwind: false,
			files: {
				'App.svelte': `Hi there!`,
			},
		});
		expect(result.structuredContent).toBeDefined();
		expect(result.content).toStrictEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: 'text',
					text: JSON.stringify(result.structuredContent),
				}),
			]),
		);
		// Verify resource structure without exact URL match (gzip compression can vary by platform)
		expect(result.content).toStrictEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: 'resource',
					resource: expect.objectContaining({
						uri: 'ui://svelte/playground-link',
						mimeType: 'text/uri-list',
						_meta: { 'mcpui.dev/ui-preferred-frame-size': ['100%', '1200px'] },
						text: expect.stringMatching(/^https:\/\/svelte\.dev\/playground\/embed#H4sIA/),
					}),
				}),
			]),
		);
	});

	it('should not create a playground link if App.svelte is missing', async () => {
		const result = await session.callTool<{ url: string }>('playground-link', {
			name: 'My Playground',
			tailwind: false,
			files: {
				'Something.svelte': `Hi there!`,
			},
		});
		expect(result.isError).toBe(true);
		expect(result.content?.[0]).toStrictEqual({
			type: 'text',
			text: 'The files must contain an App.svelte file as the entry point',
		});
	});
});
