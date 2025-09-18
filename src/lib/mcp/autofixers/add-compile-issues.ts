import { compile } from 'svelte/compiler';

export function add_compile_issues(
	content: { issues: string[]; suggestions: string[] },
	code: string,
	desired_svelte_version: number,
	filename = 'Component.svelte',
) {
	const compilation_result = compile(code, {
		filename: filename || 'Component.svelte',
		generate: false,
		runes: desired_svelte_version >= 5,
	});

	for (const warning of compilation_result.warnings) {
		content.issues.push(
			`${warning.message} at line ${warning.start?.line}, column ${warning.start?.column}`,
		);
	}
}
