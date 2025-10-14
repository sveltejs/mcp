# Paraglide i18n

Compiler-based i18n library with tree-shakable messages, small bundles, type-safety.

## Installation

```sh
npx sv add paraglide
```

## Includes

- Inlang project settings
- Paraglide Vite plugin
- SvelteKit `reroute` and `handle` hooks
- `text-direction` and `lang` attributes in `app.html`
- Updated `.gitignore`
- Optional demo page

## Options

**languageTags** - IETF BCP 47 language tags:
```sh
npx sv add paraglide="languageTags:en,es"
```

**demo** - Generate demo page:
```sh
npx sv add paraglide="demo:yes"
```