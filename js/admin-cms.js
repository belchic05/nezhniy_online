// admin-cms.js — JSON + image upload
const TABS = [
  { key:'news', file:'data/news.json', commit:'feat(cms): update news' },
  { key:'speakers', file:'data/speakers.json', commit:'feat(cms): update speakers' },
  { key:'rubrics', file:'data/rubrics.json', commit:'feat(cms): update rubrics' },
  { key:'festivals', file:'data/festivals.json', commit:'feat(cms): update festivals' },
];

function $(sel){ return document.querySelector(sel); }
function status(msg){ $('#status').textContent = msg || ''; }

function isAuthed(){ return localStorage.getItem('admin_auth') === '1'; }
function getAdminKey(){ return localStorage.getItem('admin_key') || ''; }

function setEntity(key){
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.entity===key));
  const tab = TABS.find(t=>t.key===key);
  if (tab){
    $('#file-path').value = tab.file;
    $('#commit').value = tab.commit;
    $('#upload-dir').value = `assets/uploads/${key}`;
    $('#upload-prefix').value = key;
    status('Выбрано: ' + key);
  }
}

async function loadFile(){
  const path = $('#file-path').value.trim() || 'data/news.json';
  status('Загружаю ' + path + ' …');
  try{
    const res = await fetch(path + '?v=' + Date.now());
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    let text = await res.text();
    try{ text = JSON.stringify(JSON.parse(text), null, 2); }catch{}
    $('#editor').value = text;
    status('Загружено ✓');
  }catch(e){ console.error(e); status('Ошибка загрузки: ' + e.message); }
}

function formatJSON(){
  try{
    const obj = JSON.parse($('#editor').value);
    $('#editor').value = JSON.stringify(obj, null, 2);
    status('JSON валиден ✓');
  }catch(e){ status('Ошибка JSON: ' + e.message); }
}

async function saveJSON(){
  if (!isAuthed()) return alert('Сначала войдите.');
  const cms = window.CMS_ENDPOINT; if (!cms) return alert('Нет CMS_ENDPOINT');
  const adminKey = getAdminKey();
  const path = $('#file-path').value.trim();
  const commit = $('#commit').value.trim() || 'cms: update';
  const content = $('#editor').value;

  try{ JSON.parse(content); }catch(e){
    if(!confirm('JSON имеет ошибку: ' + e.message + '\nОтправить сырые данные?')) return;
  }

  status('Сохраняю JSON → GitHub…');
  try{
    const res = await fetch(cms, {
      method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
      body: JSON.stringify({ adminKey, path, content, commit })
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok || !data.ok) throw new Error(data.error || (res.status + ' ' + res.statusText));
    status('Сохранено ✓ commit: ' + (data.commitSha || 'ok'));
    alert('Готово! Обновление на сайте появится в течение 10–60 секунд.');
  }catch(e){ console.error(e); status('Ошибка: ' + e.message); alert('Ошибка: ' + e.message); }
}

function _fileExt(name){ const i = name.lastIndexOf('.'); return i>0 ? name.slice(i).toLowerCase() : ''; }
function _slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80) || 'img'; }

async function uploadImages(){
  if (!isAuthed()) return alert('Сначала войдите.');
  const cms = window.CMS_ENDPOINT; if (!cms) return alert('Нет CMS_ENDPOINT');
  const adminKey = getAdminKey();
  const dir = $('#upload-dir').value.trim().replace(/^\/+|\/+$/g,'');
  const pref = _slug($('#upload-prefix').value.trim() || 'img');
  const files = $('#upload-files').files;
  if (!files || !files.length) return alert('Выберите изображения');

  const uploads = [];
  for (let i=0;i<files.length;i++){
    const f = files[i];
    const ext = _fileExt(f.name) || (f.type && f.type.includes('png') ? '.png' : '.jpg');
    const safeName = `${pref}-${Date.now()}-${i}${ext}`;
    const path = `${dir}/${safeName}`;
    const b64 = await new Promise((res,rej)=>{
      const r = new FileReader();
      r.onload = () => res(r.result.split(',')[1]);
      r.onerror = rej;
      r.readAsDataURL(f);
    });
    uploads.push({ path, content_b64: b64, content_type: f.type || 'application/octet-stream' });
  }

  $('#upload-log').textContent = 'Загружаю ' + uploads.length + ' файл(ов)…';
  try{
    const res = await fetch(cms, {
      method:'POST', headers:{'Content-Type':'application/json'}, mode:'cors',
      body: JSON.stringify({ adminKey, uploads })
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok || !data.ok) throw new Error(data.error || (res.status + ' ' + res.statusText));
    const paths = data.items.map(x => x.path);
    $('#upload-log').textContent = 'Готово:\n' + paths.join('\n');

    // вставим пути в JSON на позицию курсора
    const ta = $('#editor');
    const insert = paths.map(p => `"image": "${p.replace(/^\/+/, '')}"`).join(', ');
    const start = ta.selectionStart, end = ta.selectionEnd;
    const val = ta.value;
    ta.value = val.slice(0,start) + insert + val.slice(end);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = start + insert.length;

    // и в буфер обмена
    try { await navigator.clipboard.writeText(paths.join('\n')); } catch {}
  }catch(e){
    console.error(e);
    $('#upload-log').textContent = 'Ошибка: ' + e.message;
    alert('Ошибка загрузки: ' + e.message);
  }
}

function login(){
  const val = $('#admin-key').value.trim();
  if (!val) return alert('Введите ключ');
  if (!window.ADMIN_KEY) return alert('ADMIN_KEY не задан в js/config.js');
  if (val !== window.ADMIN_KEY) return alert('Неверный ключ');
  localStorage.setItem('admin_auth','1');
  localStorage.setItem('admin_key',val);
  $('#login-card').classList.add('hidden');
  $('#cms-card').classList.remove('hidden');
  setEntity('news');
  loadFile();
}

function init(){
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => setEntity(t.dataset.entity)));
  $('#btn-load').addEventListener('click', loadFile);
  $('#btn-format').addEventListener('click', formatJSON);
  $('#btn-save').addEventListener('click', saveJSON);
  $('#btn-upload').addEventListener('click', uploadImages);
  $('#login-btn').addEventListener('click', login);
  if (isAuthed()){
    $('#login-card').classList.add('hidden');
    $('#cms-card').classList.remove('hidden');
    setEntity('news'); loadFile();
  }
}
init();
