import { createIsomorphicFn } from "@tanstack/react-start";
import { treaty } from "@elysiajs/eden";
import { type Backend, backend } from "server";

export const getTreaty = createIsomorphicFn()
  .server(() => treaty(backend).api)
  .client(() => treaty<Backend>("localhost:3000").api);
