import { backend } from "./server/index";
import Elysia from "elysia";
import { createServer } from "vite";
import { connect } from "elysia-connect-middleware";

const app = new Elysia().use(backend);

const viteDevServer = await createServer({
  server: { middlewareMode: true },
});

// Development: use Vite middleware for HMR and asset serving
app.use(connect(viteDevServer.middlewares));

// Development: dynamically load TanStack Start handler via Vite SSR
app.all("*", async ({ request }) => {
  try {
    const { default: serverEntry } =
      await viteDevServer.ssrLoadModule("./src/tanstack-server.ts");
    return serverEntry.fetch(request);
  } catch (error) {
    if (error instanceof Error) viteDevServer.ssrFixStacktrace(error);
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

app.listen(
  {
    port: Number(process.env.PORT ?? 3000),
  },
  () =>
    console.log(
      `Server running on localhost:${process.env.PORT ?? 3000}  (in development mode)`,
    ),
);
