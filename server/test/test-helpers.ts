import { treaty } from "@elysiajs/eden";
import { sql } from "drizzle-orm";
import { createBackend } from "../index";
import { createDb, type AppDb } from "../database/db";

const createUsersTable = async (db: AppDb) => {
  await db.run(sql`
    CREATE TABLE "user" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "name" text NOT NULL,
      "age" integer NOT NULL,
      "email" text NOT NULL UNIQUE
    )
  `);
};

export const createTestApp = async () => {
  const db = createDb(":memory:");
  await createUsersTable(db);

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
