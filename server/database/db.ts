import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

const DEFAULT_DB_URL =
  process.env.SERVER_DB_FILE_NAME ?? "file:server/sqlite.db";

export type AppDb = LibSQLDatabase<typeof schema> & {
  $client: Client;
};

export const createDb = (url = DEFAULT_DB_URL): AppDb => {
  const client = createClient({ url });

  return drizzle({ client, schema });
};

export const db = createDb();
