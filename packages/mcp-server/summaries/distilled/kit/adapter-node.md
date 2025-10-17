# adapter-node

Generates a standalone Node server.

## Usage

Install and configure:

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
```

## Deploying

Build with `npm run build`. Creates production server in output directory (default: `build`).

Need: output directory, `package.json`, and production `node_modules`. Generate production deps:
```sh
npm ci --omit dev
```

Start server:
```sh
node build
```

**Dev dependencies** are bundled via Rollup. **Dependencies** are externalized. Control this via `package.json` placement.

### Compressing responses

Use reverse proxy compression for better performance (Node is single-threaded). If using custom server middleware, use [`@polka/compression`](https://www.npmjs.com/package/@polka/compression) (supports streaming, unlike `compression` package).

## Environment variables

- **Dev/preview**: Reads `.env` files automatically
- **Production**: `.env` files NOT auto-loaded

Load in production:
```sh
# Using dotenv
node -r dotenv/config build

# Node.js v20.6+
node --env-file=.env build
```

### `PORT`, `HOST` and `SOCKET_PATH`

Default: `0.0.0.0:3000`

```sh
HOST=127.0.0.1 PORT=4000 node build
```

Use socket path (ignores HOST/PORT):
```sh
SOCKET_PATH=/tmp/socket node build
```

### `ORIGIN`, `PROTOCOL_HEADER`, `HOST_HEADER`, and `PORT_HEADER`

Set origin directly:
```sh
ORIGIN=https://my.site node build
```

Or use headers (only behind trusted reverse proxy):
```sh
PROTOCOL_HEADER=x-forwarded-proto HOST_HEADER=x-forwarded-host node build
```

Standard headers: `x-forwarded-proto`, `x-forwarded-host`, `x-forwarded-port` (set via `PORT_HEADER`).

**Incorrect URL causes error**: "Cross-site POST form submissions are forbidden"

### `ADDRESS_HEADER` and `XFF_DEPTH`

`event.getClientAddress()` returns connecting IP by default. Behind proxies, set:

```sh
ADDRESS_HEADER=True-Client-IP node build
```

For `X-Forwarded-For`, set `XFF_DEPTH` to number of trusted proxies (reads from right to avoid spoofing):

```sh
XFF_DEPTH=3
```

### `BODY_SIZE_LIMIT`

Max request body size. Default: `512kb`. Supports units: `K`, `M`, `G`. Disable with `Infinity`.

### `SHUTDOWN_TIMEOUT`

Seconds to wait before force-closing connections on `SIGTERM`/`SIGINT`. Default: `30`.

### `IDLE_TIMEOUT`

With systemd socket activation: seconds of inactivity before auto-sleep. Unset = runs continuously.

## Options

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// default options are shown
			out: 'build',
			precompress: true,
			envPrefix: ''
		})
	}
};

export default config;
```

### out

Build directory. Default: `build`.

### precompress

Gzip/brotli precompression for assets and prerendered pages. Default: `true`.

### envPrefix

Prefix for environment variables:

```js
envPrefix: 'MY_CUSTOM_';
```

```sh
MY_CUSTOM_HOST=127.0.0.1 MY_CUSTOM_PORT=4000 node build
```

## Graceful shutdown

On `SIGTERM`/`SIGINT`:
1. Rejects new requests
2. Waits for pending requests to finish
3. Closes remaining connections after `SHUTDOWN_TIMEOUT`

Listen to shutdown event:

```js
// @errors: 2304
process.on('sveltekit:shutdown', async (reason) => {
  await jobs.stop();
  await db.close();
});
```

`reason` values: `SIGINT`, `SIGTERM`, `IDLE`

## Socket activation

Use systemd for on-demand scaling. Adapter listens on file descriptor 3 when `LISTEN_PID` and `LISTEN_FDS` are set.

1. Create service:

```ini
/// file: /etc/systemd/system/myapp.service
[Service]
Environment=NODE_ENV=production IDLE_TIMEOUT=60
ExecStart=/usr/bin/node /usr/bin/myapp/build
```

2. Create socket:

```ini
/// file: /etc/systemd/system/myapp.socket
[Socket]
ListenStream=3000

[Install]
WantedBy=sockets.target
```

3. Enable:
```sh
sudo systemctl daemon-reload
sudo systemctl enable --now myapp.socket
```

## Custom server

Adapter creates `index.js` (standalone server) and `handler.js` (export for custom servers).

```js
// @errors: 2307 7006
/// file: my-server.js
import { handler } from './build/handler.js';
import express from 'express';

const app = express();

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
	res.end('ok');
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);

app.listen(3000, () => {
	console.log('listening on port 3000');
});
```

Works with Express, Connect, Polka, or `http.createServer`.