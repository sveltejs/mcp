import { defineConfig } from 'tsdown';

export default defineConfig([
	{
		entry: ['./src/index.ts'],
		platform: 'node',
		define: {
			// some eslint-plugin-svelte code expects __filename to exists but in an ESM environment it does not.
			__filename: '""',
		},
		// we need eslint at runtime but the bundler doesn't bundle `require`'s which `eslint-plugin-svelte` uses to require
		// `eslint/use-at-your-own-risk`. If we didn't have `eslint` as an actual dependency and didn't externalize it
		// the require would fail once executed in a project without eslint installed.
		external: ['eslint'],
		publint: true,
		dts: false,
		treeshake: true,
		clean: true,
		target: 'esnext',
	},
]);
