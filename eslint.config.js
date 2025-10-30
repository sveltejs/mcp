import prettier from 'eslint-config-prettier';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './apps/mcp-remote/svelte.config.js';
import eslint_plugin_import from 'eslint-plugin-import';
import pluginPnpm from 'eslint-plugin-pnpm';
import * as jsoncParser from 'jsonc-eslint-parser';
import * as yamlParser from 'yaml-eslint-parser';

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
	{
		name: 'pnpm/package.json',
		files: ['package.json', '**/package.json'],
		languageOptions: {
			parser: jsoncParser,
		},
		plugins: {
			pnpm: pluginPnpm,
		},
		rules: {
			'pnpm/json-enforce-catalog': 'error',
			'pnpm/json-valid-catalog': 'error',
			'pnpm/json-prefer-workspace-settings': 'error',
		},
	},
	{
		name: 'pnpm/pnpm-workspace-yaml',
		files: ['pnpm-workspace.yaml'],
		languageOptions: {
			parser: yamlParser,
		},
		plugins: {
			pnpm: pluginPnpm,
		},
		rules: {
			'pnpm/yaml-no-unused-catalog-item': 'error',
			'pnpm/yaml-no-duplicate-catalog-item': ['error', { checkDuplicates: 'exact-version' }],
			'pnpm/yaml-valid-packages': 'error',
		},
	},
	// --- TypeScript specific overrides below ---
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: ts.parser,
			parserOptions: {
				project: ['./tsconfig.json'],
				sourceType: 'module',
			},
		},
	},
]);
