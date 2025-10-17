# sv migrate

CLI tool for migrating Svelte(Kit) codebases. Delegates to [`svelte-migrate`](https://www.npmjs.com/package/svelte-migrate).

May add `@migration` task annotations in code for manual completion.

## Usage

```sh
npx sv migrate
```

Or specify migration:
```sh
npx sv migrate [migration]
```

## Migrations

### `app-state`
Migrates `$app/stores` → `$app/state` in `.svelte` files. [Details](/docs/kit/migrating-to-sveltekit-2#SvelteKit-2.12:-$app-stores-deprecated)

### `svelte-5`
Upgrades Svelte 4 → 5, converts components to [runes](../svelte/what-are-runes) syntax. [Migration guide](../svelte/v5-migration-guide)

### `self-closing-tags`
Replaces self-closing non-void elements. [PR](https://github.com/sveltejs/kit/pull/12128)

### `svelte-4`
Upgrades Svelte 3 → 4. [Migration guide](../svelte/v4-migration-guide)

### `sveltekit-2`
Upgrades SvelteKit 1 → 2. [Migration guide](../kit/migrating-to-sveltekit-2)

### `package`
Upgrades `@sveltejs/package` v1 → v2. [PR](https://github.com/sveltejs/kit/pull/8922)

### `routes`
Upgrades pre-release SvelteKit to v1 filesystem routing. [Discussion](https://github.com/sveltejs/kit/discussions/5774)