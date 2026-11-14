# Contributing

## Требования

- [mise](https://mise.jdx.dev/) — версии Node.js, pnpm и инструментов проверок.
- Docker — только для сборки и запуска контейнера.

## Установка

```bash
mise install
mise run setup
mise exec -- hk install --mise
```

`mise run setup` выполняет `pnpm install --frozen-lockfile`. Команда `hk install --mise` один раз устанавливает Git-хуки в текущий клон.

## Запуск

```bash
mise run dev
```

Поднимаются два daemon-процесса:

- API — http://localhost:3000/api/health
- Web — http://localhost:5173

Управление:

```bash
mise daemons status
mise daemons logs
mise daemons stop
```

## Проверки

```bash
mise run check   # codegen + lint + typecheck + test + build
mise run lint
mise run typecheck
mise run test
mise run build
mise run fix
mise run test:e2e
```

`mise run check` включает браузерный E2E. Перед первым запуском установите Chromium: `mise run setup:e2e`.

`mise run check` — та же команда, которую запускает GitHub Actions. Отдельно можно проверить контейнер:

```bash
mise run docker:build
mise run docker:run
mise run docker:stop
```

## Контракт и генерация

Источник правды — `packages/contract/main.tsp`. После его изменения:

```bash
mise run codegen
```

Команда пересобирает `packages/contract/openapi/openapi.json` (OpenAPI 3.1) и клиент в `packages/api-client/src`. Сгенерированные файлы коммитятся в репозиторий, но не редактируются руками. CI проверяет, что после генерации рабочее дерево остаётся чистым.

## Git-хуки

Конфигурация — `hk.pkl`:

- pre-commit — Oxlint и Oxfmt по staged-файлам;
- commit-msg — Conventional Commits;
- pre-push — `mise run check`.

## Коммиты

Формат — Conventional Commits:

```text
feat(api): add meeting types endpoint
fix(web): handle empty slot list
chore: update dependencies
```

Допустимые типы: `feat`, `fix`, `chore`, `docs`, `test`, `ci`, `refactor`.
Если коммит закрывает тикет, добавьте его номер: `feat: ... (#14)`.
