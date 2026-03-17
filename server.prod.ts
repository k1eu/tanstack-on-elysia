import Elysia from "elysia";
import { backend } from "./api/index";
import { staticPlugin } from "@elysiajs/static";

const app = new Elysia().use(backend);

// Production: serve static assets from dist/client
app.use(
  staticPlugin({
    assets: "./dist/client",
    prefix: "/",
    alwaysStatic: true,
  }),
);

// Production: load the pre-built TanStack Start handler
// @ts-ignore
const { default: handler } = await import("./dist/server/server.js");
app.all("*", ({ request }) => handler.fetch(request));

app.listen(
  {
    port: Number(process.env.PORT ?? 3000),
  },
  () => console.log(`Server running on localhost:${process.env.PORT ?? 3000}`),
);
