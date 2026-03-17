import Elysia from "elysia";
import { openapi } from "@elysiajs/openapi";

const backend = new Elysia({
  prefix: "/api",
})
  .use(openapi())
  .get("/hello", () => "Hello from the backend!")
  .get("/data", () => ({ message: "This is some data from the backend." }));

export { backend };
export type Backend = typeof backend;
