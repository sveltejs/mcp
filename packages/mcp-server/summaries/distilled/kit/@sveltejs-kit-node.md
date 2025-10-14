# @sveltejs/kit/node

Node.js adapter utilities for converting between Node.js and Web APIs.

## createReadableStream

Converts a file on disk to a readable stream.

```ts
function createReadableStream(file: string): ReadableStream;
```

*Available since 2.4.0*

## getRequest

Converts Node.js `IncomingMessage` to Web `Request`.

```ts
function getRequest({
	request,
	base,
	bodySizeLimit
}: {
	request: import('http').IncomingMessage;
	base: string;
	bodySizeLimit?: number;
}): Promise<Request>;
```

## setResponse

Converts Web `Response` to Node.js `ServerResponse`.

```ts
function setResponse(
	res: import('http').ServerResponse,
	response: Response
): Promise<void>;
```