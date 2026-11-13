import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

it("serves the SPA shell for client routes when a public dir is provided", async () => {
  const publicDir = await mkdtemp(join(tmpdir(), "calendar-web-"));
  const webApp = buildApp({ publicDir });

  try {
    await writeFile(
      join(publicDir, "index.html"),
      "<!doctype html><html><head><title>Calendar</title></head></html>",
    );

    const page = await webApp.inject({ method: "GET", url: "/book" });
    expect(page.statusCode).toBe(200);
    expect(page.body).toContain("<title>Calendar</title>");

    const missingApi = await webApp.inject({ method: "GET", url: "/api/missing" });
    expect(missingApi.statusCode).toBe(404);
  } finally {
    await webApp.close();
    await rm(publicDir, { recursive: true, force: true });
  }
});
