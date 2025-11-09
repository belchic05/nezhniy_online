
# Нежный онлайн — статический сайт (GitHub Pages)

Готовая верстка под **Project Pages**: `https://belchic05.github.io/nezhniy_online/`

## Быстрый просмотр
Откройте `index.html` двойным кликом (или поднимите простой `http-server`).

## Деплой на GitHub Pages (Project mode)
1. Создайте репозиторий **nezhniy_online** в аккаунте `belchic05` и **загрузите содержимое ZIP** в корень.
2. В **Settings → Pages** выберите **Source: GitHub Actions**.
3. Откройте вкладку **Actions** и дождитесь выполнения workflow.
4. Готово: `https://belchic05.github.io/nezhniy_online/`

### `<base href>`
В `<head>` прописан `<base href="/nezhniy_online/">`, поэтому **все пути относительные** и сайт корректно работает по адресу вида `/nezhniy_online/`. Если перенесёте в корень домена — замените `<base href="/">`.

## Кастомизация
- **Лого/цвета/шрифты**: правьте `assets/css/styles.css`, `assets/img/*` и локальные шрифты (woff2). Сейчас подключены placeholder‑шрифты — браузер упадёт на системный fallback.
- **Контент**: редактируйте `data/*.json`. Ререндер происходит на клиенте при загрузке страницы.
- **Изображения**: храните webp/ png в `assets/img/`. В примере используются плейсхолдеры.

## Формы
Поддержаны 3 варианта. По умолчанию — **Formspree**:
- Замените `assets/js/forms.js` → `DEFAULT_FORMSPREE` на ваш endpoint.
- В каждую форму добавлено скрытое поле `source=nezhny-online`.

**Google Apps Script** (рекомендуется для логирования):
1. Создайте Google Sheet с колонками: `date, page, name, email, phone, message, tariff, promoCode, promoValidUntil`.
2. В Apps Script создайте проект и вставьте `apps-script/Code.gs`.
3. **Publish → Deploy as web app**, выберите доступ «Anyone». Скопируйте URL.
4. В `assets/js/forms.js` пропишите `APPS_SCRIPT_URL = "ВАШ_URL"` и замените `data-method="formspree"` на `data-method="apps_script"`.

**mailto (fallback)**: кнопка «Отправить через почтовый клиент» формирует письмо на адрес из `MAILTO`.

## Промокоды
Модуль `assets/js/promocode.js` генерирует код (A–Z0–9, 4 символа), хранит `{ code, amount, createdAt, expiresAt }` в `localStorage` на 24 часа и пересчитывает цены. Кнопкам достаточно указать `data-promo-generate`/`data-promo-apply`, `data-target` (id цены) и скидку `data-discount`.

## SEO
- Заголовки, `meta description`, `canonical`, OG/Twitter теги.
- `sitemap.xml` и `robots.txt` с ссылкой на сайт.
- Хлебные крошки формируются скриптом из названия страницы.

## Аналитика (GA4, опционально)
В `assets/js/main.js` задайте `window.__CONFIG__.ANALYTICS_ID = "G-XXXXXXXX"` — скрипт сам подключит `gtag.js`.

## Безопасность
На «чистом» GitHub Pages нет серверной части. Не храните секреты/токены в клиентском JS. Для учёта заявок используйте Apps Script.

---

© Нежный онлайн
