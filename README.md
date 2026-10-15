# Календарь звонков

[![hexlet-check](https://github.com/arkadiy93/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/arkadiy93/ai-for-developers-project-386/actions)

Разработайте совместно с ИИ сервис для бронирования календаря

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-for-developers
Как это должно работать: https://files.hexlet.app/a/2ipc5m

## Стек

- Монорепозиторий на pnpm workspaces, TypeScript 7
- Backend (`apps/backend`): Express 5, tsx, Vitest + Supertest
- Frontend (`apps/frontend`): Vite, React 19, Tailwind CSS v4, shadcn/ui, Vitest + Testing Library
- Инструменты: oxlint, Prettier, commitlint + husky (Conventional Commits), GitHub Actions, release-please

## Установка

Требуется Node.js 22.13+ и pnpm 9+.

```bash
git clone https://github.com/arkadiy93/ai-for-developers-project-386.git
cd ai-for-developers-project-386
pnpm install
```

## Использование

```bash
pnpm dev          # backend на http://localhost:3000, frontend на http://localhost:5173
pnpm test         # тесты всех пакетов
pnpm lint         # oxlint
pnpm typecheck    # проверка типов
pnpm build        # сборка всех пакетов
pnpm format       # форматирование Prettier
```

Frontend проксирует запросы `/api/*` на backend (см. `apps/frontend/vite.config.ts`).

### Коммиты и релизы

Сообщения коммитов должны соответствовать [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:` …) — это проверяет хук `commit-msg`. На каждый пуш в `main` [release-please](https://github.com/googleapis/release-please-action) обновляет release PR с новой версией и `CHANGELOG.md`; после его мержа создаются тег и GitHub Release.

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
