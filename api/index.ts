import Elysia, { t } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { db as defaultDb, type AppDb } from "./database/db";
import { usersTable } from "./database/schema";

export const createBackend = ({ db = defaultDb }: { db?: AppDb } = {}) =>
  new Elysia({
    prefix: "/api",
  })
    .use(openapi())
    .get("/hello", () => "Hello from the backend!")
    .get("/data", () => ({ message: "This is some data from the backend." }))
    .get("/users", async () => {
      const users = await db.select().from(usersTable);

      return users;
    })
    .post(
      "/users",
      async ({ body }) => {
        const [user] = await db
          .insert(usersTable)
          .values([body.data])
          .returning();

        return user;
      },
      {
        body: t.Object({
          data: t.Object({
            name: t.String(),
            age: t.Number(),
            email: t.String(),
          }),
        }),
      },
    );

const backend = createBackend();

export { backend };
export type Backend = ReturnType<typeof createBackend>;
