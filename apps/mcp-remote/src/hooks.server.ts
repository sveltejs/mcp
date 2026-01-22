import { dev } from '$app/environment';
import { http_transport } from '$lib/mcp/index.js';
import { db } from '$lib/server/db/index.js';
import { redirect } from '@sveltejs/kit';
import { track } from '@vercel/analytics/server';

export async function handle({ event, resolve }) {
	console.log('MCP Remote request:', event.request.method, event.url.href);
	if (event.request.method === 'GET') {
		const accept = event.request.headers.get('accept');
		if (accept) {
			const accepts = accept.split(',');
			if (!accepts.includes('text/event-stream')) {
				// the request it's a browser request, not an MCP client request
				// it means someone probably opened it from the docs...we should redirect to the docs
				redirect(302, 'https://svelte.dev/docs/mcp/overview');
			}
		}
	}
	const mcp_response = await http_transport.respond(event.request, {
		db,
		// only add analytics in production
		track: dev
			? undefined
			: async (session_id, event, extra) => {
					await track(event, { session_id, ...(extra ? { extra } : {}) });
				},
	});
	// we are deploying on vercel the SSE connection will timeout after 5 minutes...for
	// the moment we are not sending back any notifications (logs, or list changed notifications)
	// so it's a waste of resources to keep a connection open that will error
	// after 5 minutes making the logs dirty. For this reason if we have a response from
	// the MCP server and it's a GET request we just return an empty response (it has to be
	// 200 or the MCP client will complain)
	if (mcp_response && event.request.method === 'GET') {
		try {
			return new Response(null, { status: 405 });
		} finally {
			try {
				await mcp_response.body?.cancel();
			} catch {
				// ignore
			}
		}
	}
	return mcp_response ?? resolve(event);
}
