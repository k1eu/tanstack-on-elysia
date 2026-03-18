import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "./lib/auth";
import { user } from "./database/schema";
import { createTestApp, type TestApp } from "./test/test-helpers";

describe("/api/users", () => {
  let testApp: TestApp;

  beforeEach(async () => {
    testApp = await createTestApp();
  });

  afterEach(() => {
    testApp.cleanup();
    vi.restoreAllMocks();
  });

  it("returns users from the injected database", async () => {
    await testApp.db.insert(user).values({
      id: "user_ada",
      name: "Ada Lovelace",
      email: "ada@example.com",
    });

    const response = await testApp.api.users.get();

    expect(response.status).toBe(200);
    expect(response.data).toHaveLength(1);
    expect(response.data?.[0]).toEqual(
      expect.objectContaining({
        id: "user_ada",
        name: "Ada Lovelace",
        email: "ada@example.com",
        emailVerified: false,
        image: null,
      }),
    );
  });

  it("creates a user in the injected database", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue({
      user: {
        id: "session_user",
        name: "Signed In User",
        email: "session@example.com",
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "session_1",
        token: "token_1",
        userId: "session_user",
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
      },
    } as Awaited<ReturnType<typeof auth.api.getSession>>);

    const response = await testApp.api.users.post({
      data: {
        id: "user_grace",
        name: "Grace Hopper",
        email: "grace@example.com",
      },
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual(
      expect.objectContaining({
        id: "user_grace",
        name: "Grace Hopper",
        email: "grace@example.com",
        emailVerified: false,
        image: null,
      }),
    );

    expect(await testApp.db.select().from(user)).toEqual([
      expect.objectContaining({
        id: "user_grace",
        name: "Grace Hopper",
        email: "grace@example.com",
        emailVerified: false,
        image: null,
      }),
    ]);
  });
});
