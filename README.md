# Mesto

Учебный проект Яндекс Практикума: приложение Mesto, подключённое к API `mesto.nomoreparties.co`.

## Ссылка на проект

Опубликованная версия: **TODO: добавьте ссылку на GitHub Pages**

## Запуск проекта

1) Установите зависимости:

```bash
npm install
```

2) Заполните `credentials.json`:

- `GROUP_ID` — идентификатор группы (cohort)
- `TOKEN` — личный токен

3) Запустите dev-сервер:

```bash
npm run dev
```

## Сборка

```bash
npm run build
```

## Публикация

```bash
npm run deploy
```

Также в репозитории есть workflow для автоматического деплоя сборки из `dist` в отдельный публичный репозиторий через GitHub Actions: `.github/workflows/deploy.yml`.
