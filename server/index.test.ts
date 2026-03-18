import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { usersTable } from "./database/schema";
import { createTestApp, type TestApp } from "./test/test-helpers";

describe("/api/users", () => {
  let testApp: TestApp;

  beforeEach(async () => {
    testApp = await createTestApp();
  });

  afterEach(() => {
    testApp.cleanup();
  });

  it("returns users from the injected database", async () => {
    await testApp.db.insert(usersTable).values({
      name: "Ada Lovelace",
      age: 36,
      email: "ada@example.com",
    });

    const response = await testApp.api.users.get();

    expect(response.data).toEqual([
      {
        id: 1,
        name: "Ada Lovelace",
        age: 36,
        email: "ada@example.com",
      },
    ]);
  });

  it("creates a user in the injected database", async () => {
    const response = await testApp.api.users.post({
      data: {
        name: "Grace Hopper",
        age: 85,
        email: "grace@example.com",
      },
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      id: 1,
      name: "Grace Hopper",
      age: 85,
      email: "grace@example.com",
    });

    expect(await testApp.db.select().from(usersTable)).toEqual([
      {
        id: 1,
        name: "Grace Hopper",
        age: 85,
        email: "grace@example.com",
      },
    ]);
  });
});
