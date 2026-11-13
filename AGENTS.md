# AGENTS.md

«Календарь звонков» — учебный сервис записи на встречи по мотивам Cal.com.
Монорепозиторий на TypeScript: Fastify + Vite/React, контракт TypeSpec → OpenAPI 3.1 → SDK.

## Команды

Все команды запускаются через mise:

- `mise run setup` — установить зависимости.
- `mise run dev` — поднять API и web как daemons.
- `mise run check` — все проверки: codegen, lint, typecheck, test, build. Обязательна перед завершением изменения.
- `mise run test`, `mise run lint`, `mise run typecheck` — отдельные проверки.
- `mise run codegen` — перегенерировать OpenAPI и клиент после правки TypeSpec.
- `mise run fix` — безопасные автоисправления.
- `mise daemons status`, `mise daemons logs`, `mise daemons stop` — состояние, логи и остановка dev-серверов.

Подробные команды и адреса: [CONTRIBUTING.md](CONTRIBUTING.md).

## Устройство

- `packages/contract` — TypeSpec-контракт, генерирует `openapi/openapi.json` (OpenAPI 3.1).
- `packages/api-client` — сгенерированные SDK, типы и Zod-схемы.
- `apps/api` — Fastify; схемы запросов и ответов берутся из `@calendar/api-client`.
- `apps/web` — Vite + React + Tailwind + shadcn/ui.

## Правила

- Меняйте контракт только в `packages/contract/*.tsp`, затем запускайте `mise run codegen`. Файлы в `packages/contract/openapi` и `packages/api-client/src` сгенерированы — руками не редактируются.
- Коммиты — Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `ci:`, `refactor:`. Формат проверяет commit-msg hook.
- Не отключайте правила линтера или типов, чтобы пройти проверку. Исключение должно быть узким и с причиной.
- Перед завершением изменения `mise run check` должен быть зелёным.
