# CMS-админка (без сервера) с загрузкой картинок

Эта версия админки добавляет **загрузку изображений** прямо в репозиторий GitHub. Редактор:
1) Загружает картинки через правую панель (формируется путь `assets/uploads/<entity>/…`).
2) Получает готовые пути и вставляет их в JSON (поле `image`/`photo`/`cover`).
3) Сохраняет JSON кнопкой «Сохранить JSON → GitHub».

## Установка (как и в предыдущей версии)
1) Залейте `admin.html`, `js/admin-cms.js` и `js/config.js` в ваш сайт (GitHub Pages).
2) В `js/config.js` задайте:
   ```js
   window.CMS_ENDPOINT = "ВАШ_URL_из_Apps_Script/exec";
   window.ADMIN_KEY = "сильный_ключ";
   ```
3) В Google Apps Script вставьте `apps_script/Code.gs`, настройте Script Properties:
   - `ADMIN_KEY`
   - `GITHUB_TOKEN` (Contents: Read & write)
   - `GH_REPO`  (пример `belchic05/nezhniy_online`)
   - `GH_BRANCH` (обычно `main`)
   - `GH_BASE_PATH` (опционально, если сайт в подпапке репозитория)
4) Deploy → Web app → Who has access: Anyone → URL в `CMS_ENDPOINT`.

## Как пользоваться редактору
- Вкладка «Новости/Спикеры/Рубрики/Фестивали» → «Загрузить» → правим JSON.
- Справа «Картинки»: выбираем файлы → «Загрузить в GitHub». Появятся пути вида `assets/uploads/news/news-...jpg`.
- Путь автоматически вставится в курсор JSON и скопируется в буфер обмена.
- «Сохранить JSON → GitHub». Через 10–60 секунд статический сайт получит обновления.

## Где лежат файлы
- JSON: в `data/*.json` (как раньше).
- Картинки: по умолчанию в `assets/uploads/<entity>/...`. Путь можно поменять в поле «Папка для загрузки».

## Подсказка по структуре JSON
- Новости: `{ "title":"...", "date":"2025-11-09", "image":"assets/uploads/news/..." }`
- Спикеры: `{ "name":"...", "photo":"assets/uploads/speakers/..." }`
- Рубрики/Фестивали: `{ "title":"...", "cover":"assets/uploads/rubrics/..." }` или как у вас принято.
