import { postToSheets } from './sheets.js';

function validateForm(form){
  const name = form.querySelector('[name="name"]')?.value.trim();
  const email = form.querySelector('[name="email"]')?.value.trim();
  const phone = form.querySelector('[name="phone"]')?.value.trim();
  if (!name || !email || !phone) return false;
  const emailOk = /.+@.+\..+/.test(email);
  const phoneOk = phone.replace(/\D/g,'').length >= 10;
  return emailOk && phoneOk;
}
function submitOffline(form, payload){
  const store = JSON.parse(localStorage.getItem('leads') || '[]');
  store.push(payload);
  localStorage.setItem('leads', JSON.stringify(store));
}
async function submitOnline(payload){
  await postToSheets({ type:'lead', ...payload });
}

document.addEventListener('submit', async (e) => {
  const form = e.target.closest('form.form');
  if (!form) return;
  e.preventDefault();
  if (!validateForm(form)){
    alert('Проверьте правильность заполнения полей.');
    return;
  }
  const tariff = form.getAttribute('data-tariff') || 'UNKNOWN';
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.tariff = tariff;
  payload.created_at = new Date().toISOString();
  try{
    await submitOnline(payload);
  }catch{ /* ignore */ }
  submitOffline(form, payload);
  form.reset();
  alert('Спасибо! Заявка отправлена. Мы скоро свяжемся с вами.');
});
