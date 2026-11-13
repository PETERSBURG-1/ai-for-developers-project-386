# AGENTS.md

«Календарь звонков» — TypeScript-монорепозиторий (pnpm): Fastify + Vite/React.
Контракт: TypeSpec → OpenAPI 3.1 → сгенерированные SDK, типы и Zod-схемы.

## Команды

- `mise install` — установить инструменты.
- `mise run setup` — установить зависимости.
- `mise run dev` — поднять API :3000 и web :5173 как daemons; остановка — `mise daemons stop`.
- `mise run check` — codegen, lint, typecheck, test, build. Обязательна перед завершением изменения.
- `mise run test`, `mise run lint`, `mise run typecheck`, `mise run codegen` — отдельные задачи.

Подробные команды и адреса: [CONTRIBUTING.md](CONTRIBUTING.md).

## Устройство

- `packages/contract` — TypeSpec-контракт, генерирует OpenAPI 3.1.
- `packages/api-client` — сгенерированные SDK, типы и Zod-схемы.
- `apps/api` — Fastify, использует `@calendar/api-client`.
- `apps/web` — Vite + React + Tailwind + shadcn/ui.

## Правила

- Меняйте контракт только в `packages/contract/*.tsp`, затем запускайте `mise run codegen`. Файлы в `packages/contract/openapi/**` и `packages/api-client/src/**` сгенерированы — руками не редактируются.
- Коммиты — Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `ci:`, `refactor:`. Формат проверяет commit-msg hook.
- TypeScript зафиксирован на 6.0.3: не поднимайте до проверки `mise run codegen`.
- Не отключайте правила линтера или типов ради зелёного `check`.
- Перед завершением изменения `mise run check` должен быть зелёным.
