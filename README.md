# Нежный онлайн — статический сайт (GitHub Pages-ready)

Полностью статический проект без внешних зависимостей: HTML5, CSS3, Vanilla JS. Дизайн — нежные пастельные тона, mobile-first.

## Структура
```
tender-online-radio/
├── index.html
├── news.html
├── festivals.html
├── categories.html
├── become-speaker.html
├── css/
│   ├── style.css
│   ├── components.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── search-speakers.js
│   ├── promo-codes.js
│   ├── forms.js
│   └── news.json
├── images/
│   ├── logo.png
│   ├── speakers/ (9 фото)
│   ├── festivals/
│   │   └── banners/ (6 баннеров)
│   └── background.jpg
└── README.md
```

## Быстрый старт
1. **Распакуйте архив** и положите содержимое в корень репозитория GitHub.
2. В настройках репозитория включите **GitHub Pages** (ветка `main`, папка `/root`).  
3. Замените тестовые данные на реальные:
   - Фотографии в `images/speakers/`
   - Баннеры фестивалей в `images/festivals/banners/`
   - Ссылки на видео в `festivals.html`
   - Список спикеров в `js/search-speakers.js`
   - Ленту новостей в `js/news.json`
4. При необходимости настройте домен (CNAME).
5. Готово!

## Обновление новостей через JSON
Редактируйте файл `js/news.json`. Формат:
```json
[
  { "date": "2025-11-01", "title": "Заголовок", "text": "Текст", "link": "" }
]
```

## Поиск спикеров
Поле на главной странице фильтрует массив `SPEAKERS` (см. `js/search-speakers.js`) в реальном времени и подсвечивает совпадения через `<mark>`.

## Промокоды
Кнопка генерирует 4‑символьный код (латиница/цифры). Код и время генерации сохраняются в `localStorage` **на 24 часа** для каждого тарифа. Нажать на код — скопировать.

## Формы заявок
Простая валидация email/телефона на фронте + сохранение заявки в `localStorage` (демо). Для продакшн‑отправки подключите ваш бэкенд/Google Forms/Apps Script.

## Производительность
- Семантическая разметка
- Оптимизированные локальные изображения‑заглушки
- Mobile‑first адаптив
- Без внешних библиотек


---

## Google Sheets интеграция (заявки и промокоды)

1. Создайте Google Таблицу с листами **Leads** и **Promos** (первую строку можно оставить пустой — скрипт сам добавит заголовки).
2. Откройте **Extensions → Apps Script** и вставьте код ниже. Обновите `SPREADSHEET_ID` на ID вашей таблицы.
3. **Deploy → New deployment → Web app**. Access: *Anyone with the link*. Скопируйте URL.
4. В файле `js/config.js` проставьте `window.SHEETS_ENDPOINT = "ВAШ_URL";`
5. Готово: формы и генератор промокодов будут писать строки в таблицу.

### Код Apps Script (серверная часть)
```javascript
const SPREADSHEET_ID = 'PASTE_YOUR_SHEET_ID';
const HEADERS = {
  leads: ['timestamp','tariff','name','email','phone','comment','created_at','user_agent'],
  promos: ['timestamp','tariff','code','created_at','expires_at','user_agent']
};
function doPost(e){
  try{
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const now = new Date();
    if (data.type === 'lead'){
      const sh = ss.getSheetByName('Leads') || ss.insertSheet('Leads');
      if (sh.getLastRow() === 0) sh.appendRow(HEADERS.leads);
      sh.appendRow([
        now.toISOString(), data.tariff||'', data.name||'', data.email||'',
        data.phone||'', data.comment||'', data.created_at||'', data.user_agent||''
      ]);
      return ContentService.createTextOutput(JSON.stringify({ok:true, sheet:'Leads'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (data.type === 'promo'){
      const sh = ss.getSheetByName('Promos') || ss.insertSheet('Promos');
      if (sh.getLastRow() === 0) sh.appendRow(HEADERS.promos);
      sh.appendRow([
        now.toISOString(), data.tariff||'', data.code||'',
        data.created_at||'', data.expires_at||'', data.user_agent||''
      ]);
      return ContentService.createTextOutput(JSON.stringify({ok:true, sheet:'Promos'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:'unknown type'}))
      .setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
function doGet(){ return ContentService.createTextOutput('OK'); }
```

