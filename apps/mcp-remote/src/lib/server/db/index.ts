import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';
import { DATABASE_TOKEN, DATABASE_URL } from '$env/static/private';
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (!DATABASE_TOKEN) throw new Error('DATABASE_TOKEN is not set');

const client = createClient({
	url: DATABASE_URL,
	authToken: DATABASE_TOKEN,
});

export const db = drizzle(client, { schema, logger: true });
