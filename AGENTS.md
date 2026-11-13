# AGENTS.md

«Календарь звонков» — TypeScript-монорепозиторий (pnpm workspaces): Fastify + Vite/React.
Контракт: TypeSpec → OpenAPI 3.1 → сгенерированные SDK, типы и Zod-схемы.

## Первый запуск

- `mise install` — Node, pnpm, Oxlint, hk по `mise.toml` и `mise.lock`.
- `mise run setup` — `pnpm install --frozen-lockfile`. Без этого не работают `tsc`, Vitest и `oxfmt`.
- `mise exec -- hk install --mise` — один раз на клон, иначе Git-хуков не будет.

## Команды

- `mise run check` — обязательный прогон: codegen → lint → typecheck → test → build. Эту же команду запускает CI.
- `mise run dev` — поднимает API на :3000 и web на :5173 как daemons и сразу возвращает управление.
- `mise daemons status`, `mise daemons logs`, `mise daemons stop` — управление dev-серверами.
- `mise run codegen` — после любой правки `packages/contract/*.tsp`. Без него typecheck и тесты увидят старый SDK.
- `mise run lint`, `typecheck`, `test`, `build` — отдельные проверки.
- Один тест: `mise exec -- pnpm --filter @calendar/api exec vitest run src/app.test.ts`.
- `mise run fix` — автоисправления Oxlint и Oxfmt.
- Docker: `mise run docker:build`, `mise run docker:run`, `mise run docker:stop`.

## Контракт и сгенерированный код

- Источник правды — `packages/contract/main.tsp`; OpenAPI 3.1 пишется в `packages/contract/openapi/openapi.json`.
- `packages/contract/openapi/**` и `packages/api-client/src/**` генерируются. Не редактировать руками; после codegen изменения коммитятся.
- CI падает, если после `mise run check` рабочее дерево не чистое. Генерируйте и коммитьте до push.
- API использует Zod-схемы из `@calendar/api-client`; при изменении контракта правьте `apps/api/src/app.ts`, а не дублируйте схемы вручную.

## Устройство

- `apps/api/src/server.ts` — запуск и graceful shutdown; `apps/api/src/app.ts` — `buildApp()`, который использует тест.
- `apps/web/src/main.tsx` → `App.tsx`. Vite проксирует `/api` на `127.0.0.1:3000`, поэтому фронтенд вызывает SDK по относительным URL.
- Зависимости идут по цепочке `packages/contract` → `packages/api-client` → `apps/api` / `apps/web`.

## Подводные камни

- TypeScript зафиксирован на 6.0.3: `@hey-api/openapi-ts` 0.99 падает на TypeScript 7. Не поднимать версию без проверки codegen.
- `oxfmt` — devDependency корня, а не инструмент mise: npm-бэкенд mise ломал `mise install --locked` на Linux. Не переносить.
- `mise run dev` не блокирует терминал: процессы остаются в фоне, останавливать через `mise daemons stop`.
- Vite использует `strictPort`: если 5173 занят, web daemon не поднимется.
- Docker runtime запускает `tsx src/server.ts` и раздаёт собранный web из `/app/public`; это не сборка через `tsc`.
- shadcn CLI в этом монорепо не настроен: `add` из корня создаёт путь вида `apps/web/@/...`. Компоненты лежат в `apps/web/src/components/ui`, добавляйте вручную или проверяйте целевой путь.
- `.github/workflows/hexlet-check.yml` — файл Хекслета: не удалять, не переименовывать, не редактировать.

## Правила

- Коммиты — Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `ci:`, `refactor:`. Формат проверяет commit-msg hook.
- Не отключайте правила линтера или типов ради зелёного `check`. Исключение должно быть узким и с причиной.
- Перед завершением изменения `mise run check` должен быть зелёным.