> Без URL в `config.js` сайт работает офлайн: заявки и промокоды сохраняются в `localStorage` (демо-режим).


## Админ-панель (статьи/новости)
Файл `admin.html` — скрытая панель. В `js/config.js` задайте `ADMIN_KEY`.  
> На статическом сайте это условная защита (подходит для личного использования). Для реальной защиты — проверяйте ключ на стороне Apps Script.

### Что умеет админка
- Авторизация по ключу
- Публикация новости: **заголовок, дата, текст, ссылка, изображение**
- Запись в Google Таблицу (лист `News`) и загрузка изображения в **Google Drive** (публичная ссылка)
- Просмотр опубликованных новостей
- Сайт `news.html` берёт новости из `NEWS_ENDPOINT` (если указан), иначе из `js/news.json`

### Apps Script (новости + загрузка изображений)
В той же Apps Script, что и для форм, добавьте/замените код на расширенный:

```javascript
const SPREADSHEET_ID = 'PASTE_YOUR_SHEET_ID';
const DRIVE_FOLDER_ID = 'PASTE_YOUR_DRIVE_FOLDER_ID'; // папка для картинок
const HEADERS = {
  leads:  ['timestamp','tariff','name','email','phone','comment','created_at','user_agent'],
  promos: ['timestamp','tariff','code','created_at','expires_at','user_agent'],
  news:   ['timestamp','date','title','text','link','image']
};

function doPost(e){
  try{
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const now = new Date();

    if (data.type === 'lead'){
      const sh = ss.getSheetByName('Leads') || ss.insertSheet('Leads');
      if (sh.getLastRow() === 0) sh.appendRow(HEADERS.leads);
      sh.appendRow([ now.toISOString(), data.tariff||'', data.name||'', data.email||'',
        data.phone||'', data.comment||'', data.created_at||'', data.user_agent||'' ]);
      return json({ok:true, sheet:'Leads'});
    }

    if (data.type === 'promo'){
      const sh = ss.getSheetByName('Promos') || ss.insertSheet('Promos');
      if (sh.getLastRow() === 0) sh.appendRow(HEADERS.promos);
      sh.appendRow([ now.toISOString(), data.tariff||'', data.code||'',
        data.created_at||'', data.expires_at||'', data.user_agent||'' ]);
      return json({ok:true, sheet:'Promos'});
    }

    if (data.type === 'news-create'){
      // простая проверка админ-ключа (минимальная защита)
      if (!data.admin_key || data.admin_key !== 'REPLACE_WITH_ADMIN_KEY'){
        return json({ok:false, error:'unauthorized'});
      }
      const sh = ss.getSheetByName('News') || ss.insertSheet('News');
      if (sh.getLastRow() === 0) sh.appendRow(HEADERS.news);

      let imageUrl = '';
      if (data.image_b64){
        const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        const parts = data.image_b64.split(',');
        const mime = parts[0].match(/data:(.*?);base64/)[1] || 'image/png';
        const bytes = Utilities.base64Decode(parts[1]);
        const blob = Utilities.newBlob(bytes, mime, `news_${Date.now()}.png`);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        imageUrl = file.getUrl();
      }

      sh.appendRow([ now.toISOString(), data.date||'', data.title||'', data.text||'', data.link||'', imageUrl ]);
      return json({ok:true, sheet:'News'});
    }

    return json({ok:false, error:'unknown type'});
  }catch(err){
    return json({ok:false, error:String(err)});
  }
}

function doGet(e){
  try{
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sh = ss.getSheetByName('News');
    if (!sh) return json([]);
    const values = sh.getDataRange().getValues(); // rows incl. headers
    const head = values.shift(); // remove header
    const idx = Object.fromEntries(head.map((h,i)=>[h,i]));
    const items = values.map(r => ({
      date: r[idx['date']] || '',
      title: r[idx['title']] || '',
      text: r[idx['text']] || '',
      link: r[idx['link']] || '',
      image: r[idx['image']] || ''
    })).sort((a,b)=> (new Date(b.date)) - (new Date(a.date)));
    return json(items);
  }catch(err){
    return json({ok:false,error:String(err)});
  }
}

function json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**Важно:** после деплоя замените в коде строку `REPLACE_WITH_ADMIN_KEY` на тот же ключ, что в `js/config.js`.
