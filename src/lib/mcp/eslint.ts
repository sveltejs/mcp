import { ESLint } from 'eslint';
import svelte_parser from 'svelte-eslint-parser';
import svelte from 'eslint-plugin-svelte';

export const eslint = new ESLint({
	overrideConfigFile: true,
	baseConfig: [
		...svelte.configs.all,
		{
			files: ['*.svelte', '*.svelte.ts', '*.svelte.js'],
			languageOptions: {
				ecmaVersion: 2022,
				sourceType: 'module',
				parser: svelte_parser,
			},
		},
	],
});
