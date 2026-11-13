import { buildApp } from "./app";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

const app = buildApp({
  logger: true,
  publicDir: process.env.PUBLIC_DIR,
});

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, "Shutting down");
  await app.close();
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
