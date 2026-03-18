import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
export * from "../modules/auth/auth-schema";

export const usersTable = sqliteTable("user", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  age: int().notNull(),
  email: text().notNull().unique(),
});
