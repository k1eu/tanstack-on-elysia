import Elysia from "elysia";

const backend = new Elysia().get("/api/hello", () => "Hello from the backend!");
  
export { backend };
