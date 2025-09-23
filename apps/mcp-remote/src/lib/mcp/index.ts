import { server } from '@sveltejs/mcp-server';
import { HttpTransport } from '@tmcp/transport-http';

export const http_transport = new HttpTransport(server, {
	cors: true,
});
