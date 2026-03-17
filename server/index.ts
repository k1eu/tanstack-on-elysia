import Elysia from "elysia";

const backend = new Elysia({
  prefix: "/api",
})
  .get("/hello", () => "Hello from the backend!")
  .get("/data", () => ({ message: "This is some data from the backend." }));

export { backend };
export type Backend = typeof backend;
