import { postToSheets } from './sheets.js';

const DAY_MS = 24 * 60 * 60 * 1000;
function randomCode(len=4){
  // cryptographically strong when available
  const alphabet = 'ABCDEFGHJKMNPQRSTUVXYZ23456789';
  let code = '';
  if (window.crypto && crypto.getRandomValues){
    const buf = new Uint32Array(len);
    crypto.getRandomValues(buf);
    for (let i=0;i<len;i++) code += alphabet[ buf[i] % alphabet.length ];
  }else{
    for (let i=0;i<len;i++) code += alphabet[Math.floor(Math.random()*alphabet.length)];
  }
  return code;
}
function keyFor(tariff){ return `promo:${tariff}`; }

async function recordPromoToSheets(tariff, rec){
  const payload = {
    type: 'promo',
    tariff,
    code: rec.code,
    created_at: new Date(rec.ts).toISOString(),
    expires_at: new Date(rec.ts + DAY_MS).toISOString(),
    user_agent: navigator.userAgent,
  };
  await postToSheets(payload);
}

function generatePromo(tariff){
  const now = Date.now();
  const rec = { code: randomCode(4), ts: now };
  localStorage.setItem(keyFor(tariff), JSON.stringify(rec));
  recordPromoToSheets(tariff, rec);
  return rec;
}
function getPromo(tariff){
  const raw = localStorage.getItem(keyFor(tariff));
  if (!raw) return null;
  try{
    const rec = JSON.parse(raw);
    if (!rec?.ts || (Date.now() - rec.ts) > DAY_MS) return null;
    return rec;
  }catch{ return null; }
}
function showPromo(tariff){
  const out = document.querySelector(`[data-code-for="${tariff}"]`);
  if (!out) return;
  const rec = getPromo(tariff) || generatePromo(tariff);
  const exp = new Date(rec.ts + DAY_MS);
  out.innerHTML = `<strong>${rec.code}</strong><br><small>действует до ${exp.toLocaleString('ru-RU')}</small>`;
  out.dataset.code = rec.code;
  out.style.cursor = 'pointer';
  out.title = 'Нажмите, чтобы скопировать';
}

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-generate]');
  if (btn){
    const t = btn.getAttribute('data-generate');
    showPromo(t);
  }
  const out = e.target.closest('output.promo');
  if (out && out.dataset.code){
    navigator.clipboard?.writeText(out.dataset.code);
    out.classList.add('copied');
    setTimeout(()=>out.classList.remove('copied'), 800);
  }
});
