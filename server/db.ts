import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { config } from "./config";

neonConfig.webSocketConstructor = ws;

if (!config.database.url) {
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const missingVar = isProduction ? 'DATABASE_URL_PROD' : 'DATABASE_URL';
  throw new Error(
    `${missingVar} must be set. Did you forget to provision the ${isProduction ? 'production' : 'development'} database?`,
  );
}

console.log(`🔗 Database connected: ${config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
export const pool = new Pool({ connectionString: config.database.url });
export const db = drizzle({ client: pool, schema });