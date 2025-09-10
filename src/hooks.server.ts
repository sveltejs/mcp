import { http_transport } from '$lib/mcp';

export async function handle({ event, resolve }) {
	return (await http_transport.respond(event.request)) ?? resolve(event);
}
