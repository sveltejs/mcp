import { beforeEach, describe, expect, it } from 'vitest';
import { server } from '../../index.js';

/**
 * Small utility to create a JSON-RPC request without having to always specify as const
 */
function request<const T>(request: T) {
	return request;
}

async function autofixer_tool_call(code: string, is_error = false, desired_svelte_version = 5) {
	const result = await server.receive({
		jsonrpc: '2.0',
		id: 2,
		method: 'tools/call',
		params: {
			name: 'svelte-autofixer',
			arguments: {
				code,
				desired_svelte_version,
				filename: 'App.svelte',
			},
		},
	});

	expect(result).toBeDefined();
	expect(result.result).toBeDefined();
	if (is_error) {
		return result.result;
	}
	expect(result.result.structuredContent).toBeDefined();
	return result.result.structuredContent;
}

describe('svelte-autofixer tool', () => {
	beforeEach(async () => {
		const initialize_request = request({
			jsonrpc: '2.0',
			id: 1,
			method: 'initialize',
			params: {
				protocolVersion: '2025-06-18',
				capabilities: {
					roots: { listChanged: true },
				},
				clientInfo: {
					name: 'test-client',
					version: '1.0.0',
				},
			},
		});

		await server.receive(initialize_request, {
			sessionId: 'svelte-autofixer-session',
		});
	});

	it('should add suggestions for js parse errors', async () => {
		const content = await autofixer_tool_call(`<script>
			$state count = 0;
		</script>`);
		expect(content.issues.length).toBeGreaterThan(0);
		expect(content.suggestions).toContain(
			"The code can't be compiled because a Javascript parse error. In case you are using runes like this `$state variable_name = 3;` or `$derived variable_name = 3 * count` that's not how runes are used. You need to use them as function calls without importing them: `const variable_name = $state(3)` and `const variable_name = $derived(3 * count)`.",
		);
	});

	it('should add suggestions for css invalid identifier', async () => {
		const content = await autofixer_tool_call(`<script>
				let my_color = $state('red');
			</script>
							
			<style>
				.my-class {
					color: {my_color};
				}
			</style>`);

		expect(content.issues.length).toBeGreaterThan(0);
		expect(content.suggestions).toContain(
			"The code can't be compiled because a valid CSS identifier is expected. This sometimes means you are trying to use a variable in CSS like this: `color: {my_color}` but Svelte doesn't support that. You can use inline CSS variables for that `<div style:--color={my_color}></div>` and then use the variable as usual in CSS with `color: var(--color)`.",
		);
	});

	it('should error in case the passed in version is different from 4 or 5', async () => {
		const content = await autofixer_tool_call(`whatever`, true, 3);

		expect(content.content).toBeDefined();
		expect(content.content[0]).toBeDefined();
		expect(content.content[0].text).toContain(
			'The desired_svelte_version MUST be either 4 or 5 but received "3"',
		);
	});
});
