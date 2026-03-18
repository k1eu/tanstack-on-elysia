import Elysia, { t } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { db as defaultDb, type AppDb } from "./database/db";
import { usersTable } from "./database/schema";
import { auth } from "./lib/auth";
import { OpenAPI } from "./modules/auth/auth-openapi";

export const createBackend = async ({ db = defaultDb }: { db?: AppDb } = {}) =>
  new Elysia({
    prefix: "/api",
  })
    .mount(auth.handler)
    .use(
      openapi({
        documentation: {
          components: await OpenAPI.components,
          paths: await OpenAPI.getPaths(),
        },
      }),
    )
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

const backend = await createBackend();

export { backend };
export type Backend = Awaited<ReturnType<typeof createBackend>>;
