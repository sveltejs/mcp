import { DATABASE_URL } from '$env/static/private';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = createClient({ url: DATABASE_URL });

export const db = drizzle(client, { schema, logger: true });
