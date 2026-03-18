import { readFileSync } from "node:fs";
import { treaty } from "@elysiajs/eden";
import { sql } from "drizzle-orm";
import { createBackend } from "../index";
import { createDb, type AppDb } from "../database/db";

const authSchemaSql = readFileSync(
  new URL("../modules/auth/auth-schema.sql", import.meta.url),
  "utf8",
);

const createAuthTables = async (db: AppDb) => {
  for (const statement of authSchemaSql
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)) {
    await db.run(sql.raw(statement));
  }
};

export const createTestApp = async () => {
  const db = createDb(":memory:");
  await createAuthTables(db);

  const app = await createBackend({ db });
  const api = treaty(app).api;

  return {
    db,
    app,
    api,
    cleanup: () => {
      db.$client.close();
    },
  };
};

export type TestApp = Awaited<ReturnType<typeof createTestApp>>;
