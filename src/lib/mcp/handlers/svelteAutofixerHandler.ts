import { add_autofixers_issues } from '../autofixers/add-autofixers-issues.js';
import { add_compile_issues } from '../autofixers/add-compile-issues.js';
import { add_eslint_issues } from '../autofixers/add-eslint-issues.js';

export const svelteAutofixerHandler = async ({
	code,
	filename,
	desired_svelte_version,
}: {
	code: string;
	filename?: string;
	desired_svelte_version: 4 | 5;
}): Promise<{
	content: Array<{ type: 'text'; text: string }>;
	structuredContent: {
		issues: string[];
		suggestions: string[];
		require_another_tool_call_after_fixing: boolean;
	};
}> => {
	const content: {
		issues: string[];
		suggestions: string[];
		require_another_tool_call_after_fixing: boolean;
	} = { issues: [], suggestions: [], require_another_tool_call_after_fixing: false };

	try {
		add_compile_issues(content, code, desired_svelte_version, filename);

		add_autofixers_issues(content, code, desired_svelte_version, filename);

		await add_eslint_issues(content, code, desired_svelte_version, filename);
	} catch (e: unknown) {
		const error = e as Error & { start?: { line: number; column: number } };
		content.issues.push(
			`${error.message} at line ${error.start?.line}, column ${error.start?.column}`,
		);
	}

	if (content.issues.length > 0 || content.suggestions.length > 0) {
		content.require_another_tool_call_after_fixing = true;
	}

	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(content),
			},
		],
		structuredContent: content,
	};
};
