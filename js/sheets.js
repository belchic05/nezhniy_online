// Helper to send data to Google Apps Script Web App endpoint (optional).
/*
  1) Create a Google Sheet with sheets: "Leads" and "Promos"
  2) Open Apps Script and paste the code from README section "Google Sheets интеграция"
  3) Deploy as Web App (access: Anyone with the link)
  4) Put the deployed URL into js/config.js -> SHEETS_ENDPOINT
*/
export async function postToSheets(payload){
  if (!window.SHEETS_ENDPOINT){
    console.warn('SHEETS_ENDPOINT не задан. Данные будут сохранены только локально.');
    return { ok: false, offline: true };
  }
  try{
    const res = await fetch(window.SHEETS_ENDPOINT, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload),
      redirect:'follow',
      mode:'cors',
    });
    const data = await res.json().catch(()=>({}));
    return { ok: res.ok, ...data };
  }catch(err){
    console.error('Sheets error:', err);
    return { ok:false, error:String(err) };
  }
}
