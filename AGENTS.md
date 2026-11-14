# AGENTS.md

«Календарь звонков» — TypeScript-монорепозиторий (pnpm): Fastify + Vite/React.
Контракт: TypeSpec → OpenAPI 3.1 → сгенерированные SDK, типы и Zod-схемы.

## Команды

- `mise install` — установить инструменты.
- `mise run setup` — установить зависимости.
- `mise run dev` — поднять API :3000 и web :5173 как daemons; остановка — `mise daemons stop`.
- `mise run check` — codegen, lint, typecheck, test, build и браузерный E2E. Обязательна перед завершением изменения.
- `mise run test`, `mise run lint`, `mise run typecheck`, `mise run codegen` — отдельные задачи.
- `mise run test:e2e` — браузерный сценарий Playwright с реальными API и web.

Подробные команды и адреса: [CONTRIBUTING.md](CONTRIBUTING.md).

## Устройство

- `packages/contract` — TypeSpec-контракт, генерирует OpenAPI 3.1.
- `packages/api-client` — сгенерированные SDK, типы и Zod-схемы.
- `apps/api` — Fastify, использует `@calendar/api-client`.
- `apps/web` — Vite + React + Tailwind + shadcn/ui.

## Правила

- Меняйте контракт только в `packages/contract/*.tsp`, затем запускайте `mise run codegen`. Файлы в `packages/contract/openapi/**` и `packages/api-client/src/**` сгенерированы — руками не редактируются.
- Коммиты — Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `ci:`, `refactor:`. Формат проверяет commit-msg hook.
- Коммит, закрывающий тикет, ссылается на него в сообщении: `feat: ... (#14)`. GitHub превращает номер в ссылку на тикет.
- TypeScript зафиксирован на 6.0.3: не поднимайте до проверки `mise run codegen`.
- Не отключайте правила линтера или типов ради зелёного `check`.
- Перед завершением изменения `mise run check` должен быть зелёным.

## Agent skills

Набор инженерных скиллов — в `.agents/skills`. В OpenCode вызывайте скилл по имени или через `@.agents/skills/<name>/SKILL.md`.

### Issue tracker

GitHub Issues in `PETERSBURG-1/ai-for-developers-project-386`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/`. See `docs/agents/domain.md`.
