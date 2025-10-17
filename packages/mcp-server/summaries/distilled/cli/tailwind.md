# Tailwind CSS

## Setup

```sh
npx sv add tailwindcss
```

## What's Installed

- Tailwind config following SvelteKit guide
- Tailwind Vite plugin
- Updated `app.css` and `+layout.svelte` (SvelteKit) or `App.svelte` (Vite)
- Prettier integration (if installed)

## Options

Add plugins via CLI:

```sh
npx sv add tailwindcss="plugins:typography"
```

Available plugins:
- `typography` — [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography)
- `forms` — [@tailwindcss/forms](https://github.com/tailwindlabs/tailwindcss-forms)