import { ESLint } from 'eslint';
import svelte_parser from 'svelte-eslint-parser';
import svelte from 'eslint-plugin-svelte';

let svelte_5_linter: ESLint | undefined;

let svelte_4_linter: ESLint | undefined;

export function get_linter(version: number) {
	if (version < 5) {
		return (svelte_4_linter ??= new ESLint({
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
								compilerOptions: {
									runes: false,
								},
							},
						},
					},
				},
			],
		}));
	}
	return (svelte_5_linter ??= new ESLint({
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
							compilerOptions: {
								runes: true,
							},
						},
					},
				},
			},
		],
	}));
}
