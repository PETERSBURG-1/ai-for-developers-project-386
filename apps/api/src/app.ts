import { type HealthResponse, zHealthResponse } from "@calendar/api-client";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { AppError } from "./errors";
import { registerRoutes } from "./routes";
import { Store } from "./store";
import { registerWebStatic } from "./web-static";

export interface BuildAppOptions {
  logger?: FastifyServerOptions["logger"];
  publicDir?: string | undefined;
  store?: Store;
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const store = options.store ?? new Store();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      const details = error.validation.map(
        (validationError) =>
          `${validationError.instancePath.replace(/^\//, "")}: ${validationError.message}`,
      );

      return reply.code(400).send({
        error: {
          code: "validation_error",
          message: "Проверьте заполнение полей",
          details,
        },
      });
    }

    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      });
    }

    request.log.error(error);
    return reply.code(500).send({
      error: {
        code: "internal_error",
        message: "Внутренняя ошибка сервера",
      },
    });
  });

  app.get(
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

  registerRoutes(app, store);
  registerWebStatic(app, options.publicDir);

  return app;
}
