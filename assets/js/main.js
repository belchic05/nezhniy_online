
// Basic utilities & active nav
(function(){ 
  const path = (location.pathname || '').split('/').pop() || 'index.html';
  const links = document.querySelectorAll('nav a');
  links.forEach(a => { if(a.getAttribute('href')===path || (path==='index.html' && a.getAttribute('href')==='news.html' && false)) a.classList.add('is-active'); });
  // Breadcrumbs
  const bc = document.getElementById('breadcrumbs');
  if (bc) {
    const parts = path==='index.html' ? [] : [{ name:'Главная', href:'./' }, { name: document.title.replace(' — Нежный онлайн',''), href: path }];
    bc.innerHTML = parts.map((p,i)=> i===0 ? `<a href="${p.href}">${p.name}</a>` : `<span aria-current="page">${p.name}</span>`).join(' › ');
  }
  // Latest news on index
  if (path==='' || path==='index.html') {
    fetch('data/news.json').then(r=>r.json()).then(all => {
      const latest = all.slice(0,6);
      const wrap = document.getElementById('news-latest');
      latest.forEach(n => {
        const el = document.createElement('article');
        el.className='card fade-in';
        el.innerHTML=`<img class="img" src="${n.image}" alt="${n.title}" loading="lazy"><div class="badge">${new Date(n.date).toLocaleDateString('ru-RU')}</div><h3>${n.title}</h3><p>${n.excerpt}</p>`;
        wrap && wrap.appendChild(el);
      });
    });
    // Speakers preview
    fetch('data/speakers.json').then(r=>r.json()).then(all => {
      const wrap = document.getElementById('speakers-home');
      if (!wrap) return;
      all.slice(0,8).forEach(s => {
        const el = document.createElement('article');
        el.className='card fade-in';
        el.innerHTML = `<img class="img" src="${s.photo}" alt="Фото: ${s.name}" loading="lazy"><h3>${s.name}</h3><p>${s.role}</p>`;
        wrap.appendChild(el);
      });
    });
  }
  // Analytics (optional)
  const GA = (window.__CONFIG__||{}).ANALYTICS_ID;
  if (GA && /^G-/.test(GA)) {
    const gtag = document.createElement('script');
    gtag.async = true;
    gtag.src = 'https://www.googletagmanager.com/gtag/js?id='+GA;
    document.head.appendChild(gtag);
    window.dataLayer = window.dataLayer || [];
    function gtagf(){dataLayer.push(arguments);}
    gtagf('js', new Date());
    gtagf('config', GA);
  }
})();


/* === Inject three-dots mobile menu === */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header.site-header .container');
  const nav = document.querySelector('header.site-header nav ul');
  if (!header || !nav) return;

  // create kebab button
  const btn = document.createElement('button');
  btn.className = 'menu-dots';
  btn.type = 'button';
  btn.setAttribute('aria-label','Открыть меню');
  btn.setAttribute('aria-expanded','false');
  btn.innerText = '⋯';

  // backdrop and panel
  const backdrop = document.createElement('div');
  backdrop.className = 'mobile-menu__backdrop';
  backdrop.setAttribute('role','dialog');
  backdrop.setAttribute('aria-modal','true');
  backdrop.setAttribute('id','mobile-menu');

  const panel = document.createElement('div');
  panel.className = 'mobile-menu__panel';
  backdrop.appendChild(panel);

  // clone list
  const list = document.createElement('ul');
  list.className = 'mobile-menu__list';
  Array.from(nav.querySelectorAll('a')).forEach(a => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'mobile-menu__link';
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    li.appendChild(link);
    list.appendChild(li);
  });
  panel.appendChild(list);

  // append to DOM
  header.appendChild(btn);
  document.body.appendChild(backdrop);

  function openMenu(){
    backdrop.classList.add('is-open');
    btn.setAttribute('aria-expanded','true');
  }
  function closeMenu(){
    backdrop.classList.remove('is-open');
    btn.setAttribute('aria-expanded','false');
  }
  btn.addEventListener('click', (e)=> {
    const open = btn.getAttribute('aria-expanded') === 'true';
    open ? closeMenu() : openMenu();
  });
  backdrop.addEventListener('click', (e)=> {
    if (e.target === backdrop) closeMenu();
  });
  document.addEventListener('keydown', (e)=> {
    if (e.key === 'Escape') closeMenu();
  });
  // Close after navigation
  backdrop.addEventListener('click', (e)=> {
    if (e.target.closest('a.mobile-menu__link')) closeMenu();
  });
});
