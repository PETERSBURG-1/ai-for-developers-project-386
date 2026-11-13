# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.14.0
ARG PNPM_VERSION=12.18.0

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm install --global pnpm@${PNPM_VERSION}
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contract/package.json packages/contract/package.json
COPY packages/api-client/package.json packages/api-client/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @calendar/contract generate \
  && pnpm --filter @calendar/api-client generate \
  && pnpm --filter @calendar/web build \
  && pnpm --filter @calendar/api deploy --prod /prod/api

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV PUBLIC_DIR=/app/public
WORKDIR /app
COPY --from=build /prod/api ./
COPY --from=build /app/apps/web/dist ./public
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node_modules/.bin/tsx", "src/server.ts"]
