# sv create

Sets up a new SvelteKit project with optional additional functionality.

## Usage

```sh
npx sv create [options] [path]
```

## Options

### `--from-playground <url>`
Create project from a [playground](/playground) URL. Downloads files, detects dependencies, and sets up complete project structure.

```sh
npx sv create --from-playground="https://svelte.dev/playground/hello-world"
```

### `--template <name>`
- `minimal` — barebones scaffolding
- `demo` — showcase app with word guessing game (works without JS)
- `library` — Svelte library template with `svelte-package`

### `--types <option>`
- `ts` — `.ts` files and `lang="ts"` in `.svelte` components
- `jsdoc` — [JSDoc syntax](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) for types

### `--no-types`
Disable typechecking (not recommended)

### `--no-add-ons`
Skip interactive add-ons prompt

### `--install <package-manager>`
Install dependencies with: `npm`, `pnpm`, `yarn`, `bun`, or `deno`

### `--no-install`
Skip dependency installation