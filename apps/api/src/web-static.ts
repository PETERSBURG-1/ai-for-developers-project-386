import { existsSync } from "node:fs";
import { resolve } from "node:path";

import fastifyStatic from "@fastify/static";
import type { FastifyInstance } from "fastify";

export function registerWebStatic(app: FastifyInstance, publicDir: string | undefined): void {
  if (!publicDir) {
    return;
  }

  const root = resolve(publicDir);
  if (!existsSync(root)) {
    return;
  }

  app.register(fastifyStatic, { root });

  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith("/api/")) {
      return reply.code(404).send({ message: "Not Found" });
    }

    return reply.sendFile("index.html");
  });
}
