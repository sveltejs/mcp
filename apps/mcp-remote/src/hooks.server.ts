import { http_transport } from '$lib/mcp/index.js';
import { db } from '$lib/server/db/index.js';
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
	if (event.request.method === 'GET') {
		const accept = event.request.headers.get('accept');
		if (accept) {
			const accepts = accept.split(',');
			if (!accepts.includes('text/event-stream') && event.url.pathname.startsWith('/mcp')) {
				// the request it's a browser request, not an MCP client request
				// it means someone probably opened it from the docs...we should redirect to the docs
				redirect(302, 'https://svelte.dev/docs/mcp/overview');
			}
		}
	}
	const mcp_response = await http_transport.respond(event.request, {
		db,
	});
	// we are deploying on vercel the SSE connection will timeout after 5 minutes...for
	// the moment we are not sending back any notifications (logs, or list changed notifications)
	// so it's a waste of resources to keep a connection open that will error
	// after 5 minutes making the logs dirty. For this reason if we have a response from
	// the MCP server and it's a GET request we just return an empty response (it has to be
	// 200 or the MCP client will complain)
	if (mcp_response && event.request.method === 'GET') {
		try {
			await mcp_response.body?.cancel();
		} catch {
			// ignore
		}
		return new Response('', { status: 200 });
	}
	return mcp_response ?? resolve(event);
}
