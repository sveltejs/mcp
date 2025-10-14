# OpenTelemetry Tracing

**Available since 2.31** - Experimental feature

## Setup

Enable in `svelte.config.js`:

```js
/// file: svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		experimental: {
			tracing: {
				server: true
			},
			instrumentation: {
				server: true
			}
		}
	}
};

export default config;
```

## What Gets Traced

- `handle` hook and `sequence` functions
- Server `load` functions (including universal `load` on server)
- Form actions
- Remote functions

## Augmenting Spans

Access `root` and `current` spans via request event:

```js
/// file: $lib/authenticate.ts
import { getRequestEvent } from '$app/server';
import { getAuthenticatedUser } from '$lib/auth-core';

async function authenticate() {
	const user = await getAuthenticatedUser();
	const event = getRequestEvent();
	event.tracing.root.setAttribute('userId', user.id);
}
```

## Local Development Setup

Install dependencies:
```sh
npm i @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-proto import-in-the-middle
```

Create `src/instrumentation.server.js`:

```js
/// file: src/instrumentation.server.js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { createAddHookMessageChannel } from 'import-in-the-middle';
import { register } from 'node:module';

const { registerOptions } = createAddHookMessageChannel();
register('import-in-the-middle/hook.mjs', import.meta.url, registerOptions);

const sdk = new NodeSDK({
	serviceName: 'test-sveltekit-tracing',
	traceExporter: new OTLPTraceExporter(),
	instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();
```

View traces at [localhost:16686](http://localhost:16686) with Jaeger.

## Notes

- `src/instrumentation.server.ts` runs before app code (if platform/adapter supports it)
- Tracing has performance overhead - consider dev/preview only
- `@opentelemetry/api` is optional peer dependency, usually satisfied by SDK packages