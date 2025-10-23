# sv check

Finds errors and warnings in your project: unused CSS, accessibility hints, JS/TS compiler errors.

Requires Node 16+.

## Installation

```sh
npm i -D svelte-check
```

## Usage

```sh
npx sv check
```

## Options

### `--workspace <path>`
Path to workspace. Checks all subdirectories except `node_modules` and ignored paths.

### `--output <format>`
Display format: `human`, `human-verbose`, `machine`, `machine-verbose`

### `--watch`
Watch mode for changes.

### `--preserveWatchOutput`
Don't clear screen in watch mode.

### `--tsconfig <path>`
Path to `tsconfig`/`jsconfig`. Only files matched by config's `files`/`include`/`exclude` are checked. Reports errors from TS/JS files. If not provided, searches upward from project directory.

### `--no-tsconfig`
Only check Svelte files, ignore `.js`/`.ts` files.

### `--ignore <paths>`
Comma-separated quoted paths relative to workspace root:

```sh
npx sv check --ignore "dist,build"
```

Only effective with `--no-tsconfig` for diagnostics. With `--tsconfig`, only affects watched files.

### `--fail-on-warnings`
Exit with error code on warnings.

### `--compiler-warnings <warnings>`
Comma-separated `code:behaviour` pairs (`ignore` or `error`):

```sh
npx sv check --compiler-warnings "css_unused_selector:ignore,a11y_missing_attribute:error"
```

### `--diagnostic-sources <sources>`
Comma-separated sources (default: all active):
- `js` (includes TypeScript)
- `svelte`
- `css`

```sh
npx sv check --diagnostic-sources "js,svelte"
```

### `--threshold <level>`
Filter diagnostics:
- `warning` (default) — errors and warnings
- `error` — only errors

## Machine-readable output

`--output machine` or `machine-verbose` formats output for CI/automation.

Each row: columns separated by single space. First column: timestamp (ms). Second column: row type.

**START row:** workspace folder (quoted)
```
1590680325583 START "/home/user/language-tools/packages/language-server/test/plugins/typescript/testfiles"
```

**machine format:** filename, line, column, message (quoted)
```
1590680326283 ERROR "codeactions.svelte" 1:16 "Cannot find module 'blubb' or its corresponding type declarations."
1590680326778 WARNING "imported-file.svelte" 0:37 "Component has unused export property 'prop'. If it is for external reference only, please consider using `export const prop`"
```

**machine-verbose format:** ndjson with timestamp prefix
```
1590680326283 {"type":"ERROR","fn":"codeaction.svelte","start":{"line":1,"character":16},"end":{"line":1,"character":23},"message":"Cannot find module 'blubb' or its corresponding type declarations.","code":2307,"source":"js"}
1590680326778 {"type":"WARNING","filename":"imported-file.svelte","start":{"line":0,"character":37},"end":{"line":0,"character":51},"message":"Component has unused export property 'prop'. If it is for external reference only, please consider using `export const prop`","code":"unused-export-let","source":"svelte"}
```

**COMPLETED row:** summary
```
1590680326807 COMPLETED 20 FILES 21 ERRORS 1 WARNINGS 3 FILES_WITH_PROBLEMS
```

**FAILURE row:** runtime errors
```
1590680328921 FAILURE "Connection closed"
```

## FAQ

**Why no option to check only specific files?**
`svelte-check` needs the whole project for valid checks. Partial checks miss errors in unchanged files (e.g., renamed prop not updated at usage sites).