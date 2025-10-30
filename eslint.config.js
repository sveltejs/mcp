import prettier from 'eslint-config-prettier';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './apps/mcp-remote/svelte.config.js';
import eslint_plugin_import from 'eslint-plugin-import';

const gitignore_path = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default /** @type {import("eslint").Linter.Config} */ ([
	includeIgnoreFile(gitignore_path),
	{
		ignores: ['.claude/**/*', '.changeset/*'],
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	eslint_plugin_import.flatConfigs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: ['variableLike'],
					format: ['snake_case', 'UPPER_CASE'],
					leadingUnderscore: 'allow',
				},
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'func-style': ['error', 'declaration', { allowTypeAnnotation: true }],
			'import/no-unresolved': 'off', // this doesn't work well with typescript path mapping
			'import/extensions': [
				'error',
				{
					ignorePackages: true,
					pattern: {
						js: 'always',
						mjs: 'always',
						cjs: 'always',
						ts: 'always',
						svelte: 'always',
						svg: 'always',
						json: 'always',
					},
				},
			],
		},
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig,
			},
		},
	},
]);
