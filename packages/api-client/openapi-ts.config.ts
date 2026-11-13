import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "../contract/openapi/openapi.json",
  output: {
    path: "src",
  },
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
    {
      name: "zod",
      definitions: true,
      requests: true,
      responses: true,
      includeInEntry: true,
    },
  ],
});
