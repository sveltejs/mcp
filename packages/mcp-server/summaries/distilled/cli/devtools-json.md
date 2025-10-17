# devtools-json Add-on

Installs [`vite-plugin-devtools-json`](https://github.com/ChromeDevTools/vite-plugin-devtools-json/) - a Vite plugin that generates a Chromium DevTools settings file at `/.well-known/appspecific/com.chrome.devtools.json`. Enables [workspaces feature](https://developer.chrome.com/docs/devtools/workspaces) to edit source files directly in Chromium browsers.

> [!NOTE]
> Enables feature for all dev server users with Chromium browsers. Allows browser to read/write all files in directory. Chrome's AI Assistance may send data to Google.

## Alternatives

**Disable in browser:** Visit `chrome://flags` and disable "DevTools Project Settings" and "DevTools Automatic Workspace Folders".

**Handle request manually:** Create `.well-known/appspecific/com.chrome.devtools.json` file or add to `handle` hook:

```js
/// file: src/hooks.server.js
import { dev } from '$app/environment';

export function handle({ event, resolve }) {
	if (dev && event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
		return new Response(undefined, { status: 404 });
	}

	return resolve(event);
}
```

## Usage

```sh
npx sv add devtools-json
```

Adds `vite-plugin-devtools-json` to Vite config.