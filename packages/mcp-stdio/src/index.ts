#! /usr/bin/env node
import { server } from '@sveltejs/mcp-server';
import { StdioTransport } from '@tmcp/transport-stdio';

const transport = new StdioTransport(server);

transport.listen();
