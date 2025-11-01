// Rename variables as needed. Keep this file in repo (no secrets here).
// If SHEETS_ENDPOINT left empty, сайт работает в офлайн-режиме: заявки и промокоды пишутся в localStorage.
window.SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycby8urgNrCyO1S_BNWBWH7IzS8LDHZcQL8AvjfETfb5thq5lP8lLgm0M7Oe0NJ7-dxG2iQ/exec"; // e.g. "https://script.google.com/macros/s/AKfycbx.../exec"

// Admin access key (set any strong phrase).
// ВНИМАНИЕ: на статическом сайте это условная защита. Настоящую проверку делайте на стороне Apps Script.
window.ADMIN_KEY = "admin"; // пример: "Nежный_Online_2025_SuperKey"

// Public JSON endpoint для новостей (обычно тот же Web App, но с методом GET).
// Если пусто — news.html использует локальный js/news.json.
window.NEWS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzhOFWRgkg8SSZaWsZTigMQjEzKHRPKNzBba23SklSCK0C2bMeW-bH_oierKmSkSlqoJg/exec"; // e.g. "https://script.google.com/macros/s/AKfycbx.../exec?type=news"
