import { ESLint } from 'eslint';
import svelte_parser from 'svelte-eslint-parser';
import svelte from 'eslint-plugin-svelte';

export const eslintForSvelte5 = new ESLint({
	overrideConfigFile: true,
	baseConfig: [
		...svelte.configs.all,
		{
			files: ['*.svelte', '*.svelte.ts', '*.svelte.js'],
			languageOptions: {
				ecmaVersion: 2022,
				sourceType: 'module',
				parser: svelte_parser,
				parserOptions: {
					svelteConfig: {
						runes: true,
					},
				},
			},
		},
	],
});

export const eslintForSvelte4 = new ESLint({
	overrideConfigFile: true,
	baseConfig: [
		...svelte.configs.all,
		{
			files: ['*.svelte'],
			languageOptions: {
				ecmaVersion: 2022,
				sourceType: 'module',
				parser: svelte_parser,
				parserOptions: {
					svelteConfig: {
						runes: false,
					},
				},
			},
		},
	],
});
