import { getHealth } from "@calendar/api-client";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, expect, it } from "vitest";

import { buildApp } from "./app";

let app: FastifyInstance;
let baseUrl: string;

beforeAll(async () => {
  app = buildApp();
  await app.listen({ host: "127.0.0.1", port: 0 });

  const address = app.server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Expected the server to listen on a TCP port");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await app.close();
});

it("starts and serves the health endpoint described by the contract", async () => {
  const { data, error, response } = await getHealth({ baseUrl });

  expect(response?.status).toBe(200);
  expect(error).toBeUndefined();
  expect(data).toEqual({ status: "ok" });
});
