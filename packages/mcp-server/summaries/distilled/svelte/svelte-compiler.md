# svelte/compiler

## Imports

```js
import {
	VERSION,
	compile,
	compileModule,
	migrate,
	parse,
	preprocess,
	walk
} from 'svelte/compiler';
```

## VERSION

Current version from package.json.

```dts
const VERSION: string;
```

## compile

Converts `.svelte` source code into a JavaScript module that exports a component.

```dts
function compile(
	source: string,
	options: CompileOptions
): CompileResult;
```

## compileModule

Converts JavaScript source code containing runes into a JavaScript module.

```dts
function compileModule(
	source: string,
	options: ModuleCompileOptions
): CompileResult;
```

## migrate

Best-effort migration of Svelte code to runes, event attributes, and render tags. May throw if code is too complex.

```dts
function migrate(
	source: string,
	{ filename, use_ts }?: { filename?: string; use_ts?: boolean; }
): { code: string; };
```

## parse

Parses a component and returns its AST. Set `modern: true` for modern AST (default in Svelte 6).

```dts
function parse(
	source: string,
	options: { filename?: string; modern: true; loose?: boolean; }
): AST.Root;
```

## preprocess

Provides hooks for transforming component source code (e.g., converting `<style lang="sass">` to CSS).

```dts
function preprocess(
	source: string,
	preprocessor: PreprocessorGroup | PreprocessorGroup[],
	options?: { filename?: string; }
): Promise<Processed>;
```

## walk

**Deprecated:** Use `import { walk } from 'estree-walker'` instead.

## CompileOptions

```dts
interface CompileOptions extends ModuleCompileOptions {
	name?: string; // Class name, inferred from filename if unspecified
	customElement?: boolean; // Generate custom element constructor (default: false)
	accessors?: boolean; // Create getters/setters for props (default: false, deprecated in runes mode)
	namespace?: Namespace; // Element namespace: 'html', 'svg', 'mathml' (default: 'html')
	immutable?: boolean; // Promise not to mutate objects (default: false, deprecated in runes mode)
	css?: 'injected' | 'external'; // How to handle CSS
	cssHash?: CssHashGetter; // Custom CSS class name generator
	preserveComments?: boolean; // Keep HTML comments (default: false)
	preserveWhitespace?: boolean; // Keep whitespace as typed (default: false)
	fragments?: 'html' | 'tree'; // DOM fragment cloning strategy (default: 'html', since v5.33)
	runes?: boolean | undefined; // Force runes mode on/off/infer (default: undefined, true by default in Svelte 6)
	discloseVersion?: boolean; // Expose Svelte version in browser (default: true)
	compatibility?: {
		componentApi?: 4 | 5; // Svelte 4 instantiation compatibility (default: 5, deprecated)
	};
	sourcemap?: object | string; // Initial sourcemap to merge
	outputFilename?: string; // For JS sourcemap
	cssOutputFilename?: string; // For CSS sourcemap
	hmr?: boolean; // Hot reloading support (default: false)
	modernAst?: boolean; // Return modern AST (default: false, true in Svelte 6)
}
```

**Key options:**
- `css: 'injected'` - styles in `<head>` or shadow root
- `css: 'external'` - CSS returned separately for static generation
- `fragments: 'html'` - faster but requires CSP compatibility
- `fragments: 'tree'` - slower but works with strict CSP

## ModuleCompileOptions

```dts
interface ModuleCompileOptions {
	dev?: boolean; // Runtime checks and debugging (default: false)
	generate?: 'client' | 'server' | false; // Output target (default: 'client')
	filename?: string; // For debugging and sourcemaps
	rootDir?: string; // Prevent filesystem info leaks (default: process.cwd())
	warningFilter?: (warning: Warning) => boolean; // Filter warnings
	experimental?: {
		async?: boolean; // Allow await in deriveds/templates (since v5.36)
	};
}
```

## CompileResult

```dts
interface CompileResult {
	js: {
		code: string;
		map: SourceMap;
	};
	css: null | {
		code: string;
		map: SourceMap;
		hasGlobal: boolean;
	};
	warnings: Warning[];
	metadata: {
		runes: boolean; // Whether compiled in runes mode
	};
	ast: any;
}
```

## Preprocessor Types

### MarkupPreprocessor

```dts
type MarkupPreprocessor = (options: {
	content: string; // Whole Svelte file
	filename?: string;
}) => Processed | void | Promise<Processed | void>;
```

### Preprocessor

```dts
type Preprocessor = (options: {
	content: string; // Script/style tag content
	attributes: Record<string, string | boolean>;
	markup: string; // Whole Svelte file
	filename?: string;
}) => Processed | void | Promise<Processed | void>;
```

### PreprocessorGroup

```dts
interface PreprocessorGroup {
	name?: string; // Will be required in next major version
	markup?: MarkupPreprocessor;
	style?: Preprocessor;
	script?: Preprocessor;
}
```

### Processed

```dts
interface Processed {
	code: string; // New code
	map?: string | object; // Source map
	dependencies?: string[]; // Files to watch
	attributes?: Record<string, string | boolean>; // Updated tag attributes (script/style only)
	toString?: () => string;
}
```

## AST Types

Key AST node types:

- **Root**: `{ type: 'Root', options: SvelteOptions | null, fragment: Fragment, css, instance, module, comments }`
- **Elements**: `Component`, `RegularElement`, `SvelteElement`, `SvelteComponent`, `SvelteSelf`, `SvelteBody`, `SvelteWindow`, `SvelteDocument`, `SvelteHead`, `SvelteBoundary`, `SvelteFragment`, `TitleElement`, `SlotElement`
- **Tags**: `ExpressionTag`, `HtmlTag`, `RenderTag`, `AttachTag`, `ConstTag`, `DebugTag`
- **Blocks**: `EachBlock`, `IfBlock`, `AwaitBlock`, `KeyBlock`, `SnippetBlock`
- **Directives**: `AnimateDirective`, `BindDirective`, `ClassDirective`, `LetDirective`, `OnDirective`, `StyleDirective`, `TransitionDirective`, `UseDirective`
- **Other**: `Text`, `Comment`, `Attribute`, `SpreadAttribute`, `Script`, `Fragment`