import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from './schema/auth';
import * as timeAuditSchema from './schema/time-audit';

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: {
    ...authSchema,
    ...timeAuditSchema,
  },
});

// Re-export all schemas
export * from './schema/auth';
export * from './schema/time-audit';