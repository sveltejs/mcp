import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { config } from 'dotenv';

export default defineConfig(({ mode }) => {
	config({ path: ['.env', `.env.${mode}`] });

	return {
		plugins: [sveltekit(), devtoolsJson()],
		server:
			mode === 'tunnel'
				? {
						allowedHosts: true,
					}
				: undefined,
		test: {
			expect: { requireAssertions: true },
			projects: [
				{
					extends: './vite.config.ts',
					test: {
						name: 'server',
						environment: 'node',
						include: ['src/**/*.{test,spec}.{js,ts}'],
						exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					},
				},
			],
		},
	};
});
