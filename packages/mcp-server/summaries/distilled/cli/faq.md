# sv CLI

## Running sv CLI

```bash
npm:  npx sv create
pnpm: pnpx sv create / pnpm dlx sv create
bun:  bunx sv create
deno: deno run npm:sv create
yarn: yarn dlx sv create
```

## Troubleshooting

If `npx sv` doesn't work, package managers may prioritize local tools over registry packages. Common issues:
- Command does nothing
- Name collision with `runit` 
- Windows PowerShell conflict with `Set-Variable`

See: [GitHub issues #472](https://github.com/sveltejs/cli/issues/472), [#259](https://github.com/sveltejs/cli/issues/259), [#317](https://github.com/sveltejs/cli/issues/317)