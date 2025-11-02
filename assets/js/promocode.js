
(function(){
  const STORAGE_KEY = 'nezhnyPromo';
  function now(){ return Date.now(); }
  function genCode(len=4){
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let s=''; for(let i=0;i<len;i++){ s += alphabet[Math.floor(Math.random()*alphabet.length)]; }
    return s;
  }
  function savePromo(code, amount){
    const createdAt = now();
    const expiresAt = createdAt + 24*60*60*1000; // 24h
    const data = { code, amount, createdAt, expiresAt };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }
  function loadPromo(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch(e){ return null; }
  }
  function isValid(p){ return p && now() < p.expiresAt; }

  function applyToTarget(targetId, amount){
    const el = document.getElementById(targetId);
    if(!el) return;
    const base = parseInt(el.getAttribute('data-base'),10) || 0;
    const newPrice = Math.max(0, base - amount);
    // Update UI
    const parent = el.parentElement;
    let old = parent.querySelector('.old-price');
    if (!old){
      const span = document.createElement('span');
      span.className = 'old-price';
      parent.appendChild(span);
      old = span;
    }
    old.textContent = new Intl.NumberFormat('ru-RU').format(base) + ' ₽';
    el.textContent = new Intl.NumberFormat('ru-RU').format(newPrice) + ' ₽';
  }

  // Bind generate/apply buttons
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-promo-generate]').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = parseInt(btn.getAttribute('data-discount'),10) || 0;
        const code = genCode(4);
        const data = savePromo(code, amount);
        const msg = `Промокод: ${data.code} (скидка ${amount} ₽, действует до ${new Date(data.expiresAt).toLocaleString('ru-RU')})`;
        alert(msg);
        const target = btn.getAttribute('data-target');
        if (target) applyToTarget(target, amount);
      });
    });
    document.querySelectorAll('[data-promo-apply]').forEach(btn => {
      btn.addEventListener('click', () => {
        const data = loadPromo();
        if (!isValid(data)){ alert('Промокод не найден или истёк. Сгенерируйте новый.'); return; }
        const target = btn.getAttribute('data-target');
        if (target) applyToTarget(target, data.amount);
        alert(`Промокод ${data.code} применён. Скидка ${data.amount} ₽`);
      });
    });
  });

  // Expose for forms.js
  window.NezhnyPromo = { load: loadPromo, isValid };
})();
