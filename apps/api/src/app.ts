import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { type HealthResponse, zHealthResponse } from "@calendar/api-client";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

export interface BuildAppOptions {
  logger?: FastifyServerOptions["logger"];
  publicDir?: string | undefined;
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.withTypeProvider<ZodTypeProvider>().get(
    "/api/health",
    {
      schema: {
        response: {
          200: zHealthResponse,
        },
      },
    },
    async (): Promise<HealthResponse> => ({ status: "ok" }),
  );

  if (options.publicDir && existsSync(options.publicDir)) {
    app.register(fastifyStatic, {
      root: resolve(options.publicDir),
    });
  }

  return app;
}
