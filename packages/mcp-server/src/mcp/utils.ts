import { fileURLToPath } from 'url';
import { dirname } from 'path';
import summaryData from '../use_cases.json' with { type: 'json' };

export async function fetch_with_timeout(
	url: string,
	timeout_ms: number = 10000,
): Promise<Response> {
	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(timeout_ms) });
		return response;
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error(`Request timed out after ${timeout_ms}ms`);
		}
		throw error;
	}
}

// TODO hardcoded for now but we'll fetch this from svelte.dev
const sections = {
	'docs/cli/overview': {
		metadata: { title: 'Overview' },
		slug: 'docs/cli/overview',
		file: 'docs/cli/10-introduction/10-overview.md',
	},
	'docs/cli/faq': {
		metadata: { title: 'Frequently asked questions' },
		slug: 'docs/cli/faq',
		file: 'docs/cli/10-introduction/20-faq.md',
	},
	'docs/cli/sv-create': {
		metadata: { title: 'sv create' },
		slug: 'docs/cli/sv-create',
		file: 'docs/cli/20-commands/10-sv-create.md',
	},
	'docs/cli/sv-add': {
		metadata: { title: 'sv add' },
		slug: 'docs/cli/sv-add',
		file: 'docs/cli/20-commands/20-sv-add.md',
	},
	'docs/cli/sv-check': {
		metadata: { title: 'sv check' },
		slug: 'docs/cli/sv-check',
		file: 'docs/cli/20-commands/30-sv-check.md',
	},
	'docs/cli/sv-migrate': {
		metadata: { title: 'sv migrate' },
		slug: 'docs/cli/sv-migrate',
		file: 'docs/cli/20-commands/40-sv-migrate.md',
	},
	'docs/cli/devtools-json': {
		metadata: { title: 'devtools-json' },
		slug: 'docs/cli/devtools-json',
		file: 'docs/cli/30-add-ons/03-devtools-json.md',
	},
	'docs/cli/drizzle': {
		metadata: { title: 'drizzle' },
		slug: 'docs/cli/drizzle',
		file: 'docs/cli/30-add-ons/05-drizzle.md',
	},
	'docs/cli/eslint': {
		metadata: { title: 'eslint' },
		slug: 'docs/cli/eslint',
		file: 'docs/cli/30-add-ons/10-eslint.md',
	},
	'docs/cli/lucia': {
		metadata: { title: 'lucia' },
		slug: 'docs/cli/lucia',
		file: 'docs/cli/30-add-ons/15-lucia.md',
	},
	'docs/cli/mdsvex': {
		metadata: { title: 'mdsvex' },
		slug: 'docs/cli/mdsvex',
		file: 'docs/cli/30-add-ons/20-mdsvex.md',
	},
	'docs/cli/paraglide': {
		metadata: { title: 'paraglide' },
		slug: 'docs/cli/paraglide',
		file: 'docs/cli/30-add-ons/25-paraglide.md',
	},
	'docs/cli/playwright': {
		metadata: { title: 'playwright' },
		slug: 'docs/cli/playwright',
		file: 'docs/cli/30-add-ons/30-playwright.md',
	},
	'docs/cli/prettier': {
		metadata: { title: 'prettier' },
		slug: 'docs/cli/prettier',
		file: 'docs/cli/30-add-ons/35-prettier.md',
	},
	'docs/cli/storybook': {
		metadata: { title: 'storybook' },
		slug: 'docs/cli/storybook',
		file: 'docs/cli/30-add-ons/40-storybook.md',
	},
	'docs/cli/sveltekit-adapter': {
		metadata: { title: 'sveltekit-adapter' },
		slug: 'docs/cli/sveltekit-adapter',
		file: 'docs/cli/30-add-ons/45-sveltekit-adapter.md',
	},
	'docs/cli/tailwind': {
		metadata: { title: 'tailwindcss' },
		slug: 'docs/cli/tailwind',
		file: 'docs/cli/30-add-ons/50-tailwind.md',
	},
	'docs/cli/vitest': {
		metadata: { title: 'vitest' },
		slug: 'docs/cli/vitest',
		file: 'docs/cli/30-add-ons/55-vitest.md',
	},
	'docs/kit/introduction': {
		metadata: { title: 'Introduction' },
		slug: 'docs/kit/introduction',
		file: 'docs/kit/10-getting-started/10-introduction.md',
	},
	'docs/kit/creating-a-project': {
		metadata: { title: 'Creating a project' },
		slug: 'docs/kit/creating-a-project',
		file: 'docs/kit/10-getting-started/20-creating-a-project.md',
	},
	'docs/kit/project-types': {
		metadata: { title: 'Project types' },
		slug: 'docs/kit/project-types',
		file: 'docs/kit/10-getting-started/25-project-types.md',
	},
	'docs/kit/project-structure': {
		metadata: { title: 'Project structure' },
		slug: 'docs/kit/project-structure',
		file: 'docs/kit/10-getting-started/30-project-structure.md',
	},
	'docs/kit/web-standards': {
		metadata: { title: 'Web standards' },
		slug: 'docs/kit/web-standards',
		file: 'docs/kit/10-getting-started/40-web-standards.md',
	},
	'docs/kit/routing': {
		metadata: { title: 'Routing' },
		slug: 'docs/kit/routing',
		file: 'docs/kit/20-core-concepts/10-routing.md',
	},
	'docs/kit/load': {
		metadata: { title: 'Loading data' },
		slug: 'docs/kit/load',
		file: 'docs/kit/20-core-concepts/20-load.md',
	},
	'docs/kit/form-actions': {
		metadata: { title: 'Form actions' },
		slug: 'docs/kit/form-actions',
		file: 'docs/kit/20-core-concepts/30-form-actions.md',
	},
	'docs/kit/page-options': {
		metadata: { title: 'Page options' },
		slug: 'docs/kit/page-options',
		file: 'docs/kit/20-core-concepts/40-page-options.md',
	},
	'docs/kit/state-management': {
		metadata: { title: 'State management' },
		slug: 'docs/kit/state-management',
		file: 'docs/kit/20-core-concepts/50-state-management.md',
	},
	'docs/kit/remote-functions': {
		metadata: { title: 'Remote functions' },
		slug: 'docs/kit/remote-functions',
		file: 'docs/kit/20-core-concepts/60-remote-functions.md',
	},
	'docs/kit/building-your-app': {
		metadata: { title: 'Building your app' },
		slug: 'docs/kit/building-your-app',
		file: 'docs/kit/25-build-and-deploy/10-building-your-app.md',
	},
	'docs/kit/adapters': {
		metadata: { title: 'Adapters' },
		slug: 'docs/kit/adapters',
		file: 'docs/kit/25-build-and-deploy/20-adapters.md',
	},
	'docs/kit/adapter-auto': {
		metadata: { title: 'Zero-config deployments' },
		slug: 'docs/kit/adapter-auto',
		file: 'docs/kit/25-build-and-deploy/30-adapter-auto.md',
	},
	'docs/kit/adapter-node': {
		metadata: { title: 'Node servers' },
		slug: 'docs/kit/adapter-node',
		file: 'docs/kit/25-build-and-deploy/40-adapter-node.md',
	},
	'docs/kit/adapter-static': {
		metadata: { title: 'Static site generation' },
		slug: 'docs/kit/adapter-static',
		file: 'docs/kit/25-build-and-deploy/50-adapter-static.md',
	},
	'docs/kit/single-page-apps': {
		metadata: { title: 'Single-page apps' },
		slug: 'docs/kit/single-page-apps',
		file: 'docs/kit/25-build-and-deploy/55-single-page-apps.md',
	},
	'docs/kit/adapter-cloudflare': {
		metadata: { title: 'Cloudflare' },
		slug: 'docs/kit/adapter-cloudflare',
		file: 'docs/kit/25-build-and-deploy/60-adapter-cloudflare.md',
	},
	'docs/kit/adapter-cloudflare-workers': {
		metadata: { title: 'Cloudflare Workers' },
		slug: 'docs/kit/adapter-cloudflare-workers',
		file: 'docs/kit/25-build-and-deploy/70-adapter-cloudflare-workers.md',
	},
	'docs/kit/adapter-netlify': {
		metadata: { title: 'Netlify' },
		slug: 'docs/kit/adapter-netlify',
		file: 'docs/kit/25-build-and-deploy/80-adapter-netlify.md',
	},
	'docs/kit/adapter-vercel': {
		metadata: { title: 'Vercel' },
		slug: 'docs/kit/adapter-vercel',
		file: 'docs/kit/25-build-and-deploy/90-adapter-vercel.md',
	},
	'docs/kit/writing-adapters': {
		metadata: { title: 'Writing adapters' },
		slug: 'docs/kit/writing-adapters',
		file: 'docs/kit/25-build-and-deploy/99-writing-adapters.md',
	},
	'docs/kit/advanced-routing': {
		metadata: { title: 'Advanced routing' },
		slug: 'docs/kit/advanced-routing',
		file: 'docs/kit/30-advanced/10-advanced-routing.md',
	},
	'docs/kit/hooks': {
		metadata: { title: 'Hooks' },
		slug: 'docs/kit/hooks',
		file: 'docs/kit/30-advanced/20-hooks.md',
	},
	'docs/kit/errors': {
		metadata: { title: 'Errors' },
		slug: 'docs/kit/errors',
		file: 'docs/kit/30-advanced/25-errors.md',
	},
	'docs/kit/link-options': {
		metadata: { title: 'Link options' },
		slug: 'docs/kit/link-options',
		file: 'docs/kit/30-advanced/30-link-options.md',
	},
	'docs/kit/service-workers': {
		metadata: { title: 'Service workers' },
		slug: 'docs/kit/service-workers',
		file: 'docs/kit/30-advanced/40-service-workers.md',
	},
	'docs/kit/server-only-modules': {
		metadata: { title: 'Server-only modules' },
		slug: 'docs/kit/server-only-modules',
		file: 'docs/kit/30-advanced/50-server-only-modules.md',
	},
	'docs/kit/snapshots': {
		metadata: { title: 'Snapshots' },
		slug: 'docs/kit/snapshots',
		file: 'docs/kit/30-advanced/65-snapshots.md',
	},
	'docs/kit/shallow-routing': {
		metadata: { title: 'Shallow routing' },
		slug: 'docs/kit/shallow-routing',
		file: 'docs/kit/30-advanced/67-shallow-routing.md',
	},
	'docs/kit/observability': {
		metadata: { title: 'Observability' },
		slug: 'docs/kit/observability',
		file: 'docs/kit/30-advanced/68-observability.md',
	},
	'docs/kit/packaging': {
		metadata: { title: 'Packaging' },
		slug: 'docs/kit/packaging',
		file: 'docs/kit/30-advanced/70-packaging.md',
	},
	'docs/kit/auth': {
		metadata: { title: 'Auth' },
		slug: 'docs/kit/auth',
		file: 'docs/kit/40-best-practices/03-auth.md',
	},
	'docs/kit/performance': {
		metadata: { title: 'Performance' },
		slug: 'docs/kit/performance',
		file: 'docs/kit/40-best-practices/05-performance.md',
	},
	'docs/kit/icons': {
		metadata: { title: 'Icons' },
		slug: 'docs/kit/icons',
		file: 'docs/kit/40-best-practices/06-icons.md',
	},
	'docs/kit/images': {
		metadata: { title: 'Images' },
		slug: 'docs/kit/images',
		file: 'docs/kit/40-best-practices/07-images.md',
	},
	'docs/kit/accessibility': {
		metadata: { title: 'Accessibility' },
		slug: 'docs/kit/accessibility',
		file: 'docs/kit/40-best-practices/10-accessibility.md',
	},
	'docs/kit/seo': {
		metadata: { title: 'SEO' },
		slug: 'docs/kit/seo',
		file: 'docs/kit/40-best-practices/20-seo.md',
	},
	'docs/kit/faq': {
		metadata: { title: 'Frequently asked questions' },
		slug: 'docs/kit/faq',
		file: 'docs/kit/60-appendix/10-faq.md',
	},
	'docs/kit/integrations': {
		metadata: { title: 'Integrations' },
		slug: 'docs/kit/integrations',
		file: 'docs/kit/60-appendix/20-integrations.md',
	},
	'docs/kit/debugging': {
		metadata: { title: 'Breakpoint Debugging' },
		slug: 'docs/kit/debugging',
		file: 'docs/kit/60-appendix/25-debugging.md',
	},
	'docs/kit/migrating-to-sveltekit-2': {
		metadata: { title: 'Migrating to SvelteKit v2' },
		slug: 'docs/kit/migrating-to-sveltekit-2',
		file: 'docs/kit/60-appendix/30-migrating-to-sveltekit-2.md',
	},
	'docs/kit/migrating': {
		metadata: { title: 'Migrating from Sapper' },
		slug: 'docs/kit/migrating',
		file: 'docs/kit/60-appendix/40-migrating.md',
	},
	'docs/kit/additional-resources': {
		metadata: { title: 'Additional resources' },
		slug: 'docs/kit/additional-resources',
		file: 'docs/kit/60-appendix/50-additional-resources.md',
	},
	'docs/kit/glossary': {
		metadata: { title: 'Glossary' },
		slug: 'docs/kit/glossary',
		file: 'docs/kit/60-appendix/60-glossary.md',
	},
	'docs/kit/@sveltejs-kit': {
		metadata: { title: '@sveltejs/kit' },
		slug: 'docs/kit/@sveltejs-kit',
		file: 'docs/kit/98-reference/10-@sveltejs-kit.md',
	},
	'docs/kit/@sveltejs-kit-hooks': {
		metadata: { title: '@sveltejs/kit/hooks' },
		slug: 'docs/kit/@sveltejs-kit-hooks',
		file: 'docs/kit/98-reference/15-@sveltejs-kit-hooks.md',
	},
	'docs/kit/@sveltejs-kit-node-polyfills': {
		metadata: { title: '@sveltejs/kit/node/polyfills' },
		slug: 'docs/kit/@sveltejs-kit-node-polyfills',
		file: 'docs/kit/98-reference/15-@sveltejs-kit-node-polyfills.md',
	},
	'docs/kit/@sveltejs-kit-node': {
		metadata: { title: '@sveltejs/kit/node' },
		slug: 'docs/kit/@sveltejs-kit-node',
		file: 'docs/kit/98-reference/15-@sveltejs-kit-node.md',
	},
	'docs/kit/@sveltejs-kit-vite': {
		metadata: { title: '@sveltejs/kit/vite' },
		slug: 'docs/kit/@sveltejs-kit-vite',
		file: 'docs/kit/98-reference/15-@sveltejs-kit-vite.md',
	},
	'docs/kit/$app-environment': {
		metadata: { title: '$app/environment' },
		slug: 'docs/kit/$app-environment',
		file: 'docs/kit/98-reference/20-$app-environment.md',
	},
	'docs/kit/$app-forms': {
		metadata: { title: '$app/forms' },
		slug: 'docs/kit/$app-forms',
		file: 'docs/kit/98-reference/20-$app-forms.md',
	},
	'docs/kit/$app-navigation': {
		metadata: { title: '$app/navigation' },
		slug: 'docs/kit/$app-navigation',
		file: 'docs/kit/98-reference/20-$app-navigation.md',
	},
	'docs/kit/$app-paths': {
		metadata: { title: '$app/paths' },
		slug: 'docs/kit/$app-paths',
		file: 'docs/kit/98-reference/20-$app-paths.md',
	},
	'docs/kit/$app-server': {
		metadata: { title: '$app/server' },
		slug: 'docs/kit/$app-server',
		file: 'docs/kit/98-reference/20-$app-server.md',
	},
	'docs/kit/$app-state': {
		metadata: { title: '$app/state' },
		slug: 'docs/kit/$app-state',
		file: 'docs/kit/98-reference/20-$app-state.md',
	},
	'docs/kit/$app-stores': {
		metadata: { title: '$app/stores' },
		slug: 'docs/kit/$app-stores',
		file: 'docs/kit/98-reference/20-$app-stores.md',
	},
	'docs/kit/$app-types': {
		metadata: { title: '$app/types' },
		slug: 'docs/kit/$app-types',
		file: 'docs/kit/98-reference/20-$app-types.md',
	},
	'docs/kit/$env-dynamic-private': {
		metadata: { title: '$env/dynamic/private' },
		slug: 'docs/kit/$env-dynamic-private',
		file: 'docs/kit/98-reference/25-$env-dynamic-private.md',
	},
	'docs/kit/$env-dynamic-public': {
		metadata: { title: '$env/dynamic/public' },
		slug: 'docs/kit/$env-dynamic-public',
		file: 'docs/kit/98-reference/25-$env-dynamic-public.md',
	},
	'docs/kit/$env-static-private': {
		metadata: { title: '$env/static/private' },
		slug: 'docs/kit/$env-static-private',
		file: 'docs/kit/98-reference/25-$env-static-private.md',
	},
	'docs/kit/$env-static-public': {
		metadata: { title: '$env/static/public' },
		slug: 'docs/kit/$env-static-public',
		file: 'docs/kit/98-reference/25-$env-static-public.md',
	},
	'docs/kit/$lib': {
		metadata: { title: '$lib' },
		slug: 'docs/kit/$lib',
		file: 'docs/kit/98-reference/26-$lib.md',
	},
	'docs/kit/$service-worker': {
		metadata: { title: '$service-worker' },
		slug: 'docs/kit/$service-worker',
		file: 'docs/kit/98-reference/27-$service-worker.md',
	},
	'docs/kit/configuration': {
		metadata: { title: 'Configuration' },
		slug: 'docs/kit/configuration',
		file: 'docs/kit/98-reference/50-configuration.md',
	},
	'docs/kit/cli': {
		metadata: { title: 'Command Line Interface' },
		slug: 'docs/kit/cli',
		file: 'docs/kit/98-reference/52-cli.md',
	},
	'docs/kit/types': {
		metadata: { title: 'Types' },
		slug: 'docs/kit/types',
		file: 'docs/kit/98-reference/54-types.md',
	},
	'docs/svelte/overview': {
		metadata: { title: 'Overview' },
		slug: 'docs/svelte/overview',
		file: 'docs/svelte/01-introduction/01-overview.md',
	},
	'docs/svelte/getting-started': {
		metadata: { title: 'Getting started' },
		slug: 'docs/svelte/getting-started',
		file: 'docs/svelte/01-introduction/02-getting-started.md',
	},
	'docs/svelte/svelte-files': {
		metadata: { title: '.svelte files' },
		slug: 'docs/svelte/svelte-files',
		file: 'docs/svelte/01-introduction/03-svelte-files.md',
	},
	'docs/svelte/svelte-js-files': {
		metadata: { title: '.svelte.js and .svelte.ts files' },
		slug: 'docs/svelte/svelte-js-files',
		file: 'docs/svelte/01-introduction/04-svelte-js-files.md',
	},
	'docs/svelte/what-are-runes': {
		metadata: { title: 'What are runes?' },
		slug: 'docs/svelte/what-are-runes',
		file: 'docs/svelte/02-runes/01-what-are-runes.md',
	},
	'docs/svelte/$state': {
		metadata: { title: '$state' },
		slug: 'docs/svelte/$state',
		file: 'docs/svelte/02-runes/02-$state.md',
	},
	'docs/svelte/$derived': {
		metadata: { title: '$derived' },
		slug: 'docs/svelte/$derived',
		file: 'docs/svelte/02-runes/03-$derived.md',
	},
	'docs/svelte/$effect': {
		metadata: { title: '$effect' },
		slug: 'docs/svelte/$effect',
		file: 'docs/svelte/02-runes/04-$effect.md',
	},
	'docs/svelte/$props': {
		metadata: { title: '$props' },
		slug: 'docs/svelte/$props',
		file: 'docs/svelte/02-runes/05-$props.md',
	},
	'docs/svelte/$bindable': {
		metadata: { title: '$bindable' },
		slug: 'docs/svelte/$bindable',
		file: 'docs/svelte/02-runes/06-$bindable.md',
	},
	'docs/svelte/$inspect': {
		metadata: { title: '$inspect' },
		slug: 'docs/svelte/$inspect',
		file: 'docs/svelte/02-runes/07-$inspect.md',
	},
	'docs/svelte/$host': {
		metadata: { title: '$host' },
		slug: 'docs/svelte/$host',
		file: 'docs/svelte/02-runes/08-$host.md',
	},
	'docs/svelte/basic-markup': {
		metadata: { title: 'Basic markup' },
		slug: 'docs/svelte/basic-markup',
		file: 'docs/svelte/03-template-syntax/01-basic-markup.md',
	},
	'docs/svelte/if': {
		metadata: { title: '{#if ...}' },
		slug: 'docs/svelte/if',
		file: 'docs/svelte/03-template-syntax/02-if.md',
	},
	'docs/svelte/each': {
		metadata: { title: '{#each ...}' },
		slug: 'docs/svelte/each',
		file: 'docs/svelte/03-template-syntax/03-each.md',
	},
	'docs/svelte/key': {
		metadata: { title: '{#key ...}' },
		slug: 'docs/svelte/key',
		file: 'docs/svelte/03-template-syntax/04-key.md',
	},
	'docs/svelte/await': {
		metadata: { title: '{#await ...}' },
		slug: 'docs/svelte/await',
		file: 'docs/svelte/03-template-syntax/05-await.md',
	},
	'docs/svelte/snippet': {
		metadata: { title: '{#snippet ...}' },
		slug: 'docs/svelte/snippet',
		file: 'docs/svelte/03-template-syntax/06-snippet.md',
	},
	'docs/svelte/@render': {
		metadata: { title: '{@render ...}' },
		slug: 'docs/svelte/@render',
		file: 'docs/svelte/03-template-syntax/07-@render.md',
	},
	'docs/svelte/@html': {
		metadata: { title: '{@html ...}' },
		slug: 'docs/svelte/@html',
		file: 'docs/svelte/03-template-syntax/08-@html.md',
	},
	'docs/svelte/@attach': {
		metadata: { title: '{@attach ...}' },
		slug: 'docs/svelte/@attach',
		file: 'docs/svelte/03-template-syntax/09-@attach.md',
	},
	'docs/svelte/@const': {
		metadata: { title: '{@const ...}' },
		slug: 'docs/svelte/@const',
		file: 'docs/svelte/03-template-syntax/10-@const.md',
	},
	'docs/svelte/@debug': {
		metadata: { title: '{@debug ...}' },
		slug: 'docs/svelte/@debug',
		file: 'docs/svelte/03-template-syntax/11-@debug.md',
	},
	'docs/svelte/bind': {
		metadata: { title: 'bind:' },
		slug: 'docs/svelte/bind',
		file: 'docs/svelte/03-template-syntax/12-bind.md',
	},
	'docs/svelte/use': {
		metadata: { title: 'use:' },
		slug: 'docs/svelte/use',
		file: 'docs/svelte/03-template-syntax/13-use.md',
	},
	'docs/svelte/transition': {
		metadata: { title: 'transition:' },
		slug: 'docs/svelte/transition',
		file: 'docs/svelte/03-template-syntax/14-transition.md',
	},
	'docs/svelte/in-and-out': {
		metadata: { title: 'in: and out:' },
		slug: 'docs/svelte/in-and-out',
		file: 'docs/svelte/03-template-syntax/15-in-and-out.md',
	},
	'docs/svelte/animate': {
		metadata: { title: 'animate:' },
		slug: 'docs/svelte/animate',
		file: 'docs/svelte/03-template-syntax/16-animate.md',
	},
	'docs/svelte/style': {
		metadata: { title: 'style:' },
		slug: 'docs/svelte/style',
		file: 'docs/svelte/03-template-syntax/17-style.md',
	},
	'docs/svelte/class': {
		metadata: { title: 'class' },
		slug: 'docs/svelte/class',
		file: 'docs/svelte/03-template-syntax/18-class.md',
	},
	'docs/svelte/await-expressions': {
		metadata: { title: 'await' },
		slug: 'docs/svelte/await-expressions',
		file: 'docs/svelte/03-template-syntax/19-await-expressions.md',
	},
	'docs/svelte/scoped-styles': {
		metadata: { title: 'Scoped styles' },
		slug: 'docs/svelte/scoped-styles',
		file: 'docs/svelte/04-styling/01-scoped-styles.md',
	},
	'docs/svelte/global-styles': {
		metadata: { title: 'Global styles' },
		slug: 'docs/svelte/global-styles',
		file: 'docs/svelte/04-styling/02-global-styles.md',
	},
	'docs/svelte/custom-properties': {
		metadata: { title: 'Custom properties' },
		slug: 'docs/svelte/custom-properties',
		file: 'docs/svelte/04-styling/03-custom-properties.md',
	},
	'docs/svelte/nested-style-elements': {
		metadata: { title: 'Nested <style> elements' },
		slug: 'docs/svelte/nested-style-elements',
		file: 'docs/svelte/04-styling/04-nested-style-elements.md',
	},
	'docs/svelte/svelte-boundary': {
		metadata: { title: '<svelte:boundary>' },
		slug: 'docs/svelte/svelte-boundary',
		file: 'docs/svelte/05-special-elements/01-svelte-boundary.md',
	},
	'docs/svelte/svelte-window': {
		metadata: { title: '<svelte:window>' },
		slug: 'docs/svelte/svelte-window',
		file: 'docs/svelte/05-special-elements/02-svelte-window.md',
	},
	'docs/svelte/svelte-document': {
		metadata: { title: '<svelte:document>' },
		slug: 'docs/svelte/svelte-document',
		file: 'docs/svelte/05-special-elements/03-svelte-document.md',
	},
	'docs/svelte/svelte-body': {
		metadata: { title: '<svelte:body>' },
		slug: 'docs/svelte/svelte-body',
		file: 'docs/svelte/05-special-elements/04-svelte-body.md',
	},
	'docs/svelte/svelte-head': {
		metadata: { title: '<svelte:head>' },
		slug: 'docs/svelte/svelte-head',
		file: 'docs/svelte/05-special-elements/05-svelte-head.md',
	},
	'docs/svelte/svelte-element': {
		metadata: { title: '<svelte:element>' },
		slug: 'docs/svelte/svelte-element',
		file: 'docs/svelte/05-special-elements/06-svelte-element.md',
	},
	'docs/svelte/svelte-options': {
		metadata: { title: '<svelte:options>' },
		slug: 'docs/svelte/svelte-options',
		file: 'docs/svelte/05-special-elements/07-svelte-options.md',
	},
	'docs/svelte/stores': {
		metadata: { title: 'Stores' },
		slug: 'docs/svelte/stores',
		file: 'docs/svelte/06-runtime/01-stores.md',
	},
	'docs/svelte/context': {
		metadata: { title: 'Context' },
		slug: 'docs/svelte/context',
		file: 'docs/svelte/06-runtime/02-context.md',
	},
	'docs/svelte/lifecycle-hooks': {
		metadata: { title: 'Lifecycle hooks' },
		slug: 'docs/svelte/lifecycle-hooks',
		file: 'docs/svelte/06-runtime/03-lifecycle-hooks.md',
	},
	'docs/svelte/imperative-component-api': {
		metadata: { title: 'Imperative component API' },
		slug: 'docs/svelte/imperative-component-api',
		file: 'docs/svelte/06-runtime/04-imperative-component-api.md',
	},
	'docs/svelte/testing': {
		metadata: { title: 'Testing' },
		slug: 'docs/svelte/testing',
		file: 'docs/svelte/07-misc/02-testing.md',
	},
	'docs/svelte/typescript': {
		metadata: { title: 'TypeScript' },
		slug: 'docs/svelte/typescript',
		file: 'docs/svelte/07-misc/03-typescript.md',
	},
	'docs/svelte/custom-elements': {
		metadata: { title: 'Custom elements' },
		slug: 'docs/svelte/custom-elements',
		file: 'docs/svelte/07-misc/04-custom-elements.md',
	},
	'docs/svelte/v4-migration-guide': {
		metadata: { title: 'Svelte 4 migration guide' },
		slug: 'docs/svelte/v4-migration-guide',
		file: 'docs/svelte/07-misc/06-v4-migration-guide.md',
	},
	'docs/svelte/v5-migration-guide': {
		metadata: { title: 'Svelte 5 migration guide' },
		slug: 'docs/svelte/v5-migration-guide',
		file: 'docs/svelte/07-misc/07-v5-migration-guide.md',
	},
	'docs/svelte/faq': {
		metadata: { title: 'Frequently asked questions' },
		slug: 'docs/svelte/faq',
		file: 'docs/svelte/07-misc/99-faq.md',
	},
	'docs/svelte/svelte': {
		metadata: { title: 'svelte' },
		slug: 'docs/svelte/svelte',
		file: 'docs/svelte/98-reference/20-svelte.md',
	},
	'docs/svelte/svelte-action': {
		metadata: { title: 'svelte/action' },
		slug: 'docs/svelte/svelte-action',
		file: 'docs/svelte/98-reference/21-svelte-action.md',
	},
	'docs/svelte/svelte-animate': {
		metadata: { title: 'svelte/animate' },
		slug: 'docs/svelte/svelte-animate',
		file: 'docs/svelte/98-reference/21-svelte-animate.md',
	},
	'docs/svelte/svelte-attachments': {
		metadata: { title: 'svelte/attachments' },
		slug: 'docs/svelte/svelte-attachments',
		file: 'docs/svelte/98-reference/21-svelte-attachments.md',
	},
	'docs/svelte/svelte-compiler': {
		metadata: { title: 'svelte/compiler' },
		slug: 'docs/svelte/svelte-compiler',
		file: 'docs/svelte/98-reference/21-svelte-compiler.md',
	},
	'docs/svelte/svelte-easing': {
		metadata: { title: 'svelte/easing' },
		slug: 'docs/svelte/svelte-easing',
		file: 'docs/svelte/98-reference/21-svelte-easing.md',
	},
	'docs/svelte/svelte-events': {
		metadata: { title: 'svelte/events' },
		slug: 'docs/svelte/svelte-events',
		file: 'docs/svelte/98-reference/21-svelte-events.md',
	},
	'docs/svelte/svelte-legacy': {
		metadata: { title: 'svelte/legacy' },
		slug: 'docs/svelte/svelte-legacy',
		file: 'docs/svelte/98-reference/21-svelte-legacy.md',
	},
	'docs/svelte/svelte-motion': {
		metadata: { title: 'svelte/motion' },
		slug: 'docs/svelte/svelte-motion',
		file: 'docs/svelte/98-reference/21-svelte-motion.md',
	},
	'docs/svelte/svelte-reactivity-window': {
		metadata: { title: 'svelte/reactivity/window' },
		slug: 'docs/svelte/svelte-reactivity-window',
		file: 'docs/svelte/98-reference/21-svelte-reactivity-window.md',
	},
	'docs/svelte/svelte-reactivity': {
		metadata: { title: 'svelte/reactivity' },
		slug: 'docs/svelte/svelte-reactivity',
		file: 'docs/svelte/98-reference/21-svelte-reactivity.md',
	},
	'docs/svelte/svelte-server': {
		metadata: { title: 'svelte/server' },
		slug: 'docs/svelte/svelte-server',
		file: 'docs/svelte/98-reference/21-svelte-server.md',
	},
	'docs/svelte/svelte-store': {
		metadata: { title: 'svelte/store' },
		slug: 'docs/svelte/svelte-store',
		file: 'docs/svelte/98-reference/21-svelte-store.md',
	},
	'docs/svelte/svelte-transition': {
		metadata: { title: 'svelte/transition' },
		slug: 'docs/svelte/svelte-transition',
		file: 'docs/svelte/98-reference/21-svelte-transition.md',
	},
	'docs/svelte/compiler-errors': {
		metadata: { title: 'Compiler errors' },
		slug: 'docs/svelte/compiler-errors',
		file: 'docs/svelte/98-reference/30-compiler-errors.md',
	},
	'docs/svelte/compiler-warnings': {
		metadata: { title: 'Compiler warnings' },
		slug: 'docs/svelte/compiler-warnings',
		file: 'docs/svelte/98-reference/30-compiler-warnings.md',
	},
	'docs/svelte/runtime-errors': {
		metadata: { title: 'Runtime errors' },
		slug: 'docs/svelte/runtime-errors',
		file: 'docs/svelte/98-reference/30-runtime-errors.md',
	},
	'docs/svelte/runtime-warnings': {
		metadata: { title: 'Runtime warnings' },
		slug: 'docs/svelte/runtime-warnings',
		file: 'docs/svelte/98-reference/30-runtime-warnings.md',
	},
	'docs/svelte/legacy-overview': {
		metadata: { title: 'Overview' },
		slug: 'docs/svelte/legacy-overview',
		file: 'docs/svelte/99-legacy/00-legacy-overview.md',
	},
	'docs/svelte/legacy-let': {
		metadata: { title: 'Reactive let/var declarations' },
		slug: 'docs/svelte/legacy-let',
		file: 'docs/svelte/99-legacy/01-legacy-let.md',
	},
	'docs/svelte/legacy-reactive-assignments': {
		metadata: { title: 'Reactive $: statements' },
		slug: 'docs/svelte/legacy-reactive-assignments',
		file: 'docs/svelte/99-legacy/02-legacy-reactive-assignments.md',
	},
	'docs/svelte/legacy-export-let': {
		metadata: { title: 'export let' },
		slug: 'docs/svelte/legacy-export-let',
		file: 'docs/svelte/99-legacy/03-legacy-export-let.md',
	},
	'docs/svelte/legacy-$$props-and-$$restProps': {
		metadata: { title: '$$props and $$restProps' },
		slug: 'docs/svelte/legacy-$$props-and-$$restProps',
		file: 'docs/svelte/99-legacy/04-legacy-$$props-and-$$restProps.md',
	},
	'docs/svelte/legacy-on': {
		metadata: { title: 'on:' },
		slug: 'docs/svelte/legacy-on',
		file: 'docs/svelte/99-legacy/10-legacy-on.md',
	},
	'docs/svelte/legacy-slots': {
		metadata: { title: '<slot>' },
		slug: 'docs/svelte/legacy-slots',
		file: 'docs/svelte/99-legacy/20-legacy-slots.md',
	},
	'docs/svelte/legacy-$$slots': {
		metadata: { title: '$$slots' },
		slug: 'docs/svelte/legacy-$$slots',
		file: 'docs/svelte/99-legacy/21-legacy-$$slots.md',
	},
	'docs/svelte/legacy-svelte-fragment': {
		metadata: { title: '<svelte:fragment>' },
		slug: 'docs/svelte/legacy-svelte-fragment',
		file: 'docs/svelte/99-legacy/22-legacy-svelte-fragment.md',
	},
	'docs/svelte/legacy-svelte-component': {
		metadata: { title: '<svelte:component>' },
		slug: 'docs/svelte/legacy-svelte-component',
		file: 'docs/svelte/99-legacy/30-legacy-svelte-component.md',
	},
	'docs/svelte/legacy-svelte-self': {
		metadata: { title: '<svelte:self>' },
		slug: 'docs/svelte/legacy-svelte-self',
		file: 'docs/svelte/99-legacy/31-legacy-svelte-self.md',
	},
	'docs/svelte/legacy-component-api': {
		metadata: { title: 'Imperative component API' },
		slug: 'docs/svelte/legacy-component-api',
		file: 'docs/svelte/99-legacy/40-legacy-component-api.md',
	},
};

const summaries = (summaryData.summaries || {}) as Record<string, string>;

export async function get_sections() {
	return Object.entries(sections).map(([, section]) => ({
		title: section.metadata.title,
		use_cases: summaries[section.slug] || '',
		slug: section.slug,
		url: `https://svelte.dev/${section.slug}/llms.txt`,
	}));
}

export async function format_sections_list(): Promise<string> {
	const sections = await get_sections();
	return sections
		.map((s) => `* title: ${s.title}, use_cases: ${s.use_cases}, path: ${s.url}`)
		.join('\n');
}
