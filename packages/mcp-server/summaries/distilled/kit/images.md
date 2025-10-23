# Images

## Vite Built-in Handling

Vite automatically processes imported assets, adding hashes for caching and inlining small assets.

```svelte
<script>
	import logo from '$lib/assets/logo.png';
</script>

<img alt="The project logo" src={logo} />
```

## @sveltejs/enhanced-img

Plugin that generates multiple formats (avif, webp), sizes, strips EXIF, and prevents layout shift. Only optimizes files available at build time.

### Setup

```sh
npm i -D @sveltejs/enhanced-img
```

```js
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		enhancedImages(), // must come before SvelteKit plugin
		sveltekit()
	]
});
```

Build output cached in `./node_modules/.cache/imagetools`.

### Basic Usage

```svelte
<enhanced:img src="./path/to/your/image.jpg" alt="An alt text" />
```

Generates `<picture>` with multiple formats/sizes. Provide images at 2x resolution for HiDPI displays.

**Note:** Use `enhanced\:img` in CSS selectors to escape the colon.

### Dynamic Images

```svelte
<script>
	import MyImage from './path/to/your/image.jpg?enhanced';
</script>

<enhanced:img src={MyImage} alt="some alt text" />
```

With `import.meta.glob`:

```svelte
<script>
	const imageModules = import.meta.glob(
		'/path/to/assets/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
		{
			eager: true,
			query: {
				enhanced: true
			}
		}
	)
</script>

{#each Object.entries(imageModules) as [_path, module]}
	<enhanced:img src={module.default} alt="some alt text" />
{/each}
```

### Dimensions

`width` and `height` auto-inferred to prevent layout shift. Override with CSS:

```svelte
<style>
	.hero-image img {
		width: var(--size);
		height: auto;
	}
</style>
```

### srcset and sizes

For large images, specify `sizes` to serve smaller versions on smaller devices:

```svelte
<enhanced:img src="./image.png" sizes="min(1280px, 100vw)"/>
```

Custom widths with `w` parameter (smallest auto-generated is 540px):

```svelte
<enhanced:img
  src="./image.png?w=1280;640;400"
  sizes="(min-width:1920px) 1280px, (min-width:1080px) 640px, (min-width:768px) 400px"
/>
```

Without `sizes`, generates 2x and 1x resolution images.

### Per-image Transforms

Apply transforms via query string:

```svelte
<enhanced:img src="./path/to/your/image.jpg?blur=15" alt="An alt text" />
```

[Full directive list](https://github.com/JonasKruckenberg/imagetools/blob/main/docs/directives.md).

## Dynamic CDN Images

For images not available at build time (CMS, backend), use CDNs. Libraries:
- [`@unpic/svelte`](https://unpic.pics/img/svelte/) - CDN-agnostic
- [Cloudinary](https://svelte.cloudinary.dev/)
- CMS-specific: Contentful, Storyblok, Contentstack

## Best Practices

- Mix solutions as needed per use case
- Serve via CDN to reduce latency
- Provide 2x resolution source images for HiDPI
- Use `sizes` for images larger than ~400px
- For LCP images: set `fetchpriority="high"`, avoid `loading="lazy"`
- `width`/`height` prevent layout shift (auto-added by enhanced-img)
- Always provide `alt` text (compiler warns if missing)
- Don't use `em`/`rem` in `sizes` or change their default size with CSS