// js/config.js (добавьте в ваш проект и укажите значения)
/*
  CMS_ENDPOINT — URL опубликованного Google Apps Script (Web App), который:
    - проверит adminKey,
    - обновит файлы JSON в репозитории (path+content),
    - ЗАГРУЗИТ изображения ('uploads': [{path, content_b64, content_type}]).
  ADMIN_KEY — локальная проверка для UX; настоящий ключ хранится в Apps Script (Script Properties).
*/
window.CMS_ENDPOINT = ""; // ← вставьте URL вашего Web App (заканчивается на /exec)
window.ADMIN_KEY = "замените-на-сильный-ключ";
