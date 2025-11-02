
(function(){
  const DEFAULT_FORMSPREE = 'https://formspree.io/f/xxxxxxxx'; // TODO: replace with your Formspree endpoint
  const APPS_SCRIPT_URL = ''; // Optional: paste deployed Apps Script Web App URL
  const MAILTO = 'mailto:radio@example.ru'; // Fallback address

  function serializeForm(form){
    const fd = new FormData(form);
    const obj = {};
    for (const [k,v] of fd.entries()) obj[k] = v;
    // promo
    const promo = (window.NezhnyPromo && window.NezhnyPromo.load && window.NezhnyPromo.load()) || null;
    if (promo && window.NezhnyPromo.isValid(promo)){
      obj.promoCode = promo.code;
      obj.promoValidUntil = new Date(promo.expiresAt).toISOString();
    }
    obj.page = form.getAttribute('data-page') || location.pathname;
    obj.date = new Date().toISOString();
    return obj;
  }

  async function sendFormspree(form, data){
    const endpoint = form.getAttribute('action') || DEFAULT_FORMSPREE;
    const res = await fetch(endpoint, { method:'POST', headers:{'Accept':'application/json'}, body: new FormData(form) });
    return res.ok;
  }

  async function sendAppsScript(form, data){
    if (!APPS_SCRIPT_URL) return false;
    const res = await fetch(APPS_SCRIPT_URL, { method:'POST', mode:'no-cors', body: JSON.stringify(data) });
    return true; // no-cors won't give real status
  }

  function sendMailto(form, data){
    const subject = encodeURIComponent(`Заявка (${data.page})`);
    const body = encodeURIComponent(Object.entries(data).map(([k,v])=>`${k}: ${v}`).join('\n'));
    location.href = `${MAILTO}?subject=${subject}&body=${body}`;
    return true;
  }

  function setAlert(form, text){
    const box = form.querySelector('.alert') || form.querySelector('[role="status"]');
    if (box){ box.textContent = text; }
  }

  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form.js-form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = serializeForm(form);
        const method = (form.getAttribute('data-method') || 'formspree').toLowerCase();
        setAlert(form, 'Отправка…');
        try{
          let ok=false;
          if (method==='apps_script') ok = await sendAppsScript(form, data);
          else ok = await sendFormspree(form, data);
          setAlert(form, ok ? 'Спасибо! Заявка отправлена.' : 'Ошибка отправки. Попробуйте позже.');
          if (ok) form.reset();
        }catch(err){
          console.error(err);
          setAlert(form, 'Ошибка сети. Попробуйте снова.');
        }
      });
      const mailtoBtn = form.querySelector('[data-mailto]');
      if (mailtoBtn){
        mailtoBtn.addEventListener('click', () => {
          const data = serializeForm(form);
          sendMailto(form, data);
        });
      }
    });
  });
})();
