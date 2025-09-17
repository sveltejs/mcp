import { ESLint } from 'eslint';
import svelte_parser from 'svelte-eslint-parser';
import svelte from 'eslint-plugin-svelte';
import type { Config } from '@sveltejs/kit';

let svelte_5_linter: ESLint | undefined;

let svelte_4_linter: ESLint | undefined;

function base_config(svelte_config: Config): ESLint.Options['baseConfig'] {
	return [
		...svelte.configs.recommended,
		{
			files: ['*.svelte'],
			rules: {
				'no-self-assign': 'warn',
				'svelte/infinite-reactive-loop': 'warn',
				'svelte/no-dupe-else-if-blocks': 'warn',
				'svelte/no-dupe-on-directives': 'warn',
				'svelte/no-dupe-style-properties': 'warn',
				'svelte/no-dupe-use-directives': 'warn',
				'svelte/no-object-in-text-mustaches': 'warn',
				'svelte/no-raw-special-elements': 'warn',
				'svelte/no-reactive-functions': 'warn',
				'svelte/no-reactive-literals': 'warn',
				'svelte/no-store-async': 'warn',
				'svelte/no-svelte-internal': 'warn',
				'svelte/no-unnecessary-state-wrap': 'warn',
				'svelte/no-unused-props': 'warn',
				'svelte/no-unused-svelte-ignore': 'warn',
				'svelte/no-useless-children-snippet': 'warn',
				'svelte/no-useless-mustaches': 'warn',
				'svelte/prefer-svelte-reactivity': 'warn',
				'svelte/prefer-writable-derived': 'warn',
				'svelte/require-event-dispatcher-types': 'warn',
				'svelte/require-store-reactive-access': 'warn',
			},

			languageOptions: {
				ecmaVersion: 2022,
				sourceType: 'module',
				parser: svelte_parser,
				parserOptions: {
					svelteConfig: svelte_config,
				},
			},
		},
	];
}

export function get_linter(version: number) {
	if (version < 5) {
		return (svelte_4_linter ??= new ESLint({
			overrideConfigFile: true,
			baseConfig: base_config({
				compilerOptions: {
					runes: false,
				},
			}),
		}));
	}
	return (svelte_5_linter ??= new ESLint({
		overrideConfigFile: true,
		baseConfig: base_config({
			compilerOptions: {
				runes: true,
			},
		}),
	}));
}
