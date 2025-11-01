import { postToSheets } from './sheets.js';

const loginCard = document.getElementById('login-card');
const newsCard = document.getElementById('news-card');
const listCard = document.getElementById('list-card');

function isAuthed(){
  return localStorage.getItem('admin_auth') === '1';
}
function login(){
  const val = document.getElementById('admin-key').value.trim();
  if (!val){ alert('Введите ключ'); return; }
  if (!window.ADMIN_KEY){
    alert('ADMIN_KEY не задан в js/config.js');
    return;
  }
  if (val === window.ADMIN_KEY){
    localStorage.setItem('admin_auth', '1');
    renderState();
  }else{
    alert('Неверный ключ');
  }
}
function logout(){
  localStorage.removeItem('admin_auth');
  renderState();
}
async function publish(){
  const title = document.getElementById('n-title').value.trim();
  const date  = document.getElementById('n-date').value;
  const text  = document.getElementById('n-text').value.trim();
  const link  = document.getElementById('n-link').value.trim();
  const fileEl= document.getElementById('n-image');
  if (!title || !date || !text){
    alert('Заполните Заголовок, Дату и Текст');
    return;
  }
  let imageB64 = '';
  if (fileEl.files && fileEl.files[0]){
    const f = fileEl.files[0];
    imageB64 = await fileToBase64(f);
  }
  const payload = {
    type:'news-create',
    admin_key: window.ADMIN_KEY || '',
    title, date, text, link,
    image_b64: imageB64,
  };
  const res = await postToSheets(payload);
  if (res && res.ok){
    alert('Новость опубликована');
    // очистим форму
    document.getElementById('n-title').value='';
    document.getElementById('n-date').value='';
    document.getElementById('n-text').value='';
    document.getElementById('n-link').value='';
    document.getElementById('n-image').value='';
    await loadAdminNews();
  }else{
    alert('Ошибка публикации (см. консоль)');
    console.error('Publish error:', res);
  }
}
function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function loadAdminNews(){
  // Получаем новости из NEWS_ENDPOINT (Apps Script)
  const list = document.getElementById('admin-news-list');
  list.innerHTML = '<p>Загрузка…</p>';
  try{
    const ep = (window.NEWS_ENDPOINT || '').trim();
    if (!ep){ list.innerHTML = '<p>NEWS_ENDPOINT не настроен.</p>'; return; }
    const r = await fetch(ep, {cache:'no-store'});
    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0){ list.innerHTML = '<p>Новостей пока нет.</p>'; return; }
    const items = data.map(n => `
      <article class="card news-item">
        <time datetime="${n.date}">${new Date(n.date).toLocaleDateString('ru-RU')}</time>
        <h3>${n.title}</h3>
        ${n.image ? `<img src="${n.image}" alt="${n.title}" style="border-radius:12px;margin:8px 0;">` : ''}
        <p>${n.text}</p>
      </article>
    `).join('');
    list.innerHTML = items;
  }catch(err){
    list.innerHTML = '<p>Ошибка загрузки новостей (см. консоль).</p>';
    console.error(err);
  }
}

function renderState(){
  const authed = isAuthed();
  loginCard.classList.toggle('hidden', authed);
  newsCard.classList.toggle('hidden', !authed);
  listCard.classList.toggle('hidden', !authed);
  if (authed) loadAdminNews();
}

// events
document.getElementById('login-btn')?.addEventListener('click', login);
document.getElementById('publish-btn')?.addEventListener('click', publish);

renderState();
