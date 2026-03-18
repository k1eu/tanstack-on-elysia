import Elysia, { t } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { db as defaultDb, type AppDb } from "./database/db";
import { auth } from "./lib/auth";
import { OpenAPI } from "./modules/auth/auth-openapi";
import { user } from "./database/schema";

export const createBackend = async ({ db = defaultDb }: { db?: AppDb } = {}) =>
  new Elysia({
    prefix: "/api",
  })
    .mount(auth.handler)
    .macro({
      auth: {
        async resolve({ status, request: { headers } }) {
          const session = await auth.api.getSession({
            headers,
          });

          if (!session) return status(401);

          return {
            user: session.user,
            session: session.session,
          };
        },
      },
    })
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
      const users = await db.select().from(user);

      return users;
    })
    .post(
      "/users",
      async ({ body }) => {
        const [userData] = await db
          .insert(user)
          .values([body.data])
          .returning();

        return userData;
      },
      {
        auth: true,
        body: t.Object({
          data: t.Object({
            name: t.String(),
            email: t.String(),
            id: t.String(),
          }),
        }),
      },
    );

const backend = await createBackend();

export { backend };
export type Backend = Awaited<ReturnType<typeof createBackend>>;
