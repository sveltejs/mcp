# Debugging

Debug Svelte/SvelteKit projects using breakpoints in frontend and backend code. Assumes Node.js runtime.

## Visual Studio Code

### Built-in Debug Terminal

1. Open command palette: `CMD/Ctrl` + `Shift` + `P`
2. Launch "Debug: JavaScript Debug Terminal"
3. Start project: `npm run dev`
4. Set breakpoints in source files
5. Trigger breakpoint

### Launch via Debug Pane

Create `.vscode/launch.json`:

```json
{
	"version": "0.2.0",
	"configurations": [
		{
			"command": "npm run dev",
			"name": "Run development server",
			"request": "launch",
			"type": "node-terminal"
		}
	]
}

```

Or auto-generate: Go to "Run and Debug" pane → Select "Node.js..." → Choose run script → Press `F5`

Docs: <https://code.visualstudio.com/docs/editor/debugging>

## Other Editors

- [WebStorm Svelte: Debug Your Application](https://www.jetbrains.com/help/webstorm/svelte.html#ws_svelte_debug)
- [Debugging JavaScript Frameworks in Neovim](https://theosteiner.de/debugging-javascript-frameworks-in-neovim)

## Chrome/Edge DevTools

**Note:** Only works with client-side SvelteKit source maps.

1. Start with `--inspect` flag: `NODE_OPTIONS="--inspect" npm run dev`
2. Open site (typically `localhost:5173`)
3. Open dev tools → Click "Open dedicated DevTools for Node.js" icon (Node.js logo)
4. Set breakpoints

Alternative: Navigate to `chrome://inspect` (Chrome) or `edge://inspect` (Edge)

## References

- [Debugging Node.js](https://nodejs.org/en/learn/getting-started/debugging)